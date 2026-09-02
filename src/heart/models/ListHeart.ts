import { PaginatedBody } from "../../pagination/paginate";
import { HeartRecord } from "./HeartRecord";

/**
 * Body of a heart `list` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/heart/operation/heartv2-list
 */
export interface ListHeart extends PaginatedBody {
  /** The recordings in the requested period, most recent first. */
  series: HeartRecord[];
}
