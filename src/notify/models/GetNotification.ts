import { NotificationCategory } from "../enums/NotificationCategory";

/**
 * Body of a `notify get` response: one subscription.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-get
 */
export interface GetNotification {
  /** What the subscription is about. */
  appli?: NotificationCategory;
  /** The URL Withings posts to. */
  callbackurl?: string;
  /** The comment recorded when the subscription was created. */
  comment?: string;
}
