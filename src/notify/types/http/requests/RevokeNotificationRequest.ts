import { WithingsRequest } from "../../../../types";
import { NotifyParams } from "../params/NotifyParams";

/**
 * Full wire request for the `notify revoke` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-revoke
 */
export interface RevokeNotificationRequest extends WithingsRequest, NotifyParams {
  /** Pins the action this request performs. */
  action: "revoke";
}
