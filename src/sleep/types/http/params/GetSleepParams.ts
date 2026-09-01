/**
 * Wire parameters for the sleep `get` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-get
 */
export interface GetSleepParams {
  /** Data start date, as a unix timestamp in seconds. */
  startdate: number;
  /** Data end date, as a unix timestamp in seconds. */
  enddate: number;
  /** Requested data fields, separated by a comma. */
  data_fields?: string;
  /** Requested measure types, separated by a comma. */
  meastypes?: string;
}
