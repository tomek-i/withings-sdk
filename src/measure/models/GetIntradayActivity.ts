import { IntradayActivityEntry } from "./IntradayActivityEntry";

/**
 * Body of a `getintradayactivity` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getintradayactivity
 */
export interface GetIntradayActivity {
  /**
   * Activity slices keyed by their start time, a unix timestamp in seconds.
   * JSON object keys are strings, so the timestamp arrives as a string even
   * though it represents a number.
   */
  series: Record<string, IntradayActivityEntry>;
}
