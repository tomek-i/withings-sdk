import { PaginatedBody } from "../../pagination/paginate";
import { SleepSummary } from "./SleepSummary";

/**
 * Body of a sleep `getsummary` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-getsummary
 */
export interface GetSleepSummary extends PaginatedBody {
  /** One entry per night in the requested range. */
  series: SleepSummary[];
}
