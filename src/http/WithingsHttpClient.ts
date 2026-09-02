import { WithingsApiError } from "../errors/WithingsApiError";
import { isRetryableHttpStatus, WithingsHttpError } from "../errors/WithingsHttpError";
import { WithingsResponse } from "../types";
import { ErrorCodeHandler, WithingsResponseStatus } from "../util";
import { IHttpClient } from "./HttpClient";
import { backoffDelay, delay, isDuplicateRequest, resolveRetryOptions, WithingsRetryOptions } from "./retry";

/**
 * The WithingsHttpClient class provides methods for making HTTP requests to the Withings API.
 * Adds Withings semantics on top of {@link HttpClient}: it attaches the bearer
 * token, maps the status code the API returns in the body, and renews an
 * expired access token once before giving up, and backs off and retries when
 * the API rate limits the request.
 */
export class WithingsHttpClient {
  public static readonly API_BASE_URL = "https://wbsapi.withings.net";

  /**
   * @param httpClient  The underlying transport.
   * @param getAccessToken  Reads the *current* access token. This is a getter
   *   rather than a value so the client always sees tokens acquired after
   *   construction (e.g. by `auth.fetchAccessToken()`).
   * @param refreshAccessToken  Renews an expired access token.
   * @param retryOptions  How to behave when the API rate limits a request.
   *   Pass `false` to never retry.
   */
  constructor(
    private readonly httpClient: IHttpClient,
    private readonly getAccessToken: () => string | null,
    private readonly refreshAccessToken: () => Promise<void>,
    retryOptions?: WithingsRetryOptions | false
  ) {
    this.retry = resolveRetryOptions(retryOptions);
  }

  private readonly retry: ReturnType<typeof resolveRetryOptions>;

  /**
   * Sends a GET request to the specified endpoint with the provided options.
   *
   * @param endpoint The endpoint to send the request to.
   * @param options Additional options for the request.
   * @returns A Promise that resolves to the response of the GET request.
   */
  public async get<T>(endpoint: string, options: RequestInit = {}): Promise<WithingsResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, undefined, { ...options, method: "GET" });
  }

  /**
   * Sends a GET request without a bearer token.
   *
   * Some Withings services authorize the request by signature instead, using
   * the client ID and secret. Those work before any user has consented, and
   * attaching an access token to them is wrong rather than merely unnecessary.
   * The signature parameters go in the query string, built by
   * `auth.signedParams()`.
   *
   * Status mapping and retrying behave exactly as for an authenticated call.
   *
   * @param endpoint The endpoint to send the request to.
   * @param options Additional options for the request.
   * @returns The decoded response body.
   */
  public async getSigned<T>(endpoint: string, options: RequestInit = {}): Promise<WithingsResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, undefined, { ...options, method: "GET" }, true, 1, false);
  }

  /**
   * Sends a POST request to the specified endpoint with the provided body.
   *
   * @param endpoint The endpoint to send the request to.
   * @param body The payload to include in the request.
   * @param options Additional options for the request.
   * @returns A Promise that resolves to the response of the POST request.
   */
  public async post<T>(
    endpoint: string,
    body: RequestInit["body"],
    options: RequestInit = {}
  ): Promise<WithingsResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, body, { ...options, method: "POST" });
  }

  /**
   * @param mayRefresh Whether an authentication failure is still allowed to
   *   trigger a token refresh. Cleared once one has been attempted.
   * @param attempt Which attempt this is, counting the first as 1. Used for
   *   the rate limit backoff.
   * @param authenticated Whether to require and attach a bearer token. False
   *   for the services that authorize by signature instead.
   */
  private async fetchWithAuth<T>(
    endpoint: string,
    body?: RequestInit["body"],
    options?: RequestInit,
    mayRefresh: boolean = true,
    attempt: number = 1,
    authenticated: boolean = true
  ): Promise<WithingsResponse<T>> {
    const accessToken = authenticated ? this.getAccessToken() : null;

    if (authenticated && !accessToken) {
      throw new Error(
        "Access token is not set. Call auth.fetchAccessToken(code) first, or pass accessToken in the client config."
      );
    }

    let response: Response;
    try {
      response = await this.httpClient.send(endpoint, body, {
        ...options,
        headers: {
          ...options?.headers,
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
    } catch (error) {
      // A transient HTTP failure is worth another go. The API reports its own
      // problems with a 200 and a status in the body, so reaching here means
      // the request did not get that far.
      if (
        error instanceof WithingsHttpError &&
        isRetryableHttpStatus(error.status) &&
        attempt < this.retry.maxAttempts
      ) {
        const delayMs = this.waitFor(attempt, error);
        this.retry.onRetry?.({ attempt, delayMs, error });
        await delay(delayMs);
        return this.fetchWithAuth(endpoint, body, options, mayRefresh, attempt + 1, authenticated);
      }

      throw error;
    }

    const data = (await response.json()) as WithingsResponse<T>;

    const err = ErrorCodeHandler(data.status);
    if (err !== WithingsResponseStatus.Success) {
      if (err === WithingsResponseStatus.AuthenticationFailed && mayRefresh) {
        // The token may simply have expired: renew it and try once more. The
        // attempt counter is not advanced: this is a different failure from
        // being rate limited, and the two budgets are independent.
        await this.refreshAccessToken();
        return this.fetchWithAuth(endpoint, body, options, false, attempt, authenticated);
      }

      const error = new WithingsApiError(data);

      if (err === WithingsResponseStatus.TooManyRequests && attempt < this.retry.maxAttempts) {
        const delayMs = backoffDelay(attempt, this.retry, Math.random, isDuplicateRequest(error));
        this.retry.onRetry?.({ attempt, delayMs, error });
        await delay(delayMs);
        return this.fetchWithAuth(endpoint, body, options, mayRefresh, attempt + 1, authenticated);
      }

      throw error;
    }

    return data;
  }

  /**
   * How long to wait before retrying a transport failure.
   *
   * A `Retry-After` header is the server saying how long it needs, so it wins
   * over the computed backoff. It is still capped by `maxDelayMs` so a very
   * long header value cannot hang the caller indefinitely.
   */
  private waitFor(attempt: number, error: WithingsHttpError): number {
    const backoff = backoffDelay(attempt, this.retry);
    if (error.retryAfterMs === undefined) return backoff;

    const maxDelayMs = this.retry.maxDelayMs;
    return Math.min(Math.max(error.retryAfterMs, backoff), maxDelayMs);
  }
}
