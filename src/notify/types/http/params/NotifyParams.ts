/**
 * Wire parameters for the `/notify` actions.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify
 */
export interface NotifyParams {
  /** The callback URL the subscription belongs to. */
  callbackurl?: string;
  /** The notification category. */
  appli?: number;
  /** Free-text note stored with the subscription. */
  comment?: string;
  /** Replacement callback URL, for `update`. */
  new_callbackurl?: string;
  /** Replacement category, for `update`. */
  new_appli?: number;
  /** HMAC signature, when using signed requests instead of a bearer token. */
  signature?: string;
  /** Single-use nonce, when using signed requests. */
  nonce?: string;
  /** Client ID, when using signed requests. */
  client_id?: string;
}
