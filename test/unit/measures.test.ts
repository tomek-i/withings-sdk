import { ActivityDataFields, MeasurementType, WithingsClient } from "../../src";

const jsonResponse = () =>
  ({ ok: true, status: 200, json: async () => ({ status: 0, body: {} }) }) as unknown as Response;

const client = () =>
  new WithingsClient({
    clientId: "id",
    clientSecret: "secret",
    redirectUri: "https://example.com/cb",
    accessToken: "token",
  });

describe("Measures query building", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(jsonResponse());
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  const requestedUrl = () => new URL(fetchMock.mock.calls[0][0] as string);

  describe("getActivity", () => {
    it("sends start/end dates as YYYYMMDD and omits lastupdate", async () => {
      await client().measures.getActivity({
        startDate: new Date(2024, 0, 5),
        endDate: new Date(2024, 10, 23),
      });

      const params = requestedUrl().searchParams;
      expect(params.get("startdateymd")).toEqual("20240105");
      expect(params.get("enddateymd")).toEqual("20241123");
      expect(params.has("lastupdate")).toBe(false);
    });

    it("sends lastupdate as unix seconds and omits the date range", async () => {
      await client().measures.getActivity({ lastUpdate: new Date("2024-01-05T00:00:00Z") });

      const params = requestedUrl().searchParams;
      expect(params.get("lastupdate")).toEqual("1704412800");
      expect(params.has("startdateymd")).toBe(false);
      expect(params.has("enddateymd")).toBe(false);
    });

    it("keeps an epoch-zero lastUpdate, which asks for all history", async () => {
      // Regression test: this path used to rely on comparing the Date against 0
      // through an `any` cast, and epoch 0 must not be dropped as falsy.
      await client().measures.getActivity({ lastUpdate: new Date(0) });

      expect(requestedUrl().searchParams.get("lastupdate")).toEqual("0");
    });

    it("serialises data_fields as the API's field names, not enum ordinals", async () => {
      await client().measures.getActivity({
        lastUpdate: new Date(0),
        data_fields: [ActivityDataFields.steps, ActivityDataFields.calories],
      });

      expect(requestedUrl().searchParams.get("data_fields")).toEqual("steps,calories");
    });
  });

  describe("getMeasurement", () => {
    it("omits every unset parameter", async () => {
      await client().measures.getMeasurement();

      const params = requestedUrl().searchParams;
      expect(params.get("action")).toEqual("getmeas");
      expect([...params.keys()]).toEqual(["action"]);
    });

    it("converts dates to unix seconds", async () => {
      await client().measures.getMeasurement({
        meastype: MeasurementType.Weight,
        startdate: new Date("2024-01-05T00:00:00Z"),
        enddate: new Date("2024-01-06T00:00:00Z"),
      });

      const params = requestedUrl().searchParams;
      expect(params.get("meastype")).toEqual(String(MeasurementType.Weight));
      expect(params.get("startdate")).toEqual("1704412800");
      expect(params.get("enddate")).toEqual("1704499200");
    });
  });
});
