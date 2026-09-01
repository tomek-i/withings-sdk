import { PaginatedBody } from "../../pagination/paginate";
import { Activity } from "./Activity";

/**
 * Body of a `getactivity` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getactivity
 */
export interface GetActivity extends PaginatedBody {
  /** One entry per day in the requested range. */
  activities: Activity[];
}
