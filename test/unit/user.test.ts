import { BatteryLevel, DeviceType, WithingsClient } from "../../src";
import type { GetDevice, GetGoals } from "../../src";
import { withingsResponse } from "../helpers/response";

const client = () =>
  new WithingsClient({
    clientId: "id",
    clientSecret: "secret",
    redirectUri: "https://example.com/cb",
    accessToken: "token",
  });

const respond = (body: unknown) => withingsResponse(body);

describe("User", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(respond({ devices: [] }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  const url = () => new URL(fetchMock.mock.calls[0][0] as string);

  describe("getDevice", () => {
    it("hits /v2/user with only the action", async () => {
      await client().user.getDevice();

      expect(url().pathname).toEqual("/v2/user");
      expect([...url().searchParams.keys()]).toEqual(["action"]);
      expect(url().searchParams.get("action")).toEqual("getdevice");
    });

    it("types the linked devices", async () => {
      fetchMock.mockResolvedValueOnce(
        respond({
          devices: [
            {
              type: "Scale",
              model: "Body+",
              model_id: 45,
              battery: "high",
              deviceid: "abc",
              timezone: "Europe/Berlin",
              first_session_date: 1600000000,
              last_session_date: 1704412800,
            },
          ],
        })
      );

      const response = await client().user.getDevice();
      const body: GetDevice = response.body;
      const device = body.devices[0];

      expect(device.type).toEqual(DeviceType.Scale);
      expect(device.battery).toEqual(BatteryLevel.High);
      expect(device.last_session_date).toEqual(1704412800);
      // Advanced-partner fields are simply absent on an ordinary plan.
      expect(device.mac_address).toBeUndefined();
    });

    it("tolerates a device type the SDK does not have an enum member for", async () => {
      // The enum is a convenience, not a closed set: Withings adds devices.
      fetchMock.mockResolvedValueOnce(respond({ devices: [{ type: "Something New", battery: "low" }] }));

      const device = (await client().user.getDevice()).body.devices[0];

      expect(device.type).toEqual("Something New");
      expect(device.battery).toEqual(BatteryLevel.Low);
    });
  });

  describe("getGoals", () => {
    it("hits /v2/user with only the action", async () => {
      fetchMock.mockResolvedValueOnce(respond({ goals: {} }));
      await client().user.getGoals();

      expect(url().searchParams.get("action")).toEqual("getgoals");
    });

    it("types the goals, with the weight scaled like a measurement", async () => {
      fetchMock.mockResolvedValueOnce(
        respond({ goals: { steps: 10000, sleep: 28800, weight: { value: 75000, unit: -3 } } })
      );

      const response = await client().user.getGoals();
      const body: GetGoals = response.body;

      expect(body.goals.steps).toEqual(10000);
      expect(body.goals.sleep).toEqual(28800);
      // value * 10^unit, the same convention getmeas uses.
      expect(body.goals.weight!.value! * 10 ** body.goals.weight!.unit!).toBeCloseTo(75);
    });

    it("treats an unset goal as absent rather than zero", async () => {
      fetchMock.mockResolvedValueOnce(respond({ goals: { steps: 8000 } }));

      const goals = (await client().user.getGoals()).body.goals;

      expect(goals.steps).toEqual(8000);
      expect(goals.sleep).toBeUndefined();
      expect(goals.weight).toBeUndefined();
    });
  });
});

describe("User signature-authenticated services", () => {
  let fetchMock: jest.Mock;

  const signedClient = () =>
    new WithingsClient({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      redirectUri: "https://example.com/cb",
    });

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(respond({ nonce: "server-nonce" }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  const lastUrl = () => new URL(fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0] as string);
  const lastInit = () => fetchMock.mock.calls[fetchMock.mock.calls.length - 1][1] as RequestInit;

  it("sends user.get without a bearer token, since it authorizes by signature", async () => {
    const c = signedClient();
    const signed = await c.auth.signedParams("get");

    fetchMock.mockResolvedValueOnce(respond({ user: { email: "a@example.com" } }));
    await c.user.get({ ...signed, email: "a@example.com" });

    const headers = lastInit().headers as Record<string, string>;
    // No user has authorized this client, and none needs to have.
    expect(headers.Authorization).toBeUndefined();
    expect(lastUrl().searchParams.get("signature")).toEqual(signed.signature);
    expect(lastUrl().searchParams.get("email")).toEqual("a@example.com");
  });

  it("identifies a user by id instead of email", async () => {
    const c = signedClient();
    const signed = await c.auth.signedParams("get");

    fetchMock.mockResolvedValueOnce(respond({ user: {} }));
    await c.user.get({ ...signed, userid: "12345" });

    expect(lastUrl().searchParams.get("userid")).toEqual("12345");
    expect(lastUrl().searchParams.has("email")).toBe(false);
  });

  it("JSON encodes the nested activate parameters", async () => {
    const c = signedClient();
    const signed = await c.auth.signedParams("activate");

    fetchMock.mockResolvedValueOnce(respond({ user: { code: "auth-code" } }));
    await c.user.activate({
      ...signed,
      email: "new@example.com",
      shortname: "Rob",
      external_id: "partner-1",
      gender: 0,
      birthdate: new Date("1990-01-05T00:00:00Z"),
      timezone: "Europe/Berlin",
      preflang: "en_US",
      mailingpref: false,
      measures: { height: 1.8, weight: 75 },
      unit_pref: { weight: 1, height: 6 },
      mac_addresses: ["00:11:22:33:44:55", "66:77:88:99:aa:bb"],
    });

    const params = lastUrl().searchParams;
    // The API takes these as JSON strings rather than repeated parameters.
    expect(JSON.parse(params.get("measures") as string)).toEqual({ height: 1.8, weight: 75 });
    expect(JSON.parse(params.get("unit_pref") as string)).toEqual({ weight: 1, height: 6 });
    expect(params.get("mac_addresses")).toEqual("00:11:22:33:44:55,66:77:88:99:aa:bb");
    expect(params.get("birthdate")).toEqual("631497600");
    // Not supplied, so not sent.
    expect(params.has("goals")).toBe(false);
  });
});

describe("User device linking", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(respond({ devices: [] }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  const params = () => new URL(fetchMock.mock.calls[0][0] as string).searchParams;

  it("links several devices in one call", async () => {
    await client().user.link({ mac_addresses: ["aa:bb", "cc:dd"] });

    expect(params().get("action")).toEqual("link");
    expect(params().get("mac_addresses")).toEqual("aa:bb,cc:dd");
  });

  it("unlinks a single device", async () => {
    await client().user.unlink({ mac_address: "aa:bb" });

    expect(params().get("action")).toEqual("unlink");
    expect(params().get("mac_address")).toEqual("aa:bb");
  });

  it("uses the bearer token for linking, which acts on the authorized user", async () => {
    await client().user.link({ mac_addresses: ["aa:bb"] });

    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toEqual("Bearer token");
  });
});
