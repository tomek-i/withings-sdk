import {
  ActivityDataFields,
  BiomarkerPack,
  IntraDayActivityDataFields,
  MeasurementType,
  missingDataFields,
  requiredPack,
  requiresPaidPlan,
  SleepDataFields,
  SleepSummaryDataFields,
  WithingsApiError,
  WithingsResponseStatus,
} from "../../src";

describe("requiredPack", () => {
  it("reports the free-plan metrics as Basic", () => {
    expect(requiredPack(ActivityDataFields.steps)).toEqual(BiomarkerPack.Basic);
    expect(requiredPack(SleepSummaryDataFields.total_sleep_time)).toEqual(BiomarkerPack.Basic);
    expect(requiredPack(MeasurementType.Weight)).toEqual(BiomarkerPack.Basic);
    expect(requiredPack(MeasurementType.SystolicBloodPressure)).toEqual(BiomarkerPack.Basic);
  });

  it("reports the paid-plan metrics as Total", () => {
    expect(requiredPack(SleepSummaryDataFields.sleep_score)).toEqual(BiomarkerPack.Total);
    expect(requiredPack(SleepDataFields.hr)).toEqual(BiomarkerPack.Total);
    expect(requiredPack(IntraDayActivityDataFields.spo2_auto)).toEqual(BiomarkerPack.Total);
    expect(requiredPack(MeasurementType.VO2Max)).toEqual(BiomarkerPack.Total);
    expect(requiredPack(MeasurementType.VisceralFat)).toEqual(BiomarkerPack.Total);
  });

  it("distinguishes automatic from manual SpO2, which sit in different packs", () => {
    expect(requiredPack(IntraDayActivityDataFields.spo2_auto)).toEqual(BiomarkerPack.Total);
    expect(requiredPack(MeasurementType.SPO02)).toEqual(BiomarkerPack.Basic);
  });

  it("returns undefined for anything the published table does not map", () => {
    // Absent must mean "unknown", never "free".
    expect(requiredPack("not_a_real_field")).toBeUndefined();
    expect(requiresPaidPlan("not_a_real_field")).toBe(false);
  });

  it("requiresPaidPlan only reports fields known to need the Total pack", () => {
    expect(requiresPaidPlan(SleepSummaryDataFields.sleep_score)).toBe(true);
    expect(requiresPaidPlan(ActivityDataFields.steps)).toBe(false);
  });
});

describe("missingDataFields", () => {
  it("reports a requested field that did not come back", () => {
    const requested = [SleepSummaryDataFields.total_sleep_time, SleepSummaryDataFields.sleep_score];
    const returned = { total_sleep_time: 27000 };

    const missing = missingDataFields(requested, returned);

    expect(missing).toHaveLength(1);
    expect(missing[0].field).toEqual("sleep_score");
    expect(missing[0].pack).toEqual(BiomarkerPack.Total);
    expect(missing[0].reason).toContain("paid Withings API plan");
  });

  it("says nothing when everything requested came back", () => {
    const requested = [SleepSummaryDataFields.total_sleep_time];
    expect(missingDataFields(requested, { total_sleep_time: 1 })).toEqual([]);
  });

  it("gives a different explanation for a field with no known pack", () => {
    const missing = missingDataFields(["core_body_temperature_avg"], { steps: 1 });

    expect(missing).toHaveLength(1);
    expect(missing[0].pack).toBeUndefined();
    expect(missing[0].reason).not.toContain("paid Withings API plan");
    expect(missing[0].reason).toContain("device");
  });

  it("stays quiet when there is no record to inspect", () => {
    // An empty result set is not evidence of an entitlement problem.
    expect(missingDataFields([SleepSummaryDataFields.sleep_score], undefined)).toEqual([]);
    expect(missingDataFields([SleepSummaryDataFields.sleep_score], null)).toEqual([]);
    expect(missingDataFields(undefined, { a: 1 })).toEqual([]);
  });

  it("covers data_fields only, since meastypes are not returned as named keys", () => {
    // Measurements arrive as an array of { type, value }, so a missing measure
    // type cannot be detected by looking for an absent property. requiredPack
    // is the right tool for those.
    expect(requiredPack(MeasurementType.VO2Max)).toEqual(BiomarkerPack.Total);
  });
});

describe("WithingsApiError entitlement hint", () => {
  it("explains the likely causes of an authorization failure", () => {
    // 214 maps to UnauthorizedError.
    const error = new WithingsApiError({ status: 214, body: {} });

    expect(error.type).toEqual(WithingsResponseStatus.UnauthorizedError);
    expect(error.message).toContain("not included in your Withings API plan");
    expect(error.message).toContain("OAuth scope");
  });

  it("does not add the hint to unrelated failures", () => {
    const error = new WithingsApiError({ status: 601, body: {}, error: "too many requests" });

    expect(error.type).toEqual(WithingsResponseStatus.TooManyRequests);
    expect(error.message).not.toContain("Withings API plan");
  });
});
