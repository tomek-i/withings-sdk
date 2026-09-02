import { WithingsHttpClient } from "../http/WithingsHttpClient";
import { WithingsService } from "../http/WithingsService";
import { EmptyBody } from "./models/EmptyBody";
import { GetNotification } from "./models/GetNotification";
import { ListNotifications } from "./models/ListNotifications";
import {
  GetNotificationOptions,
  ListNotificationsOptions,
  RevokeNotificationOptions,
  SubscribeOptions,
  UpdateNotificationOptions,
} from "./types/NotifyOptions";
import { GetNotificationRequest } from "./types/http/requests/GetNotificationRequest";
import { ListNotificationsRequest } from "./types/http/requests/ListNotificationsRequest";
import { RevokeNotificationRequest } from "./types/http/requests/RevokeNotificationRequest";
import { SubscribeRequest } from "./types/http/requests/SubscribeRequest";
import { UpdateNotificationRequest } from "./types/http/requests/UpdateNotificationRequest";

/**
 * The Withings notification service, reachable as `client.notify`.
 *
 * Withings posts to a callback URL when new data is available, which is the
 * supported alternative to polling, and the one Withings recommends for
 * staying inside the rate limit.
 *
 * A notification says *that* something changed and over which range; it never
 * carries the measurements. Fetch those with the matching endpoint. Use
 * {@link parseNotificationPayload} to read the posted body.
 *
 * @see https://developer.withings.com/api-reference/#tag/notify
 */
export class Notify extends WithingsService {
  private static readonly API_URL = "/notify";

  constructor(httpClient: WithingsHttpClient) {
    super(httpClient, Notify.API_URL);
  }

  /**
   * Registers a callback URL to be notified about a category.
   *
   * Withings verifies the URL by posting to it during this call, so it must
   * already be reachable and answering `200`, or the subscription is refused.
   *
   * @param options The callback URL and the category to subscribe to.
   * @returns An empty body; the outcome is in the response `status`.
   * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-subscribe
   */
  public async subscribe(options: SubscribeOptions) {
    const params: SubscribeRequest = {
      action: "subscribe",
      callbackurl: options.callbackurl,
      appli: options.appli,
      comment: options.comment ?? undefined,
      signature: options.signature ?? undefined,
      nonce: options.nonce ?? undefined,
      client_id: options.client_id ?? undefined,
    };

    return this.request<EmptyBody>(params);
  }

  /**
   * Reads a single subscription.
   *
   * @param options The callback URL, and optionally the category.
   * @returns The subscription.
   * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-get
   */
  public async get(options: GetNotificationOptions) {
    const params: GetNotificationRequest = {
      action: "get",
      callbackurl: options.callbackurl,
      appli: options.appli ?? undefined,
    };

    return this.request<GetNotification>(params);
  }

  /**
   * Lists the subscriptions registered for this user and application.
   *
   * @param options Optionally narrows to one category.
   * @returns The registered subscriptions.
   * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-list
   */
  public async list(options: ListNotificationsOptions = {}) {
    const params: ListNotificationsRequest = {
      action: "list",
      appli: options.appli ?? undefined,
    };

    return this.request<ListNotifications>(params);
  }

  /**
   * Changes one property of an existing subscription.
   *
   * The API changes exactly one thing per call, which the
   * {@link UpdateNotificationOptions} union enforces.
   *
   * @param options The subscription to change, and the single change to make.
   * @returns An empty body; the outcome is in the response `status`.
   * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-update
   */
  public async update(options: UpdateNotificationOptions) {
    const params: UpdateNotificationRequest = {
      action: "update",
      callbackurl: options.callbackurl,
      appli: options.appli,
      new_callbackurl: options.new_callbackurl ?? undefined,
      new_appli: options.new_appli ?? undefined,
      comment: options.comment ?? undefined,
    };

    return this.request<EmptyBody>(params);
  }

  /**
   * Removes a subscription, stopping further notifications to that URL.
   *
   * @param options The callback URL, and optionally the category.
   * @returns An empty body; the outcome is in the response `status`.
   * @see https://developer.withings.com/api-reference/#tag/notify/operation/notify-revoke
   */
  public async revoke(options: RevokeNotificationOptions) {
    const params: RevokeNotificationRequest = {
      action: "revoke",
      callbackurl: options.callbackurl,
      appli: options.appli ?? undefined,
    };

    return this.request<EmptyBody>(params);
  }
}
