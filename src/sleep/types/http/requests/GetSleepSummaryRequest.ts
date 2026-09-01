import { WithingsRequest } from "../../../../types";
import { GetSleepSummaryParams } from "../params/GetSleepSummaryParams";

/**
 * Full wire request for the sleep `getsummary` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-getsummary
 */
export interface GetSleepSummaryRequest extends WithingsRequest, GetSleepSummaryParams {
  /** Pins the action this request performs. */
  action: "getsummary";
}
