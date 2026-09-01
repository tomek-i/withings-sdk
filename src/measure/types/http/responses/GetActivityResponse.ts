import { WithingsResponse } from "../../../../types";
import { GetActivity } from "../../../models/GetActivity";

/**
 * Response to the `getactivity` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getactivity
 */
export interface GetActivityResponse extends WithingsResponse<GetActivity> {}
