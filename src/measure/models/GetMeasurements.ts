import { MeasureGroup } from "./MeasureGroup";

/**
 * Body of a `getmeas` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
 */
export interface GetMeasurements {
  /**
   * Server time at which the answer was generated.
   *
   * Typed as a union deliberately: the published specification declares this a
   * string, while observed responses have carried a unix timestamp as a number.
   * Narrow with `Number(updatetime)` if you need to do arithmetic.
   */
  updatetime: string | number;
  /** IANA timezone the measurements were recorded in. */
  timezone: string;
  /** Measurements, grouped by the moment they were taken. */
  measuregrps: MeasureGroup[];
  /**
   * Whether more rows are available; request them with `offset`.
   *
   * `getmeas` returns this as a number, whereas `getactivity` and
   * `getworkouts` return a boolean. That inconsistency is in the API.
   */
  more?: number;
  /** Offset to pass on the next call to continue reading. */
  offset?: number;
}
