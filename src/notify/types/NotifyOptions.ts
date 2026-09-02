import { NotificationCategory } from "../enums/NotificationCategory";

/**
 * Credentials for signature-based authentication.
 *
 * `subscribe` accepts either a bearer token, which this SDK always sends, or a
 * signed request. Supply these only if your integration uses the signed form;
 * they are mutually exclusive with the access token, per the API reference.
 */
export interface SignedRequestOptions {
  /** HMAC signature over the sorted parameter values. */
  signature?: string;
  /** Single-use nonce obtained from the signature service. */
  nonce?: string;
  /** Your application's client ID. */
  client_id?: string;
}

/**
 * Options for {@link Notify.subscribe}.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-subscribe
 */
export interface SubscribeOptions extends SignedRequestOptions {
  /**
   * The URL Withings will post to. Must be publicly reachable and respond
   * within a few seconds, or Withings retries and eventually gives up.
   */
  callbackurl: string;
  /** What to be notified about. */
  appli: NotificationCategory;
  /** Free-text note stored alongside the subscription. */
  comment?: string;
}

/**
 * Options for {@link Notify.get}.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-get
 */
export interface GetNotificationOptions {
  /** The callback URL of the subscription to read. */
  callbackurl: string;
  /** Narrows to a single category when one URL serves several. */
  appli?: NotificationCategory;
}

/**
 * Options for {@link Notify.list}.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-list
 */
export interface ListNotificationsOptions {
  /** Only list subscriptions for this category. */
  appli?: NotificationCategory;
}

/**
 * Options for {@link Notify.revoke}.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-revoke
 */
export interface RevokeNotificationOptions {
  /** The callback URL of the subscription to remove. */
  callbackurl: string;
  /** Narrows to a single category when one URL serves several. */
  appli?: NotificationCategory;
}

/**
 * Options for {@link Notify.update}.
 *
 * A union, because the API changes exactly one thing per call: the callback
 * URL, the category, or the comment. Supplying more than one is documented as
 * invalid, and the `never` members are what prevent it.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-update
 */
export type UpdateNotificationOptions =
  | (UpdateNotificationTarget & WithNewCallbackUrl)
  | (UpdateNotificationTarget & WithNewAppli)
  | (UpdateNotificationTarget & WithNewComment);

/** Identifies the subscription being changed. */
export interface UpdateNotificationTarget {
  /** The callback URL of the subscription to change. */
  callbackurl: string;
  /** The category of the subscription to change. */
  appli: NotificationCategory;
}

/** Move the subscription to a different callback URL. */
export interface WithNewCallbackUrl {
  /** The URL to move the subscription to. */
  new_callbackurl: string;
  /** Not valid in this form; update one thing per call. */
  new_appli?: never;
  /** Not valid in this form; update one thing per call. */
  comment?: never;
}

/** Move the subscription to a different category. */
export interface WithNewAppli {
  /** The category to move the subscription to. */
  new_appli: NotificationCategory;
  /** Not valid in this form; update one thing per call. */
  new_callbackurl?: never;
  /** Not valid in this form; update one thing per call. */
  comment?: never;
}

/** Change only the stored comment. */
export interface WithNewComment {
  /** The replacement comment. */
  comment: string;
  /** Not valid in this form; update one thing per call. */
  new_callbackurl?: never;
  /** Not valid in this form; update one thing per call. */
  new_appli?: never;
}
