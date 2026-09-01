import { WithingsResponse } from "../../../../types";
import { GetIntradayActivity } from "../../../models/GetIntradayActivity";

/**
 * Response to the `getintradayactivity` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getintradayactivity
 */
export interface GetIntradayActivityResponse extends WithingsResponse<GetIntradayActivity> {}
