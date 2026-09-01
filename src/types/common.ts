import { WithingsRetryOptions } from "../http/retry";

/**
 * Everything {@link WithingsClient} needs to talk to the API on a user's
 * behalf. Create an application in the Withings developer dashboard to obtain
 * the credentials.
 *
 * @see https://developer.withings.com/dashboard/
 */
export interface WithingsConfig {
  /** Your application's client ID. */
  clientId: string;
  /** Your application's client secret. Keep this server side. */
  clientSecret: string;
  /**
   * Where Withings sends the user after the consent screen. Must match a
   * callback URL registered on your partner application.
   */
  redirectUri: string;

  /**
   * An access token obtained from a previous authorization, so the client can
   * make authenticated calls without running the consent flow again.
   */
  accessToken?: string;

  /**
   * The matching refresh token. Required for the client to renew an expired
   * access token automatically.
   */
  refreshToken?: string;

  /**
   * How to behave when the API rate limits a request.
   *
   * Withings allows roughly 120 requests per minute by default. By default the
   * client backs off and retries such a request up to 3 times in total. Pass
   * `false` to disable that and have the rate limit surface immediately as a
   * {@link WithingsApiError}.
   */
  retry?: WithingsRetryOptions | false;
}

/**
 * The token pair returned by the Withings OAuth2 endpoints. Persist these to
 * avoid sending the user through the consent screen on every run.
 */
export interface WithingsTokens {
  /** The access token, sent as a bearer token on each request. */
  accessToken: string;
  /** The refresh token, used to renew an expired access token. */
  refreshToken: string;
}

/** Body of a `getnonce` response. */
export interface NonceBody {
  /** Single-use value to include when signing a request. */
  nonce: string;
}

/**
 * Fields common to every Withings API request.
 *
 * @see https://developer.withings.com/api-reference
 */
export interface WithingsRequest {
  /** Service action name, e.g. `getmeas`. */
  action: string;
}

/**
 * The envelope every Withings API response arrives in.
 *
 * Note that a failure is reported in `status` with HTTP 200, so the HTTP
 * status alone does not tell you whether a call succeeded.
 *
 * @see https://developer.withings.com/api-reference
 */
export interface WithingsResponse<T> {
  /**
   * Outcome of the call. `0` means success; see {@link WithingsResponseStatus}
   * for how other codes are grouped.
   */
  status: number;
  /** The payload, whose shape depends on the action that was called. */
  body: T;
  /** Human readable error description. Only set when the call failed. */
  error?: string;
}

/** Response to the `getnonce` action. */
export interface NonceResponse extends WithingsResponse<NonceBody> {}
