import { NotificationCategory, parseNotificationPayload, WithingsClient } from "../../src";
import type { ListNotifications } from "../../src";
import { withingsResponse } from "../helpers/response";

const client = () =>
  new WithingsClient({
    clientId: "id",
    clientSecret: "secret",
    redirectUri: "https://example.com/cb",
    accessToken: "token",
  });

const respond = (body: unknown) => withingsResponse(body);

describe("Notify", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(respond({}));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  const params = (call = 0) => new URL(fetchMock.mock.calls[call][0] as string).searchParams;
  const path = (call = 0) => new URL(fetchMock.mock.calls[call][0] as string).pathname;

  describe("subscribe", () => {
    it("sends the callback URL and category to /notify", async () => {
      await client().notify.subscribe({
        callbackurl: "https://example.com/withings/callback",
        appli: NotificationCategory.Weight,
      });

      expect(path()).toEqual("/notify");
      expect(params().get("action")).toEqual("subscribe");
      expect(params().get("callbackurl")).toEqual("https://example.com/withings/callback");
      expect(params().get("appli")).toEqual("1");
    });

    it("percent-encodes a callback URL carrying its own query string", async () => {
      await client().notify.subscribe({
        callbackurl: "https://example.com/cb?tenant=acme&v=2",
        appli: NotificationCategory.Activity,
      });

      // Read back through URLSearchParams: a callback URL that was not encoded
      // would have leaked its own parameters into the request.
      expect(params().get("callbackurl")).toEqual("https://example.com/cb?tenant=acme&v=2");
      expect(params().has("tenant")).toBe(false);
    });

    it("omits the signed-request fields when a bearer token is used", async () => {
      await client().notify.subscribe({
        callbackurl: "https://example.com/cb",
        appli: NotificationCategory.SleepSummary,
      });

      expect(params().has("signature")).toBe(false);
      expect(params().has("nonce")).toBe(false);
      expect(params().has("client_id")).toBe(false);
    });

    it("passes the signed-request fields when they are supplied", async () => {
      await client().notify.subscribe({
        callbackurl: "https://example.com/cb",
        appli: NotificationCategory.Weight,
        signature: "abc",
        nonce: "xyz",
        client_id: "cid",
      });

      expect(params().get("signature")).toEqual("abc");
      expect(params().get("nonce")).toEqual("xyz");
      expect(params().get("client_id")).toEqual("cid");
    });
  });

  describe("list", () => {
    it("requests every category when none is given", async () => {
      await client().notify.list();

      expect(params().get("action")).toEqual("list");
      expect(params().has("appli")).toBe(false);
    });

    it("types the returned profiles", async () => {
      fetchMock.mockResolvedValueOnce(
        respond({ profiles: [{ appli: 1, callbackurl: "https://example.com/cb", comment: "weights" }] })
      );

      const response = await client().notify.list({ appli: NotificationCategory.Weight });
      const body: ListNotifications = response.body;

      expect(body.profiles[0].appli).toEqual(NotificationCategory.Weight);
      expect(body.profiles[0].callbackurl).toEqual("https://example.com/cb");
    });
  });

  describe("update", () => {
    it("sends exactly one change per call", async () => {
      await client().notify.update({
        callbackurl: "https://example.com/cb",
        appli: NotificationCategory.Weight,
        new_callbackurl: "https://example.com/new",
      });

      expect(params().get("new_callbackurl")).toEqual("https://example.com/new");
      // The API documents these as mutually exclusive.
      expect(params().has("new_appli")).toBe(false);
      expect(params().has("comment")).toBe(false);
    });

    it("can move a subscription to another category", async () => {
      await client().notify.update({
        callbackurl: "https://example.com/cb",
        appli: NotificationCategory.Weight,
        new_appli: NotificationCategory.Activity,
      });

      expect(params().get("new_appli")).toEqual("16");
      expect(params().has("new_callbackurl")).toBe(false);
    });
  });

  describe("revoke", () => {
    it("removes a subscription by callback URL", async () => {
      await client().notify.revoke({ callbackurl: "https://example.com/cb" });

      expect(params().get("action")).toEqual("revoke");
      expect(params().get("callbackurl")).toEqual("https://example.com/cb");
    });
  });
});

describe("parseNotificationPayload", () => {
  it("parses the form-encoded body Withings posts", () => {
    // Every value arrives as a string, which is why appli would not otherwise
    // compare equal to a NotificationCategory.
    const event = parseNotificationPayload({
      userid: "37775776",
      appli: "1",
      startdate: "1704412800",
      enddate: "1704499200",
    });

    expect(event).toEqual({
      userid: 37775776,
      appli: NotificationCategory.Weight,
      startdate: 1704412800,
      enddate: 1704499200,
    });
    expect(event?.appli === NotificationCategory.Weight).toBe(true);
  });

  it("accepts URLSearchParams as well as a plain object", () => {
    const event = parseNotificationPayload(new URLSearchParams("userid=1&appli=16&startdate=10&enddate=20"));

    expect(event?.userid).toEqual(1);
    expect(event?.appli).toEqual(NotificationCategory.Activity);
  });

  it("keeps the date field as given, since its format varies by category", () => {
    expect(parseNotificationPayload({ userid: "1", appli: "50", date: "2024-01-05" })?.date).toEqual("2024-01-05");
    expect(parseNotificationPayload({ userid: "1", appli: "50", date: "1704412800" })?.date).toEqual("1704412800");
  });

  it("reads the action carried by a profile-change notification", () => {
    const event = parseNotificationPayload({ userid: "1", appli: "46", action: "unlink" });

    expect(event?.appli).toEqual(NotificationCategory.UserProfileChange);
    expect(event?.action).toEqual("unlink");
  });

  it("returns undefined for anything that is not a notification", () => {
    // A stray request to a public callback URL must be distinguishable.
    expect(parseNotificationPayload(undefined)).toBeUndefined();
    expect(parseNotificationPayload({})).toBeUndefined();
    expect(parseNotificationPayload({ appli: "1" })).toBeUndefined();
    expect(parseNotificationPayload({ userid: "not-a-number", appli: "1" })).toBeUndefined();
  });

  it("takes the first value when a field is repeated", () => {
    expect(parseNotificationPayload({ userid: ["7", "8"], appli: "1" })?.userid).toEqual(7);
  });
});
