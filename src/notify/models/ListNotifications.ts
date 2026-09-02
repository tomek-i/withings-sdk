import { NotificationProfile } from "./NotificationProfile";

/**
 * Body of a `notify list` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-list
 */
export interface ListNotifications {
  /** The subscriptions registered for this user and application. */
  profiles: NotificationProfile[];
}
