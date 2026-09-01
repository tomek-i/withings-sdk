import { WithingsRequest } from "../../../../types";
import { ConfirmUserParams } from "../params/ConfirmUserParams";

/**
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-confirmuser
 */

/**
 * Full wire request for the `confirmuser` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-confirmuser
 */
export interface ConfirmUserRequest extends WithingsRequest, ConfirmUserParams {
  /** Pins the action this request performs. */
  action: "confirmuser";
}
