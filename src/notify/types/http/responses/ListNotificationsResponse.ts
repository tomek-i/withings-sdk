import { WithingsResponse } from "../../../../types";
import { ListNotifications } from "../../../models/ListNotifications";

/**
 * Response to the `notify list` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-list
 */
export interface ListNotificationsResponse extends WithingsResponse<ListNotifications> {}
