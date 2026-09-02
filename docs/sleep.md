# Sleep

## Reading sleep data

```typescript
import { SleepDataFields, SleepSummaryDataFields } from "withings-sdk";

// Night-level summaries
const nights = await client.sleep.getSummary({
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-02-01"),
  data_fields: [SleepSummaryDataFields.total_sleep_time, SleepSummaryDataFields.sleep_score],
});

// High frequency data for one night (max 7 days per call)
const detail = await client.sleep.get({
  startdate: new Date("2024-01-05T20:00:00Z"),
  enddate: new Date("2024-01-06T10:00:00Z"),
  data_fields: [SleepDataFields.hr, SleepDataFields.rr],
});
```

---

[Documentation index](./README.md) | [Back to the project](../README.md)
