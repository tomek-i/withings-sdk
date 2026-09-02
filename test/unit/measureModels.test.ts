import { WithingsClient } from "../../src";
import { withingsResponse } from "../helpers/response";
import type {
  Activity,
  GetActivity,
  GetIntradayActivity,
  GetMeasurements,
  GetWorkouts,
  IntradayActivityEntry,
  Workout,
} from "../../src";

/**
 * These assert two separate things:
 *
 * 1. at runtime, that a realistic payload survives the client untouched, and
 * 2. at compile time, that the response bodies are actually typed. Before this,
 *    every Measures method resolved to `WithingsResponse<unknown>` because the
 *    generic was never supplied at the call site, so none of the model types
 *    were reachable by callers.
 */

const respondWith = (body: unknown) => {
  const fetchMock = jest.fn().mockImplementation(async () => withingsResponse(body));
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
};

const client = () =>
  new WithingsClient({
    clientId: "id",
    clientSecret: "secret",
    redirectUri: "https://example.com/cb",
    accessToken: "token",
  });

describe("getMeasurement response", () => {
  it("exposes measure groups, and carries pagination fields", async () => {
    respondWith({
      updatetime: 1704412800,
      timezone: "Europe/Berlin",
      more: 1,
      offset: 100,
      measuregrps: [
        {
          grpid: 1,
          attrib: 0,
          date: 1704412800,
          created: 1704412801,
          modified: 1704412802,
          category: 1,
          // Real responses return null for these on manually entered data.
          deviceid: null,
          hash_deviceid: null,
          modelid: null,
          model: null,
          comment: null,
          timezone: "Europe/Berlin",
          measures: [{ value: 74250, type: 1, unit: -3, algo: 0, fm: 3, apppfmid: 0, appliver: 0 }],
        },
      ],
    });

    const response = await client().measures.getMeasurement();
    const body: GetMeasurements = response.body;

    expect(body.timezone).toEqual("Europe/Berlin");
    // The live API returns a number here, though the specification says string.
    expect(typeof body.updatetime).toEqual("number");
    // getmeas reports `more` as a number, unlike getactivity/getworkouts.
    expect(body.more).toEqual(1);
    expect(body.offset).toEqual(100);

    const group = body.measuregrps[0];
    expect(group.model).toBeNull();
    expect(group.modelid).toBeNull();
    expect(group.timezone).toEqual("Europe/Berlin");
    // value * 10^unit is the documented way to reconstitute the real figure.
    expect(group.measures[0].value * 10 ** group.measures[0].unit).toBeCloseTo(74.25);
  });
});

describe("getActivity response", () => {
  it("exposes typed activity rows", async () => {
    respondWith({
      activities: [
        {
          date: "2024-01-05",
          timezone: "Europe/Berlin",
          deviceid: "abc",
          hash_deviceid: null,
          brand: 18,
          is_tracker: true,
          steps: 8432,
          distance: 6221.5,
          elevation: 3,
          calories: 412.7,
          totalcalories: 2210.4,
          hr_average: 71,
          hr_zone_0: 3600,
        },
      ],
      more: false,
      offset: 0,
    });

    const response = await client().measures.getActivity({ lastUpdate: new Date(0) });
    const body: GetActivity = response.body;

    const activity: Activity = body.activities[0];
    expect(activity.date).toEqual("2024-01-05");
    expect(activity.steps).toEqual(8432);
    expect(activity.distance).toBeCloseTo(6221.5);
    expect(activity.is_tracker).toBe(true);
    expect(body.more).toBe(false);
  });

  it("tolerates rows that omit unrequested data fields", async () => {
    respondWith({
      activities: [{ date: "2024-01-05", timezone: "Europe/Berlin", steps: 10 }],
      more: false,
      offset: 0,
    });

    const response = await client().measures.getActivity({ lastUpdate: new Date(0) });
    const activity = response.body.activities[0];

    expect(activity.steps).toEqual(10);
    expect(activity.calories).toBeUndefined();
  });
});

describe("getWorkouts response", () => {
  it("exposes typed workout series with nested data", async () => {
    respondWith({
      series: [
        {
          id: 9911,
          category: 1,
          timezone: "Europe/Berlin",
          model: 16,
          attrib: 2,
          startdate: 1704412800,
          enddate: 1704416400,
          date: "2024-01-05",
          modified: 1704416500,
          deviceid: "abc",
          data: { calories: 300.5, steps: 5200, hr_average: 132, core_body_temperature_avg: 37 },
        },
      ],
      more: false,
      offset: 0,
    });

    const response = await client().measures.getWorkouts({ lastUpdate: new Date(0) });
    const body: GetWorkouts = response.body;

    const workout: Workout = body.series[0];
    expect(workout.id).toEqual(9911);
    expect(workout.enddate).toEqual(1704416400);
    expect(workout.startdate).toEqual(1704412800);
    expect(workout.data?.calories).toBeCloseTo(300.5);
    expect(workout.data?.pool_laps).toBeUndefined();
  });
});

describe("getIntradayActivity response", () => {
  it("exposes the series keyed by unix timestamp", async () => {
    respondWith({
      series: {
        "1704412800": { deviceid: "abc", model: "Steel HR", model_id: 55, steps: 120, duration: 60, heart_rate: 88 },
        "1704412860": { steps: 0, duration: 60 },
      },
    });

    const response = await client().measures.getIntradayActivity();
    const body: GetIntradayActivity = response.body;

    const first: IntradayActivityEntry = body.series["1704412800"];
    expect(first.heart_rate).toEqual(88);
    expect(first.model).toEqual("Steel HR");
    expect(body.series["1704412860"].heart_rate).toBeUndefined();

    // Keys are unix seconds, so they must survive as parseable numbers.
    expect(Object.keys(body.series).map(Number)).toEqual([1704412800, 1704412860]);
  });
});

describe("confirmUser response", () => {
  it("returns an empty body, with the outcome carried by status", async () => {
    respondWith({});

    const response = await client().measures.confirmUser({ grpid: 1, is_confirmed: true });

    expect(response.status).toEqual(0);
    expect(response.body).toEqual({});
  });
});
