import { WithingsRequest } from "@/types";
import { ConfirmUserParams } from "../params/ConfirmUserParams";

/**
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-confirmuser
 */

export interface ConfirmUserRequest extends WithingsRequest, ConfirmUserParams {
  action: "confirmuser";
}
