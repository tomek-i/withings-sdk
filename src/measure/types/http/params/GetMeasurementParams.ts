/**
 * Wire parameters for the `getmeas` action.
 *
 * `meastype` and `meastypes` are mutually exclusive; the caller-facing
 * `GetMeasurementOptions` union is what enforces that.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
 */
export interface GetMeasurementParams {
  /**
   * A single requested measure type.
   * IMPORTANT: DO NOT USE WITH FOLLOWING PARAMS: [meastypes]
   */
  meastype?: number;
  /**
   * Several requested measure types, separated by a comma.
   * IMPORTANT: DO NOT USE WITH FOLLOWING PARAMS: [meastype]
   * @example meastypes=1,4,12
   */
  meastypes?: string;
  /** `1` for real measurements, `2` for user objectives. */
  category?: number;
  /** Data start date, as a unix timestamp in seconds. */
  startdate?: number;
  /** Data end date, as a unix timestamp in seconds. */
  enddate?: number;
  /**
   * Return data created or updated after this date, as a unix timestamp in
   * seconds. Useful for synchronising between systems.
   * IMPORTANT: DO NOT USE WITH FOLLOWING PARAMS: [startdate, enddate]
   */
  lastupdate?: number;
  /**
   * When a first call returns `more:1` and `offset:XX`, set value `XX` in this
   * parameter to retrieve the next available rows.
   */
  offset?: number;
}
