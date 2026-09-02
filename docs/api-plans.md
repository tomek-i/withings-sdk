# API plans and missing metrics

Withings splits health data into a **Basic** and a **Total** biomarker pack.
Which one you get depends on your **developer plan**. It does not depend on the
end user's account, or on any consumer subscription they hold. The free plan
grants the Basic pack.

Roughly: weight and body composition, steps, distance, calories, workouts,
sleep durations, blood pressure and body temperature are Basic. Sleep score,
heart rate during sleep, snoring, respiration, HRV, SpO₂ auto, VO₂ max, ECG,
atrial fibrillation, segmental body composition, visceral fat and BMR are
Total.

Requesting data you are not entitled to **does not fail**. The field is simply
absent from the response. That is hard to tell apart from the user having no
such data, so the SDK helps you name the cause:

```typescript
import { missingDataFields, requiresPaidPlan, SleepSummaryDataFields } from "withings-sdk";

const data_fields = [SleepSummaryDataFields.total_sleep_time, SleepSummaryDataFields.sleep_score];
const response = await client.sleep.getSummary({ lastUpdate: new Date(0), data_fields });

for (const missing of missingDataFields(data_fields, response.body.series[0]?.data)) {
  console.warn(missing.reason);
  // "sleep_score" was requested but not returned. It belongs to the Total
  // Biomarker Pack, so it requires a paid Withings API plan. …
}

// Or check up front:
if (requiresPaidPlan(SleepSummaryDataFields.sleep_score)) { /* … */ }
```

Enum members that need the paid pack say so in their documentation, so your
editor tells you before you ship. Nothing in the SDK blocks a request:
entitlement is decided by the API, and this is a hint, not a gate.

Beyond your plan, a metric can also be absent because the device does not
measure it, the user did not grant the OAuth scope, or it is restricted in the
region the device was bought in. `WithingsApiError` spells those out when the
API returns an authorization failure.

---

[Documentation index](./README.md) | [Back to the project](../README.md)
