import { NotificationCategory } from "../enums/NotificationCategory";

/**
 * A registered notification subscription.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify
 */
export interface NotificationProfile {
  /** What the subscription is about. */
  appli?: NotificationCategory;
  /** The URL Withings posts to. */
  callbackurl?: string;
  /** The comment recorded when the subscription was created. */
  comment?: string;
}
