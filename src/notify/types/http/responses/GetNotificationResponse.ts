import { WithingsResponse } from "../../../../types";
import { GetNotification } from "../../../models/GetNotification";

/**
 * Response to the `notify get` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-get
 */
export interface GetNotificationResponse extends WithingsResponse<GetNotification> {}
