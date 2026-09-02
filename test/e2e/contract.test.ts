import {
  ActivityDataFields,
  GetWorkoutDataFields,
  IntraDayActivityDataFields,
  MeasurementType,
  SleepDataFields,
  SleepSummaryDataFields,
  WithingsClient,
} from "../../src";
import { type Contract, expectContract, reportAbsent } from "../helpers/contract";
import { env } from "../helpers/env";
import { persistTokens } from "../helpers/persistTokens";

/**
 * Contract tests against the live Withings API.
 *
 * Every endpoint the SDK implements is called with the widest request it
 * accepts, and the response is checked against the types the SDK claims. A
 * field of an unexpected type fails, and so does a field the SDK does not
 * model at all — that is the signal that the API has changed under us.
 *
 * Deliberately absent: `confirmUser`. It writes to the account holder's data,
 * confirming or rejecting a measure group, and a test suite has no business
 * mutating someone's health record.
 */
describe("live API contract", () => {
  let client: WithingsClient;

  beforeAll(() => {
    if (!env.WITHINGS_ACCESS_TOKEN) {
      throw new Error("Run `pnpm run authorize` first: this suite needs a live token pair.");
    }

    client = new WithingsClient({
      clientId: env.WITHINGS_CLIENT_ID,
      clientSecret: env.WITHINGS_CLIENT_SECRET,
      redirectUri: env.WITHINGS_REDIRECT_URI,
      accessToken: env.WITHINGS_ACCESS_TOKEN,
      refreshToken: env.WITHINGS_REFRESH_TOKEN,
    });
  });

  afterAll(() => {
    // A refresh rotates the pair, so hand the new one back or the next run fails.
    persistTokens(client?.auth.getCurrentAccessToken() ?? null, client?.auth.getCurrentRefreshToken() ?? null);
  });

  describe("measure.getMeasurement", () => {
    const measureGroup: Contract = {
      grpid: ["number"],
      attrib: ["number"],
      date: ["number"],
      created: ["number"],
      modified: ["number"],
      category: ["number"],
      deviceid: ["string", "null"],
      hash_deviceid: ["string", "null"],
      measures: ["array"],
      modelid: ["number", "null"],
      model: ["string", "null"],
      comment: ["string", "null"],
      timezone: ["string"],
    };

    const measure: Contract = {
      value: ["number"],
      type: ["number"],
      unit: ["number"],
      position: ["number", "null"],
      algo: ["number"],
      fm: ["number"],
      apppfmid: ["number"],
      appliver: ["number"],
    };

    it("matches the modelled shape", async () => {
      const response = await client.measures.getMeasurement({ lastupdate: new Date(0) });

      expect(response.status).toEqual(0);
      expectContract("getmeas body", response.body, {
        updatetime: ["number", "string"],
        timezone: ["string"],
        measuregrps: ["array"],
        more: ["number", "boolean"],
        offset: ["number"],
      });

      const group = response.body.measuregrps?.[0];
      expectContract("getmeas measuregrps[]", group, measureGroup);
      expectContract("getmeas measures[]", group?.measures?.[0], measure);
    });

    it("pages without repeating or stalling", async () => {
      let pages = 0;
      const seen = new Set<number>();

      for await (const page of client.measures.getMeasurementPages({ meastype: MeasurementType.Weight })) {
        for (const group of page.measuregrps ?? []) seen.add(group.grpid);
        if (++pages >= 2) break;
      }

      expect(pages).toBeGreaterThan(0);
      // Distinct grpids across pages: a stalled offset would repeat them.
      expect(seen.size).toBeGreaterThan(0);
    });
  });

  describe("measure.getActivity", () => {
    const activity: Contract = {
      date: ["string"],
      timezone: ["string"],
      deviceid: ["string", "null"],
      hash_deviceid: ["string", "null"],
      brand: ["number"],
      is_tracker: ["boolean"],
      modified: ["number"],
      model: ["string", "null"],
      modelid: ["number", "null"],
      steps: ["number"],
      distance: ["number"],
      elevation: ["number"],
      soft: ["number"],
      moderate: ["number"],
      intense: ["number"],
      active: ["number"],
      calories: ["number"],
      totalcalories: ["number"],
      hr_average: ["number"],
      hr_min: ["number"],
      hr_max: ["number"],
      hr_zone_0: ["number"],
      hr_zone_1: ["number"],
      hr_zone_2: ["number"],
      hr_zone_3: ["number"],
    };

    it("matches the modelled shape", async () => {
      const data_fields = Object.values(ActivityDataFields);
      const response = await client.measures.getActivity({ lastUpdate: new Date(0), data_fields });

      expect(response.status).toEqual(0);
      expectContract("getactivity body", response.body, {
        activities: ["array"],
        more: ["boolean", "number"],
        offset: ["number"],
      });

      const row = response.body.activities?.[0];
      expectContract("getactivity activities[]", row, activity);
      reportAbsent("getactivity", row, data_fields);
    });
  });

  describe("measure.getWorkouts", () => {
    const workout: Contract = {
      id: ["number"],
      category: ["number"],
      timezone: ["string"],
      model: ["number"],
      attrib: ["number"],
      startdate: ["number"],
      enddate: ["number"],
      date: ["string"],
      modified: ["number"],
      created: ["number"],
      deviceid: ["string", "null"],
      hash_deviceid: ["string", "null"],
      data: ["object"],
    };

    it("matches the modelled shape", async () => {
      const data_fields = Object.values(GetWorkoutDataFields);
      const response = await client.measures.getWorkouts({ lastUpdate: new Date(0), data_fields });

      expect(response.status).toEqual(0);
      expectContract("getworkouts body", response.body, {
        series: ["array"],
        more: ["boolean", "number"],
        offset: ["number"],
      });

      const row = response.body.series?.[0];
      expectContract("getworkouts series[]", row, workout);
      reportAbsent("getworkouts data", row?.data, data_fields);
    });
  });

  describe("measure.getIntradayActivity", () => {
    const entry: Contract = {
      deviceid: ["string", "null"],
      model: ["string", "null"],
      model_id: ["number", "null"],
      duration: ["number"],
      steps: ["number"],
      elevation: ["number"],
      calories: ["number"],
      distance: ["number"],
      stroke: ["number"],
      pool_lap: ["number"],
      heart_rate: ["number"],
      spo2_auto: ["number"],
      rmssd: ["number"],
      sdnn1: ["number"],
      hrv_quality: ["number"],
      core_body_temperature: ["number"],
      rr: ["number"],
      chest_movement_rate: ["number"],
    };

    it("matches the modelled shape", async () => {
      const now = Date.now();
      const response = await client.measures.getIntradayActivity({
        startdate: new Date(now - 2 * 24 * 3600 * 1000),
        enddate: new Date(now - 1 * 24 * 3600 * 1000),
        data_fields: Object.values(IntraDayActivityDataFields),
      });

      expect(response.status).toEqual(0);
      expectContract("getintradayactivity body", response.body, { series: ["object", "array"] });

      const first = Object.values(response.body.series ?? {})[0];
      expectContract("getintradayactivity series entry", first, entry);
    });
  });

  describe("notify.list", () => {
    // Only `list` is exercised. subscribe, update and revoke change what
    // Withings sends to a callback URL, and a test suite has no business
    // altering the account holder's subscriptions.
    it("matches the modelled shape", async () => {
      const response = await client.notify.list();

      expect(response.status).toEqual(0);
      expectContract("notify.list body", response.body, { profiles: ["array"] });
      expectContract("notify.list profiles[]", response.body.profiles?.[0], {
        appli: ["number"],
        callbackurl: ["string"],
        comment: ["string", "null"],
        expires: ["number", "null"],
      });
    });
  });

  describe("sleep.get", () => {
    const seriesEntry: Contract = {
      startdate: ["number"],
      enddate: ["number"],
      state: ["number"],
      model: ["string", "null"],
      model_id: ["number", "null"],
      hash_deviceid: ["string", "null"],
      hr: ["object"],
      rr: ["object"],
      snoring: ["object"],
      sdnn_1: ["object"],
      rmssd: ["object"],
      hrv_quality: ["object"],
      mvt_score: ["object"],
      chest_movement_rate: ["object"],
      withings_index: ["object"],
      breathing_sounds: ["object"],
    };

    it("returns series as an array, not the object the specification declares", async () => {
      const now = Date.now();
      const response = await client.sleep.get({
        startdate: new Date(now - 3 * 24 * 3600 * 1000),
        enddate: new Date(now),
        data_fields: Object.values(SleepDataFields),
      });

      expect(response.status).toEqual(0);
      // The published specification types this as a bare object. It is an array.
      expect(Array.isArray(response.body.series)).toBe(true);

      expectContract("sleep.get body", response.body, { series: ["array"], model: ["number"] });
      expectContract("sleep.get series[]", response.body.series?.[0], seriesEntry);
    });
  });

  describe("sleep.getSummary", () => {
    const summary: Contract = {
      id: ["number"],
      timezone: ["string"],
      model: ["number"],
      model_id: ["number"],
      startdate: ["number"],
      enddate: ["number"],
      date: ["string"],
      created: ["number"],
      modified: ["number"],
      hash_deviceid: ["string", "null"],
      completed: ["boolean"],
      data: ["object"],
    };

    it("matches the modelled shape", async () => {
      const data_fields = Object.values(SleepSummaryDataFields);
      const response = await client.sleep.getSummary({ lastUpdate: new Date(0), data_fields });

      expect(response.status).toEqual(0);
      expectContract("sleep.getsummary body", response.body, {
        series: ["array"],
        more: ["boolean", "number"],
        offset: ["number"],
      });

      const night = response.body.series?.[0];
      expectContract("sleep.getsummary series[]", night, summary);

      // Every field is a number except night_events, a map of event type to
      // timestamps. Checked loosely because the set depends on the plan.
      for (const [key, value] of Object.entries(night?.data ?? {})) {
        if (key === "night_events") expect(typeof value).toEqual("object");
        else expect(typeof value).toEqual("number");
      }

      reportAbsent("sleep.getsummary data", night?.data, data_fields);
    });
  });
});
