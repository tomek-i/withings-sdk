import { WithingsApiError } from "../errors/WithingsApiError";
import { WithingsResponse } from "../types";
import { ErrorCodeHandler, WithingsResponseStatus } from "../util";
import { IHttpClient } from "./HttpClient";
import { backoffDelay, delay, resolveRetryOptions, WithingsRetryOptions } from "./retry";

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
    //TODO: dont like the "as" convert of body
    return this.fetchWithAuth<T>(endpoint, body, { ...options, method: "POST" });
  }

  /**
   * @param mayRefresh Whether an authentication failure is still allowed to
   *   trigger a token refresh. Cleared once one has been attempted.
   * @param attempt Which attempt this is, counting the first as 1. Used for
   *   the rate limit backoff.
   */
  private async fetchWithAuth<T>(
    endpoint: string,
    body?: RequestInit["body"],
    options?: RequestInit,
    mayRefresh: boolean = true,
    attempt: number = 1
  ): Promise<WithingsResponse<T>> {
    const accessToken = this.getAccessToken();

    if (!accessToken) {
      throw new Error(
        "Access token is not set. Call auth.fetchAccessToken(code) first, or pass accessToken in the client config."
      );
    }

    const response = await this.httpClient.send(endpoint, body, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = (await response.json()) as WithingsResponse<T>;

    const err = ErrorCodeHandler(data.status);
    if (err !== WithingsResponseStatus.Success) {
      if (err === WithingsResponseStatus.AuthenticationFailed && mayRefresh) {
        // The token may simply have expired: renew it and try once more. The
        // attempt counter is not advanced: this is a different failure from
        // being rate limited, and the two budgets are independent.
        await this.refreshAccessToken();
        return this.fetchWithAuth(endpoint, body, options, false, attempt);
      }

      const error = new WithingsApiError(data);

      if (err === WithingsResponseStatus.TooManyRequests && attempt < this.retry.maxAttempts) {
        const delayMs = backoffDelay(attempt, this.retry);
        this.retry.onRetry?.({ attempt, delayMs, error });
        await delay(delayMs);
        return this.fetchWithAuth(endpoint, body, options, mayRefresh, attempt + 1);
      }

      throw error;
    }

    return data;
  }
}
