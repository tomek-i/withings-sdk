import { WithingsResponse } from "../types";
import { ErrorCodeHandler, WithingsResponseStatus } from "../util";
import { IHttpClient } from "./HttpClient";

/**
 * The WithingsHttpClient class provides methods for making HTTP requests to the Withings API.
 * Adds Withings semantics on top of {@link HttpClient}: it attaches the bearer
 * token, maps the status code the API returns in the body, and renews an
 * expired access token once before giving up.
 */
export class WithingsHttpClient {
  public static readonly API_BASE_URL = "https://wbsapi.withings.net";

  /**
   * @param httpClient  The underlying transport.
   * @param getAccessToken  Reads the *current* access token. This is a getter
   *   rather than a value so the client always sees tokens acquired after
   *   construction (e.g. by `auth.fetchAccessToken()`).
   * @param refreshAccessToken  Renews an expired access token.
   */
  constructor(
    private readonly httpClient: IHttpClient,
    private readonly getAccessToken: () => string | null,
    private readonly refreshAccessToken: () => Promise<void>
  ) {}

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

  private async fetchWithAuth<T>(
    endpoint: string,
    body?: RequestInit["body"],
    options?: RequestInit,
    retry: boolean = true
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
      if (err === WithingsResponseStatus.AuthenticationFailed) {
        //TODO: refresh token and retry
        if (retry) {
          await this.refreshAccessToken();
          return this.fetchWithAuth(endpoint, body, options, false);
        } else {
          //TODO: better error logging and messaging as the retry now failed
          throw new Error(data.error);
        }
      } else throw new Error(data.error);
    }

    return data;
  }
}
