/**
 * Wire parameters for the `/v2/heart` actions.
 *
 * @see https://developer.withings.com/api-reference/#tag/heart
 */
export interface HeartParams {
  /** Data start date, as a unix timestamp in seconds. */
  startdate?: number;
  /** Data end date, as a unix timestamp in seconds. */
  enddate?: number;
  /**
   * When a first call returns `more:true` and `offset:XX`, set value `XX` in
   * this parameter to retrieve the next available rows.
   */
  offset?: number;
  /** Identifier of the signal to fetch. */
  signalid?: number;
  /** Signal identifier for a signed request. */
  signal_token?: string;
  /** Client ID, when using a signed request. */
  client_id?: string;
  /** HMAC signature, when using a signed request. */
  signature?: string;
  /** Single-use nonce, when using a signed request. */
  nonce?: string;
  /** Request the filtered version of the signal. */
  with_filtered?: boolean;
  /** Include inactive features. */
  with_intervals?: boolean;
}
