import { SleepSeriesEntry } from "./SleepSeriesEntry";

/**
 * Body of a sleep `get` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-get
 */
export interface GetSleep {
  /**
   * The sleep states across the requested period, in chronological order.
   *
   * Note: the published specification describes this as a single object rather
   * than an array, but responses return an array of entries. Modelled to match
   * the responses.
   */
  series: SleepSeriesEntry[];
  /** Numeric identifier of the device model that recorded the night. */
  model?: number;
}
