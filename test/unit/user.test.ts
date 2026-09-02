import { BatteryLevel, DeviceType, WithingsClient } from "../../src";
import type { GetDevice, GetGoals } from "../../src";

const client = () =>
  new WithingsClient({
    clientId: "id",
    clientSecret: "secret",
    redirectUri: "https://example.com/cb",
    accessToken: "token",
  });

const respond = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => ({ status: 0, body }) }) as unknown as Response;

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
