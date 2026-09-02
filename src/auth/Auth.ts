import crypto from "node:crypto";
import { WithingsApiError } from "../errors/WithingsApiError";
import { ErrorCodeHandler, WithingsResponseStatus, sortParams } from "../util";
import { IHttpClient } from "../http";
import { readWithingsResponse } from "../http/readResponse";
import { NonceResponse, SignedParams, WithingsConfig, WithingsResponse } from "../types";
import { CreatedClient, DemoAccess, ListUsers, RecoveredAuthorizationCode } from "./models/OAuthAdmin";
import {
  CreateClientOptions,
  DemoAccessOptions,
  ListUsersOptions,
  RecoverAuthorizationCodeOptions,
  RevokeUserOptions,
} from "./types/OAuthAdminOptions";
import { RequestTokenResponse } from "./types/http/responses/RequestTokenResponse";
import { AuthCodeUrlParams } from "./types/http/params/AuthCodeUrlParams";

/**
 * The OAuth2 flow, reachable as `client.auth`.
 *
 * Builds the consent URL, exchanges the authorization code for tokens, renews
 * them, and signs requests for the services that require a signature.
 *
 * @see https://developer.withings.com/api-reference/#tag/oauth2
 */
const OAUTH2_PATH = "/v2/oauth2";

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

  /**
   * Seeds the token pair from a previous authorization, so an already
   * authorized user does not have to go through the consent screen again.
   */
  public setTokens(tokens: { accessToken: string; refreshToken?: string }) {
    this.access_token = tokens.accessToken;
    if (tokens.refreshToken !== undefined) {
      this.refresh_token = tokens.refreshToken;
    }
  }

  constructor(
    private readonly config: WithingsConfig,
    private readonly httpClient: IHttpClient
  ) {
    this.access_token = config.accessToken ?? null;
    this.refresh_token = config.refreshToken ?? null;
  }

  public async refreshAccessToken(): Promise<RequestTokenResponse> {
    if (this.refresh_token === null) {
      throw new Error("Refresh token is not set. Please call auth.fetchAccessToken() first.");
    }

    const response = await this.httpClient.post(
      OAUTH2_PATH,
      {
        action: "requesttoken",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: "refresh_token",
        refresh_token: this.refresh_token,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const data = (await readWithingsResponse<RequestTokenResponse["body"]>(
      response,
      OAUTH2_PATH
    )) as RequestTokenResponse;

    // The API reports failures in the body with HTTP 200. Without this guard an
    // error response reaches the line below and fails as a TypeError on the
    // missing body, hiding what actually went wrong.
    if (ErrorCodeHandler(data.status) !== WithingsResponseStatus.Success) {
      throw new WithingsApiError(data);
    }

    this.access_token = data.body.access_token;
    // Withings rotates the refresh token; keep the previous one if it is omitted.
    this.refresh_token = data.body.refresh_token ?? this.refresh_token;

    return data;
  }

  /**
   * Retrieves an access token using the provided authorization code.
   *
   * @param code The authorization code.
   * @returns A promise that resolves to the request token response.
   */
  public async fetchAccessToken(code: string): Promise<RequestTokenResponse> {
    const response = await this.httpClient.post(
      OAUTH2_PATH,
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

    const data = (await readWithingsResponse<RequestTokenResponse["body"]>(
      response,
      OAUTH2_PATH
    )) as RequestTokenResponse;

    // The API reports failures in the body with HTTP 200. Without this guard an
    // error response reaches the line below and fails as a TypeError on the
    // missing body, hiding what actually went wrong.
    if (ErrorCodeHandler(data.status) !== WithingsResponseStatus.Success) {
      throw new WithingsApiError(data);
    }

    this.access_token = data.body.access_token;
    // Withings rotates the refresh token; keep the previous one if it is omitted.
    this.refresh_token = data.body.refresh_token ?? this.refresh_token;

    return data;
  }

  /**
   * Obtains a nonce for the services that authenticate with a signature.
   *
   * This call is itself signed rather than bearer authenticated: Withings
   * verifies it with your client ID and secret, so it works without a user
   * having authorized anything.
   *
   * The nonce is valid for 30 minutes and single use. Prefer
   * {@link signedParams}, which fetches one and signs the request in a step.
   *
   * @returns The nonce.
   * @throws {WithingsApiError} If the API rejects the request.
   * @see https://developer.withings.com/api-reference/#tag/signature/operation/signaturev2-getnonce
   */
  public async getNonce(): Promise<NonceResponse> {
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
      action: "getnonce",
      client_id: this.config.clientId,
      timestamp,
    };

    return this.postSigned<NonceResponse["body"]>("/v2/signature", {
      ...payload,
      signature: this.generateSignature(payload),
    }) as Promise<NonceResponse>;
  }

  /**
   * Sends a signature-authorized request and maps a failure onto an error.
   *
   * No bearer token is attached: these services are authorized by the client
   * ID and secret, so they work before any user has consented.
   */
  private async postSigned<T>(path: string, params: object): Promise<WithingsResponse<T>> {
    const response = await this.httpClient.post(path, params, {
      headers: { "Content-Type": "application/json" },
    });

    const data = await readWithingsResponse<T>(response, path);

    if (ErrorCodeHandler(data.status) !== WithingsResponseStatus.Success) {
      throw new WithingsApiError(data);
    }

    return data;
  }

  /**
   * Fetches a nonce and signs an action with it, ready to send.
   *
   * ```typescript
   * const signed = await client.auth.signedParams("subscribe");
   * await client.notify.subscribe({ ...signed, callbackurl, appli });
   * ```
   *
   * The nonce is single use, so call this once per request rather than reusing
   * the result.
   *
   * @param action The service action the parameters will authorize.
   * @returns The action, client ID, nonce and signature to send.
   * @throws {WithingsApiError} If the nonce request is rejected.
   */
  public async signedParams(action: string): Promise<SignedParams> {
    const { body } = await this.getNonce();

    const payload = {
      action,
      client_id: this.config.clientId,
      nonce: body.nonce,
    };

    return { ...payload, signature: this.generateSignature(payload) };
  }

  /**
   * Generates a signature for the given signature payload using HMAC-SHA256 algorithm.
   *
   * @param signaturePayload An object containing the action, client_id, and timestamp.
   * The payload is deliberately open: `getnonce` signs action, client_id and
   * timestamp, while the services that consume a nonce sign action, client_id
   * and nonce. Both go through here.
   *
   * @param signaturePayload The parameters to sign. Values are sorted by key,
   *   joined with commas, and hashed with the client secret.
   * @returns The generated signature in hexadecimal format.
   */
  public generateSignature(signaturePayload: Record<string, string | number>) {
    const sortedParams = sortParams(signaturePayload);

    const concatenatedValues = sortedParams.map(([, value]) => value).join(",");

    const hmac = crypto.createHmac("sha256", this.config.clientSecret);
    hmac.update(concatenatedValues);

    return hmac.digest("hex");
  }

  /**
   * Generates the authorization code URL for Withings API.
   *
   * @param scope The list of scopes for the authorization code URL. Example: ["user.info", "user.metrics", "user.activity"].
   * @param state The state parameter for the authorization code URL.
   * @returns The generated authorization code URL.
   */
  public getAuthCodeUrl(scope: string[], state: string): string {
    if (!scope || !scope.length) {
      throw new Error("scope is required");
    }

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

    return `${Auth.AUTHORIZATION_URL}?${queryString}`;
  }

  /**
   * Revokes a user's authorization of your application.
   *
   * This is what to call when a user disconnects. It stops Withings sending
   * further data and invalidates the tokens you hold for them.
   *
   * ```typescript
   * const signed = await client.auth.signedParams("revoke");
   * await client.auth.revoke({ ...signed, userid });
   * ```
   *
   * @param options The user to revoke, and the signature parameters.
   * @returns An empty body; the outcome is in the response status.
   * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-revoke
   */
  public async revoke(options: RevokeUserOptions) {
    return this.postSigned<Record<string, never>>(OAUTH2_PATH, {
      action: "revoke",
      client_id: options.client_id,
      nonce: options.nonce,
      signature: options.signature,
      userid: options.userid,
    });
  }

  /**
   * Lists the users who have authorized your application.
   *
   * @param options The signature parameters, and an offset when paging.
   * @returns The linked users.
   * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-listusers
   */
  public async listUsers(options: ListUsersOptions) {
    return this.postSigned<ListUsers>(OAUTH2_PATH, {
      action: "listusers",
      client_id: options.client_id,
      nonce: options.nonce,
      signature: options.signature,
      offset: options.offset ?? undefined,
    });
  }

  /**
   * Recovers the authorization code for a user who already authorized you.
   *
   * Useful when the code was lost before it could be exchanged, without
   * sending the user through consent again.
   *
   * @param options The user, and the signature parameters.
   * @returns The recovered authorization code.
   * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-recoverauthorizationcode
   */
  public async recoverAuthorizationCode(options: RecoverAuthorizationCodeOptions) {
    return this.postSigned<RecoveredAuthorizationCode>(OAUTH2_PATH, {
      action: "recoverauthorizationcode",
      client_id: options.client_id,
      nonce: options.nonce,
      signature: options.signature,
      userid: options.userid,
    });
  }

  /**
   * Obtains tokens for the Withings demo user.
   *
   * The demo account carries sample data, which makes it a way to develop
   * against real response shapes without owning a device.
   *
   * @param options The scopes to grant, and the signature parameters.
   * @returns Tokens for the demo user.
   * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-getdemoaccess
   */
  public async getDemoAccess(options: DemoAccessOptions) {
    return this.postSigned<DemoAccess>(OAUTH2_PATH, {
      action: "getdemoaccess",
      client_id: options.client_id,
      nonce: options.nonce,
      signature: options.signature,
      scope_oauth2: options.scope_oauth2,
    });
  }

  /**
   * Creates a new partner application.
   *
   * @param options The application to create, and the signature parameters.
   * @returns The new application, including its client secret.
   * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-createclient
   */
  public async createClient(options: CreateClientOptions) {
    return this.postSigned<CreatedClient>(OAUTH2_PATH, {
      action: "createclient",
      client_id: options.client_id,
      nonce: options.nonce,
      signature: options.signature,
      name: options.name,
      description: options.description,
      intended_environment: options.intended_environment,
      intended_integrations: options.intended_integrations,
      redirect_uris: options.redirect_uris,
    });
  }
}
