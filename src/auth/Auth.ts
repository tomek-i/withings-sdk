import crypto from "crypto";
import { sortParams } from "@/util";
import { IHttpClient } from "@/http";
import { WithingsConfig } from "..";
import { RequestTokenResponse } from "./types/http/responses/RequestTokenResponse";
import { AuthCodeUrlParams } from "./types/http/params/AuthCodeUrlParams";

export class Auth {
  private access_token: string | null = null;
  private refresh_token: string | null = null;

  private static readonly AUTHORIZATION_URL = "https://account.withings.com/oauth2_user/authorize2";

  getCurrentRefreshToken() {
    return this.refresh_token;
  }
  getCurrentAccessToken() {
    return this.access_token;
  }
  constructor(private readonly config: WithingsConfig, private readonly httpClient: IHttpClient) {}

  public async refreshAccessToken(): Promise<RequestTokenResponse> {
    if (this.refreshAccessToken === null) {
      throw new Error("Refresh token is not set. Please call auth.fetchAccessToken() first.");
    }

    const response = await this.httpClient.post(
      "/v2/oauth2",
      //TODO: extract to type / interface, this is the body/payload of the request
      {
        action: "requesttoken",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: "refresh_token",
        refresh_token: this.refresh_token,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    if (!response.ok) {
      //TODO: better error messaging
      //TODO: add logging
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    //TODO: include zod validation
    const data = (await response.json()) as RequestTokenResponse;

    this.access_token = data.body.access_token;
    this.refresh_token = data.body.access_token;

    return data;
  }

  /**
   * Retrieves an access token using the provided authorization code.
   *
   * @param {string} code - The authorization code.
   * @return {Promise<RequestTokenResponse>} A promise that resolves to the request token response.
   */
  public async fetchAccessToken(code: string): Promise<RequestTokenResponse> {
    const response = await this.httpClient.post(
      "/v2/oauth2",
      //TODO: extract to type / interface, this is the body/payload of the request not params
      {
        action: "requesttoken",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: this.config.redirectUri,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    if (!response.ok) {
      //TODO: better error messaging
      //TODO: add logging
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    //TODO: include zod validation
    const data = (await response.json()) as RequestTokenResponse;

    this.access_token = data.body.access_token;
    this.refresh_token = data.body.access_token;

    return data;
  }

  /**
   * Generates a signature for the given signature payload using HMAC-SHA256 algorithm.
   *
   * @param {Object} signaturePayload - An object containing the action, client_id, and timestamp.
   * @param {string} signaturePayload.action - The action for the signature.
   * @param {string} signaturePayload.client_id - The client_id for the signature.
   * @param {number} signaturePayload.timestamp - The timestamp for the signature.
   * @return {string} The generated signature in hexadecimal format.
   */
  public generateSignature(signaturePayload: { action: string; client_id: string; timestamp: number }) {
    const sortedParams = sortParams(signaturePayload);

    const concatenatedValues = sortedParams.map(([, value]) => value).join(",");

    const hmac = crypto.createHmac("sha256", this.config.clientSecret);
    hmac.update(concatenatedValues);

    return hmac.digest("hex");
  }

  /**
   * Generates the authorization code URL for Withings API.
   *
   * @param {string[]} scope - The list of scopes for the authorization code URL. Example: ["user.info", "user.metrics", "user.activity"].
   * @param {string} state - The state parameter for the authorization code URL.
   * @return {string} The generated authorization code URL.
   */
  public getAuthCodeUrl(scope: string[], state: string): string {
    if (!scope || !scope.length) {
      throw new Error("scope is required");
    }

    //TODO: extract to type / interface
    const params: AuthCodeUrlParams = {
      response_type: "code",
      client_id: this.config.clientId,
      state,
      scope: scope.filter(Boolean).join(","),
      redirect_uri: this.config.redirectUri,
    };

    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${key === "scope" ? value : encodeURIComponent(value)}`)
      .join("&");

    //TODO: make constant
    return `${Auth.AUTHORIZATION_URL}?${queryString}`;
  }
}
