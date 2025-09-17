import { WithingsRequest } from "@/types";
import { GetWorkoutsParams } from "../params/GetWorkoutsParams";

/**
 * Returns workout summaries, which are an aggregation all data that was captured during that workout.
 * Use the Measure v2 -  GetIntradayActivityRequest to get the high frequency data used to build this summary.
 */

export interface GetWorkoutsRequest extends WithingsRequest, GetWorkoutsParams {
  action: "getworkouts";
}
