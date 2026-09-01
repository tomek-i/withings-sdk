import { Workout } from "./Workout";

/**
 * Body of a `getworkouts` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getworkouts
 */
export interface GetWorkouts {
  /** One entry per workout in the requested range. */
  series: Workout[];
  /** True when more rows are available; request them with `offset`. */
  more?: boolean;
  /** Offset to pass on the next call to continue reading. */
  offset?: number;
}
