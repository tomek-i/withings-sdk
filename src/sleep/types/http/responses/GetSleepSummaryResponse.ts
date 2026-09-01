import { WithingsResponse } from "../../../../types";
import { GetSleepSummary } from "../../../models/GetSleepSummary";

/**
 * Response to the sleep `getsummary` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-getsummary
 */
export interface GetSleepSummaryResponse extends WithingsResponse<GetSleepSummary> {}
