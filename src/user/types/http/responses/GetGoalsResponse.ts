import { WithingsResponse } from "../../../../types";
import { GetGoals } from "../../../models/GetGoals";

/**
 * Response to the user `getgoals` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-getgoals
 */
export interface GetGoalsResponse extends WithingsResponse<GetGoals> {}
