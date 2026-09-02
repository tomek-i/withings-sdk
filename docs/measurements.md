# Measurements and activity

Weight and body composition, daily activity, workouts, and minute level
intraday data.

## Reading measurements

```typescript
import { GetWorkoutDataFields, IntraDayActivityDataFields, MeasurementType } from "withings-sdk";

const measurements = await client.measures.getMeasurement({
  meastype: MeasurementType.Weight,
  startdate: new Date("2024-01-01"),
  enddate: new Date("2024-02-01"),
});

const activity = await client.measures.getActivity({
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-02-01"),
});

const workouts = await client.measures.getWorkouts({
  lastUpdate: new Date(0), // everything Withings still holds
  data_fields: [GetWorkoutDataFields.calories, GetWorkoutDataFields.hr_average],
});

const intraday = await client.measures.getIntradayActivity({
  startdate: new Date("2024-01-05T00:00:00Z"),
  enddate: new Date("2024-01-05T12:00:00Z"),
  data_fields: [IntraDayActivityDataFields.steps, IntraDayActivityDataFields.heart_rate],
});
```

> **Note:** `getWorkouts` and `getIntradayActivity` return no metrics unless you
> ask for them by name in `data_fields`.

---

[Documentation index](./README.md) | [Back to the project](../README.md)
