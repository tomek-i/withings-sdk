import { WithingsRequest } from "../../../../types";
import { NotifyParams } from "../params/NotifyParams";

/**
 * Full wire request for the `notify subscribe` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-subscribe
 */
export interface SubscribeRequest extends WithingsRequest, NotifyParams {
  /** Pins the action this request performs. */
  action: "subscribe";
}
