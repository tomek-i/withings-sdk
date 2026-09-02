import { WithingsRequest } from "../../../../types";
import { NotifyParams } from "../params/NotifyParams";

/**
 * Full wire request for the `notify list` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-list
 */
export interface ListNotificationsRequest extends WithingsRequest, NotifyParams {
  /** Pins the action this request performs. */
  action: "list";
}
