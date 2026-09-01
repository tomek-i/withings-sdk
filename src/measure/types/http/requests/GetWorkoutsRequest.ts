import { WithingsRequest } from "../../../../types";
import { GetWorkoutsParams } from "../params/GetWorkoutsParams";

/**
 * Returns workout summaries, which are an aggregation all data that was captured during that workout.
 * Use the Measure v2 -  GetIntradayActivityRequest to get the high frequency data used to build this summary.
 */

/**
 * Full wire request for the `getworkouts` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getworkouts
 */
export interface GetWorkoutsRequest extends WithingsRequest, GetWorkoutsParams {
  /** Pins the action this request performs. */
  action: "getworkouts";
}
