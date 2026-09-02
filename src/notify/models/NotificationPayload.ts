import { NotificationCategory } from "../enums/NotificationCategory";

/**
 * What Withings posts to your callback URL when new data is available.
 *
 * It is delivered as an `application/x-www-form-urlencoded` body, so every
 * value arrives as a string. Use {@link parseNotificationPayload} to turn one
 * into this shape rather than reading the raw fields.
 *
 * The notification says *that* something changed and over which range; it
 * never carries the measurements. Call the matching endpoint with `startdate`
 * and `enddate` to fetch them.
 *
 * @see https://developer.withings.com/developer-guide/v3/data-api/notifications/notification-content/
 */
export interface NotificationPayload {
  /** The user the notification concerns. */
  userid: number;
  /** What the notification is about. */
  appli: NotificationCategory;
  /** Start of the changed range, as a unix timestamp in seconds. */
  startdate?: number;
  /** End of the changed range, as a unix timestamp in seconds. */
  enddate?: number;
  /**
   * Single date for event-based categories, rather than a range.
   *
   * Arrives as `YYYY-MM-DD` for some categories and as a unix timestamp for
   * others, so it is left as given.
   */
  date?: string;
  /** The device that produced the data, where applicable. */
  deviceid?: string;
  /** For {@link NotificationCategory.UserProfileChange}: what happened. */
  action?: "delete" | "unlink" | "update" | string;
}
