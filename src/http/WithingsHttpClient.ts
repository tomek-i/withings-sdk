import { WithingsResponse } from "@/types";
import { ErrorCodeHandler, WithingsResponseStatus } from "@/util";
import { IHttpClient } from "./HttpClient";

/**
 * The WithingsHttpClient class provides methods for making HTTP requests to the Withings API.
 * It features basic authentication and error handling as well as retry logic.
 */

export class WithingsHttpClient {
  public static readonly API_BASE_URL = "https://wbsapi.withings.net";

  constructor(
    private readonly httpClient: IHttpClient,
    private access_token: string,
    private readonly refreshAccessToken: () => any
  ) {}

  public setAccessToken(accessToken: string) {
    this.access_token = accessToken;
  }

  /**
   * Sends a GET request to the specified endpoint with the provided options.
   *
   * @param {string} endpoint - The endpoint to send the request to.
   * @param {RequestInit} [options={}] - Additional options for the request.
   * @return {Promise<Response>} A Promise that resolves to the response of the GET request.
   */
  public async get<T>(endpoint: string, options: RequestInit = {}): Promise<WithingsResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, undefined, { ...options, method: "GET" });
  }

  /**
   * Sends a POST request to the specified endpoint with the provided body.
   *
   * @param {string} endpoint - The endpoint to send the request to.
   * @param {any} body - The payload to include in the request.
   * @param {RequestInit} [options={}] - Additional options for the request.
   * @return {Promise<Response>} A Promise that resolves to the response of the POST request.
   */
  public async post<T>(endpoint: string, body: BodyInit, options: RequestInit = {}): Promise<WithingsResponse<T>> {
    //TODO: dont like the "as" convert of body
    return this.fetchWithAuth<T>(endpoint, body, { ...options, method: "POST" });
  }

  private async fetchWithAuth<T>(
    endpoint: string,
    body?: BodyInit,
    options?: RequestInit,
    retry: boolean = true
  ): Promise<WithingsResponse<T>> {
    if (this.access_token === null) {
      throw new Error("Access token is not set. Please call auth.fetchAccessToken() first.");
    }

    let response = await this.httpClient.send(endpoint, body, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${this.access_token}`,
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
