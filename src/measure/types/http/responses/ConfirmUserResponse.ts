import { WithingsResponse } from "../../../../types";
import { ConfirmUser } from "../../../models/ConfirmUser";

/**
 * Response to the `confirmuser` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-confirmuser
 */
export interface ConfirmUserResponse extends WithingsResponse<ConfirmUser> {}
