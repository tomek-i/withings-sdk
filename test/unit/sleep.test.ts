import { MeasurementType, SleepDataFields, SleepState, SleepSummaryDataFields, WithingsClient } from "../../src";
import type { GetSleep, GetSleepSummary, SleepSeriesEntry, SleepSummary } from "../../src";
import { withingsResponse } from "../helpers/response";

const client = () =>
  new WithingsClient({
    clientId: "id",
    clientSecret: "secret",
    redirectUri: "https://example.com/cb",
    accessToken: "token",
  });

const respond = (body: unknown) => withingsResponse(body);

describe("Sleep", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  const url = (call = 0) => new URL(fetchMock.mock.calls[call][0] as string);

  describe("get", () => {
    it("sends the period as unix seconds and hits /v2/sleep", async () => {
      fetchMock.mockResolvedValueOnce(respond({ series: [], model: 32 }));

      await client().sleep.get({
        startdate: new Date("2024-01-05T00:00:00Z"),
        enddate: new Date("2024-01-06T00:00:00Z"),
      });

      const requested = url();
      expect(requested.pathname).toEqual("/v2/sleep");
      expect(requested.searchParams.get("action")).toEqual("get");
      expect(requested.searchParams.get("startdate")).toEqual("1704412800");
      expect(requested.searchParams.get("enddate")).toEqual("1704499200");
    });

    it("serialises data_fields and meastypes as comma separated names", async () => {
      fetchMock.mockResolvedValueOnce(respond({ series: [] }));

      await client().sleep.get({
        startdate: new Date(0),
        enddate: new Date(0),
        data_fields: [SleepDataFields.hr, SleepDataFields.rr],
        meastypes: [MeasurementType.Weight, MeasurementType.HeartPulse],
      });

      expect(url().searchParams.get("data_fields")).toEqual("hr,rr");
      expect(url().searchParams.get("meastypes")).toEqual("1,11");
    });

    it("types the series, including the timestamp-keyed measurements", async () => {
      fetchMock.mockResolvedValueOnce(
        respond({
          model: 32,
          series: [
            {
              startdate: 1704412800,
              enddate: 1704416400,
              state: 1,
              hr: { "1704412800": 58, "1704412860": 57 },
              rr: { "1704412800": 14 },
            },
          ],
        })
      );

      const response = await client().sleep.get({ startdate: new Date(0), enddate: new Date(0) });
      const body: GetSleep = response.body;

      const entry: SleepSeriesEntry = body.series[0];
      expect(entry.state).toEqual(SleepState.Light);
      expect(entry.hr?.["1704412800"]).toEqual(58);
      expect(entry.rr?.["1704412800"]).toEqual(14);
      expect(entry.snoring).toBeUndefined();
    });
  });

  describe("getSummary", () => {
    it("sends a date range as YYYY-MM-DD and omits lastupdate", async () => {
      fetchMock.mockResolvedValueOnce(respond({ series: [], more: false }));

      await client().sleep.getSummary({
        startDate: new Date(2024, 0, 5),
        endDate: new Date(2024, 10, 23),
      });

      const params = url().searchParams;
      expect(params.get("action")).toEqual("getsummary");
      expect(params.get("startdateymd")).toEqual("2024-01-05");
      expect(params.get("enddateymd")).toEqual("2024-11-23");
      expect(params.has("lastupdate")).toBe(false);
    });

    it("sends lastupdate as unix seconds and omits the date range", async () => {
      fetchMock.mockResolvedValueOnce(respond({ series: [], more: false }));

      await client().sleep.getSummary({ lastUpdate: new Date("2024-01-05T00:00:00Z") });

      const params = url().searchParams;
      expect(params.get("lastupdate")).toEqual("1704412800");
      expect(params.has("startdateymd")).toBe(false);
    });

    it("keeps an epoch-zero lastUpdate, which asks for all history", async () => {
      fetchMock.mockResolvedValueOnce(respond({ series: [], more: false }));

      await client().sleep.getSummary({ lastUpdate: new Date(0) });

      expect(url().searchParams.get("lastupdate")).toEqual("0");
    });

    it("types the nightly summaries and their nested data", async () => {
      fetchMock.mockResolvedValueOnce(
        respond({
          series: [
            {
              id: 1,
              timezone: "Europe/Berlin",
              startdate: 1704412800,
              enddate: 1704441600,
              date: "2024-01-05",
              completed: true,
              data: {
                total_sleep_time: 27000,
                sleep_score: 82,
                sleep_efficiency: 0.93,
                night_events: { "1": [120, 300] },
              },
            },
          ],
          more: false,
          offset: 0,
        })
      );

      const response = await client().sleep.getSummary({ lastUpdate: new Date(0) });
      const body: GetSleepSummary = response.body;

      const night: SleepSummary = body.series[0];
      expect(night.completed).toBe(true);
      expect(night.data?.total_sleep_time).toEqual(27000);
      expect(night.data?.sleep_efficiency).toBeCloseTo(0.93);
      // night_events is a dictionary of event type to timestamps, not an array.
      expect(night.data?.night_events?.["1"]).toEqual([120, 300]);
      expect(night.data?.waso).toBeUndefined();
    });

    it("serialises data_fields as the API's field names", async () => {
      fetchMock.mockResolvedValueOnce(respond({ series: [], more: false }));

      await client().sleep.getSummary({
        lastUpdate: new Date(0),
        data_fields: [SleepSummaryDataFields.total_sleep_time, SleepSummaryDataFields.sleep_score],
      });

      expect(url().searchParams.get("data_fields")).toEqual("total_sleep_time,sleep_score");
    });
  });

  describe("getSummaryPages", () => {
    it("walks the pages, following the offset", async () => {
      fetchMock
        .mockResolvedValueOnce(respond({ series: [{ id: 1 }], more: true, offset: 20 }))
        .mockResolvedValueOnce(respond({ series: [{ id: 2 }], more: false }));

      const ids: number[] = [];
      for await (const page of client().sleep.getSummaryPages({ lastUpdate: new Date(0) })) {
        for (const night of page.series) if (night.id !== undefined) ids.push(night.id);
      }

      expect(ids).toEqual([1, 2]);
      expect(url(1).searchParams.get("offset")).toEqual("20");
    });
  });
});
