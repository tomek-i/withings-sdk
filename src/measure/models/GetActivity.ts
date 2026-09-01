import { Activity } from "./Activity";

/**
 * Body of a `getactivity` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getactivity
 */
export interface GetActivity {
  /** One entry per day in the requested range. */
  activities: Activity[];
  /** True when more rows are available; request them with `offset`. */
  more?: boolean;
  /** Offset to pass on the next call to continue reading. */
  offset?: number;
}
