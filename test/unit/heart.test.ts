import { AfibClassification, HeartDeviceModel, WearPosition, WithingsClient } from "../../src";
import type { GetHeartSignal, ListHeart } from "../../src";

const client = () =>
  new WithingsClient({
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    redirectUri: "https://example.com/cb",
    accessToken: "token",
  });

const respond = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => ({ status: 0, body }) }) as unknown as Response;

describe("Heart", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(respond({ series: [], more: false }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  const url = (call = 0) => new URL(fetchMock.mock.calls[call][0] as string);

  describe("list", () => {
    it("hits /v2/heart and converts the period to unix seconds", async () => {
      await client().heart.list({
        startdate: new Date("2024-01-05T00:00:00Z"),
        enddate: new Date("2024-01-06T00:00:00Z"),
      });

      expect(url().pathname).toEqual("/v2/heart");
      expect(url().searchParams.get("action")).toEqual("list");
      expect(url().searchParams.get("startdate")).toEqual("1704412800");
      expect(url().searchParams.get("enddate")).toEqual("1704499200");
    });

    it("sends only the action when no period is given", async () => {
      await client().heart.list();
      expect([...url().searchParams.keys()]).toEqual(["action"]);
    });

    it("types the recordings, including the parts a device may omit", async () => {
      fetchMock.mockResolvedValueOnce(
        respond({
          series: [
            {
              deviceid: "abc",
              model: 44,
              ecg: { signalid: 991, afib: 1 },
              bloodpressure: { diastole: 78, systole: 121 },
              heart_rate: 64,
              timestamp: 1704412800,
            },
          ],
          more: false,
          offset: 0,
        })
      );

      const response = await client().heart.list();
      const body: ListHeart = response.body;
      const record = body.series[0];

      expect(record.model).toEqual(HeartDeviceModel.BpmCore);
      expect(record.ecg?.afib).toEqual(AfibClassification.Positive);
      expect(record.ecg?.signalid).toEqual(991);
      expect(record.bloodpressure?.systole).toEqual(121);
      // A BPM Core records a stethoscope track, a Move ECG does not.
      expect(record.stetho).toBeUndefined();
    });
  });

  describe("listPages", () => {
    it("walks the pages, following the offset", async () => {
      fetchMock
        .mockResolvedValueOnce(respond({ series: [{ heart_rate: 60 }], more: true, offset: 40 }))
        .mockResolvedValueOnce(respond({ series: [{ heart_rate: 61 }], more: false }));

      const rates: number[] = [];
      for await (const page of client().heart.listPages()) {
        for (const r of page.series) if (r.heart_rate) rates.push(r.heart_rate);
      }

      expect(rates).toEqual([60, 61]);
      expect(url(1).searchParams.get("offset")).toEqual("40");
    });
  });

  describe("get", () => {
    it("fetches a signal by id, using the access token", async () => {
      fetchMock.mockResolvedValueOnce(respond({ signal: [1, 2, 3], sampling_frequency: 300 }));

      await client().heart.get({ signalid: 991 });

      expect(url().searchParams.get("action")).toEqual("get");
      expect(url().searchParams.get("signalid")).toEqual("991");
      // The signed-request fields belong to the other form.
      expect(url().searchParams.has("signature")).toBe(false);
      expect(url().searchParams.has("signal_token")).toBe(false);
    });

    it("types the signal and its sampling frequency", async () => {
      fetchMock.mockResolvedValueOnce(
        respond({
          signal: [-12, 4, 37],
          sampling_frequency: 300,
          wearposition: 1,
          model: 91,
          heart_rate: { grpid: 5, value: 63, date: 1704412800, is_deleted: false },
        })
      );

      const response = await client().heart.get({ signalid: 991 });
      const body: GetHeartSignal = response.body;

      expect(body.signal).toEqual([-12, 4, 37]);
      expect(body.sampling_frequency).toEqual(300);
      expect(body.wearposition).toEqual(WearPosition.LeftWrist);
      expect(body.model).toEqual(HeartDeviceModel.MoveEcg);
      expect(body.heart_rate?.value).toEqual(63);
    });

    it("passes the optional signal flags through", async () => {
      fetchMock.mockResolvedValueOnce(respond({ signal: [] }));

      await client().heart.get({ signalid: 1, with_filtered: true, with_intervals: true });

      expect(url().searchParams.get("with_filtered")).toEqual("true");
      expect(url().searchParams.get("with_intervals")).toEqual("true");
    });

    it("accepts a signed request spread straight from signedParams", async () => {
      const c = client();
      fetchMock.mockResolvedValueOnce(respond({ nonce: "server-nonce" }));
      const signed = await c.auth.signedParams("get");

      fetchMock.mockResolvedValueOnce(respond({ signal: [] }));
      await c.heart.get({ ...signed, signal_token: "tok" });

      const params = url(1).searchParams;
      expect(params.get("signal_token")).toEqual("tok");
      expect(params.get("nonce")).toEqual("server-nonce");
      expect(params.get("signature")).toEqual(signed.signature);
      expect(params.get("client_id")).toEqual("test-client-id");
      // The signature covers action "get", which is what the request sends.
      expect(params.get("action")).toEqual("get");
      expect(params.has("signalid")).toBe(false);
    });
  });
});
