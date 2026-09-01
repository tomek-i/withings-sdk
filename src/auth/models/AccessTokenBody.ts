/**
 * The token pair and metadata returned by the OAuth2 `requesttoken` action,
 * for both the `authorization_code` and `refresh_token` grants.
 *
 * @see https://developer.withings.com/api-reference/#tag/oauth2
 */
export interface AccessTokenBody {
  /**
   * Identifier of the user the tokens belong to.
   *
   * Typed as a union deliberately: the published specification declares an
   * integer, while responses have been observed carrying it as a string.
   */
  userid: string | number;
  /** The access token, sent as a bearer token on subsequent requests. */
  access_token: string;
  /**
   * The refresh token, used to obtain a new access token once this one
   * expires. Withings rotates this on every renewal, so persist the new value.
   */
  refresh_token: string;
  /** Lifetime of the access token, in seconds. */
  expires_in: number;
  /**
   * The scopes the user actually granted, comma separated. This can be
   * narrower than the scopes that were requested.
   */
  scope: string;
  /** CSRF token issued alongside the access token. */
  csrf_token: string;
  /** Authorization header scheme to use, always `Bearer`. */
  token_type: string;
}
