import { WithingsResponse } from "../../../../types";
import { GetWorkouts } from "../../../models/GetWorkouts";

/**
 * Response to the `getworkouts` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getworkouts
 */
export interface GetWorkoutsResponse extends WithingsResponse<GetWorkouts> {}
