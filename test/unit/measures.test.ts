import {
  ActivityDataFields,
  GetWorkoutDataFields,
  IntraDayActivityDataFields,
  MeasurementType,
  WithingsClient,
} from "../../src";
import { withingsResponse } from "../helpers/response";

const jsonResponse = () => withingsResponse({});

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
    it("sends start/end dates as YYYY-MM-DD and omits lastupdate", async () => {
      await client().measures.getActivity({
        startDate: new Date(2024, 0, 5),
        endDate: new Date(2024, 10, 23),
      });

      const params = requestedUrl().searchParams;
      expect(params.get("startdateymd")).toEqual("2024-01-05");
      expect(params.get("enddateymd")).toEqual("2024-11-23");
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

describe("getWorkouts query building", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(jsonResponse());
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  const params = () => new URL(fetchMock.mock.calls[0][0] as string).searchParams;

  it("sends a date range as YYYY-MM-DD and omits lastupdate", async () => {
    await client().measures.getWorkouts({
      startDate: new Date(2024, 0, 5),
      endDate: new Date(2024, 10, 23),
    });

    expect(params().get("action")).toEqual("getworkouts");
    expect(params().get("startdateymd")).toEqual("2024-01-05");
    expect(params().get("enddateymd")).toEqual("2024-11-23");
    // Regression test: this method used to send the date range AND lastupdate
    // together, which the API documents as mutually exclusive.
    expect(params().has("lastupdate")).toBe(false);
  });

  it("sends lastupdate as unix seconds and omits the date range", async () => {
    await client().measures.getWorkouts({ lastUpdate: new Date("2024-01-05T00:00:00Z") });

    expect(params().get("lastupdate")).toEqual("1704412800");
    expect(params().has("startdateymd")).toBe(false);
    expect(params().has("enddateymd")).toBe(false);
  });

  it("serialises data_fields as the API's field names", async () => {
    await client().measures.getWorkouts({
      lastUpdate: new Date(0),
      data_fields: [GetWorkoutDataFields.calories, GetWorkoutDataFields.hr_average],
    });

    expect(params().get("data_fields")).toEqual("calories,hr_average");
  });
});

describe("getIntradayActivity query building", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(jsonResponse());
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  const params = () => new URL(fetchMock.mock.calls[0][0] as string).searchParams;

  it("sends only the action when no options are given", async () => {
    await client().measures.getIntradayActivity();

    expect([...params().keys()]).toEqual(["action"]);
    expect(params().get("action")).toEqual("getintradayactivity");
  });

  it("converts the period to unix seconds", async () => {
    await client().measures.getIntradayActivity({
      startdate: new Date("2024-01-05T00:00:00Z"),
      enddate: new Date("2024-01-05T12:00:00Z"),
    });

    expect(params().get("startdate")).toEqual("1704412800");
    expect(params().get("enddate")).toEqual("1704456000");
  });

  it("serialises data_fields, without which no metrics come back", async () => {
    await client().measures.getIntradayActivity({
      data_fields: [IntraDayActivityDataFields.steps, IntraDayActivityDataFields.heart_rate],
    });

    expect(params().get("data_fields")).toEqual("steps,heart_rate");
  });
});

describe("MeasurementType coverage", () => {
  it("includes the measure types added from the specification", () => {
    expect(MeasurementType.FatFreeMassSegments).toEqual(173);
    expect(MeasurementType.BasalMetabolicRate).toEqual(226);
    expect(MeasurementType.MetabolicAge).toEqual(227);
    expect(MeasurementType.ElectrochemicalSkinConductance).toEqual(229);
  });

  it("covers all 35 documented measure types", () => {
    const values = Object.values(MeasurementType).filter((v) => typeof v === "number");
    expect(values).toHaveLength(35);
  });
});
