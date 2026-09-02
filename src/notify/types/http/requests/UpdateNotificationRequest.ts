import { WithingsRequest } from "../../../../types";
import { NotifyParams } from "../params/NotifyParams";

/**
 * Full wire request for the `notify update` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-update
 */
export interface UpdateNotificationRequest extends WithingsRequest, NotifyParams {
  /** Pins the action this request performs. */
  action: "update";
}
