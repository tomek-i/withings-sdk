import { PaginatedBody } from "../../pagination/paginate";
import { Workout } from "./Workout";

/**
 * Body of a `getworkouts` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getworkouts
 */
export interface GetWorkouts extends PaginatedBody {
  /** One entry per workout in the requested range. */
  series: Workout[];
}
