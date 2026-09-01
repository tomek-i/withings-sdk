import { WithingsRequest } from "../../../../types";
import { GetActivityParams } from "../params/GetActivityParams";

/**
 * Provides daily aggregated activity data of a user.
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getactivity
 */

export interface GetActivityRequest extends WithingsRequest, GetActivityParams {
  action: "getactivity";
}
