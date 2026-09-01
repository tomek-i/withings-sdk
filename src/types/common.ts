export interface WithingsConfig {
  clientId: string;
  clientSecret: string;
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
}

/**
 * The token pair returned by the Withings OAuth2 endpoints. Persist these to
 * avoid sending the user through the consent screen on every run.
 */
export interface WithingsTokens {
  accessToken: string;
  refreshToken: string;
}

export interface NonceBody {
  nonce: string;
}

/** REQUEST TYPES */

/**
 * Withings API base request
 * @see https://developer.withings.com/api-reference
 */
export interface WithingsRequest {
  /**
   * Service action name.
   */
  action: string;
}

/** RESPONSES */

/**
 * Withings API base response
 */
export interface WithingsResponse<T> {
  status: number;
  body: T;

  /**
   * Only set if there is an error
   */
  error?: string;
}

export interface NonceResponse extends WithingsResponse<NonceBody> {}
