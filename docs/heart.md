# Heart

## ECG and blood pressure

```typescript
import { AfibClassification } from "withings-sdk";

const recordings = await client.heart.list({ startdate: new Date("2024-01-01") });

for (const record of recordings.body.series) {
  if (record.ecg?.afib === AfibClassification.Positive) {
    // Fetch the signal itself: thousands of samples, so list never includes it
    const signal = await client.heart.get({ signalid: record.ecg.signalid! });
    // signal.body.signal is in microvolts, sampled at sampling_frequency Hz
  }
}
```

`list` is paginated; use `client.heart.listPages()` to walk it.

> **Note:** ECG, atrial fibrillation and blood pressure are Total Biomarker
> Pack metrics, so a free plan returns an empty series.

---

[Documentation index](./README.md) | [Back to the project](../README.md)
