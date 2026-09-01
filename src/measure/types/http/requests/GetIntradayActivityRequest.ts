import { WithingsRequest } from "../../../../types";
import { GetIntradayActivityParams } from "../params/GetIntradayActivityParams";

/**
 * Returns user activity data captured at high frequency.
 * Notes:
 * If your input `startdate` and `enddate` are separated by more than 24h, only the first 24h after startdate will be returned.
 * If no `startdate` and `enddate` are passed as parameters, the most recent activity data will be returned
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getintradayactivity
 */

/**
 * Full wire request for the `getintradayactivity` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getintradayactivity
 */
export interface GetIntradayActivityRequest extends WithingsRequest, GetIntradayActivityParams {
  /** Pins the action this request performs. */
  action: "getintradayactivity";
}
