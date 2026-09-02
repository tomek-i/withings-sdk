import { WithingsRequest } from "../../../../types";
import { NotifyParams } from "../params/NotifyParams";

/**
 * Full wire request for the `notify get` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-get
 */
export interface GetNotificationRequest extends WithingsRequest, NotifyParams {
  /** Pins the action this request performs. */
  action: "get";
}
