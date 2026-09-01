/**
 * Query parameters for the OAuth2 consent screen the user is redirected to.
 *
 * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-authorize
 */
export interface AuthCodeUrlParams {
  /** Always the constant `code`. */
  response_type: string;
  /** Your application's client ID. */
  client_id: string;
  /**
   * A value you choose, returned unchanged on the callback. Use it to confirm
   * the redirect back to your app was not spoofed.
   */
  state: string;
  /**
   * Comma separated permission scopes to request, e.g.
   * `user.info,user.metrics,user.activity`.
   */
  scope: string;
  /**
   * Where Withings sends the user after they allow or deny access. Must match
   * a callback URL registered on your partner application.
   */
  redirect_uri: string;
}
