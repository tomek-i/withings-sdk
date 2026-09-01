import { MeasureGroup } from "./MeasureGroup";

/**
 * Body of a `getmeas` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
 */
export interface GetMeasurements {
  /** Last time the user's data changed, as a unix timestamp in seconds. */
  updatetime: number;
  /** IANA timezone the measurements were recorded in. */
  timezone: string;
  /** Measurements, grouped by the moment they were taken. */
  measuregrps: MeasureGroup[];
  /** True when more rows are available; request them with `offset`. */
  more?: boolean;
  /** Offset to pass on the next call to continue reading. */
  offset?: number;
}
