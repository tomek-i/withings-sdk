# API surface

| Export                                  | Description                                                     |
| --------------------------------------- | --------------------------------------------------------------- |
| `WithingsClient`                        | Entry point. Exposes `.auth`, `.measures`, `.sleep`, `.heart`, `.user` and `.notify`. |
| `Auth`                                  | OAuth2 flow: consent URL, token exchange, refresh, `getNonce` / `signedParams`, plus `revoke`, `listUsers`, `recoverAuthorizationCode`, `getDemoAccess` and `createClient`. |
| `Sleep`                                 | `get`, `getSummary`, plus `getSummaryPages`.                     |
| `Notify`                                | `subscribe`, `get`, `list`, `update`, `revoke`.                  |
| `Heart`                                 | `list`, `get`, plus `listPages`. ECG, blood pressure, stethoscope. |
| `User`                                  | `getDevice`, `getGoals`, `link`, `unlink`, plus the partner services `get`, `activate` and `addToRpm`. |
| `parseNotificationPayload`              | Turns a posted webhook body into a typed payload.                |
| `Measures`                              | `getMeasurement`, `getActivity`, `getIntradayActivity`, `getWorkouts`, `confirmUser`, plus `getMeasurementPages` / `getActivityPages` / `getWorkoutsPages`. |
| `WithingsResponseStatus`                | Maps a Withings `status` code onto a coarse result category.     |
| `WithingsApiError`                      | Thrown when the API reports a failure. Carries `status`, `type` and `body`. |
| `WithingsHttpError`                     | Thrown when the request fails at the HTTP layer. Carries `status` and `retryAfterMs`. |
| `WithingsInvalidResponseError`          | Thrown when the response is not a Withings response at all. Carries `url` and `snippet`. |
| `paginate` / `hasMorePages`             | Walk any paginated endpoint one page at a time.                  |
| `requiredPack` / `requiresPaidPlan` / `missingDataFields` / `BiomarkerPack` | Explain metrics your API plan does not include. |
| `WithingsRetryOptions`                  | Tunes the automatic backoff for rate limited requests.           |
| `HttpClient` / `WithingsHttpClient`     | The transport, exported so you can substitute or mock it.        |
| `MeasurementType`, `MeasurementCategoryType`, `ActivityDataFields`, `IntraDayActivityDataFields`, `GetWorkoutDataFields`, `SleepDataFields`, `SleepSummaryDataFields`, `SleepState`, `NotificationCategory`, `AfibClassification`, `HeartDeviceModel`, `WearPosition`, `DeviceType`, `BatteryLevel` | Enums for request parameters. |

Request/response and option types (`WithingsConfig`, `WithingsResponse<T>`,
`GetMeasurementOptions`, `GetActivityOptions`, …) are exported as well.

---

[Documentation index](./README.md) | [Back to the project](../README.md)
