import { WithingsRequest } from "../../../../types";

/**
 * Full wire request for the user `getgoals` action, which takes no parameters
 * beyond the action itself.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-getgoals
 */
export interface GetGoalsRequest extends WithingsRequest {
  /** Pins the action this request performs. */
  action: "getgoals";
}
