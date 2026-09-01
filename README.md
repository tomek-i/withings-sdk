# withings-sdk

[![CI](https://github.com/tomek-i/withings-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/tomek-i/withings-sdk/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/withings-sdk.svg)](https://www.npmjs.com/package/withings-sdk)
[![license](https://img.shields.io/npm/l/withings-sdk.svg)](./LICENSE)

An **unofficial** TypeScript SDK for the [Withings API](https://developer.withings.com/api-reference).

> This project is not affiliated with, endorsed by, or supported by Withings.
> "Withings" is a trademark of its respective owner. Use of the Withings API is
> subject to their [terms of service](https://developer.withings.com/).

## Requirements

- Node.js 18 or newer (the SDK uses the global `fetch`)

## Installation

```bash
pnpm add withings-sdk
# or: npm install withings-sdk
```

Ships both ESM and CommonJS builds with bundled type declarations.

## Getting started

You need a Withings application (client ID, client secret and a registered
redirect URI) from the [Withings developer dashboard](https://developer.withings.com/dashboard/).

### 1. Send the user to the consent screen

```typescript
import { WithingsClient } from "withings-sdk";

const client = new WithingsClient({
  clientId: process.env.WITHINGS_CLIENT_ID!,
  clientSecret: process.env.WITHINGS_CLIENT_SECRET!,
  redirectUri: "https://example.com/auth/withings/callback",
});

const url = client.auth.getAuthCodeUrl(["user.info", "user.metrics", "user.activity"], "some-csrf-state");
// Redirect the user to `url`.
```

### 2. Exchange the authorization code for tokens

Withings redirects back to your `redirectUri` with a `code` query parameter:

```typescript
const response = await client.auth.fetchAccessToken(code);

// Persist these — they let you skip the consent screen next time.
const accessToken = client.auth.getCurrentAccessToken();
const refreshToken = client.auth.getCurrentRefreshToken();
```

### 3. Reuse stored tokens

Pass a previously obtained token pair straight into the constructor:

```typescript
const client = new WithingsClient({
  clientId: process.env.WITHINGS_CLIENT_ID!,
  clientSecret: process.env.WITHINGS_CLIENT_SECRET!,
  redirectUri: "https://example.com/auth/withings/callback",
  accessToken: storedAccessToken,
  refreshToken: storedRefreshToken,
});
```

…or set them on an existing client with `client.auth.setTokens({ accessToken, refreshToken })`.

When a request fails because the access token has expired, the client refreshes
it with the refresh token and retries the request once, automatically.

> **Note:** Withings rotates the refresh token on every renewal. Read
> `client.auth.getCurrentRefreshToken()` after a call and persist the new value,
> or the stored one will eventually stop working.

### 4. Read measurements

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

### 5. Read sleep data

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

## Pagination

List endpoints cap how many rows one call returns, reporting `more` and an
`offset` to resume from. The `*Pages` methods follow that for you:

```typescript
for await (const page of client.measures.getMeasurementPages({ meastype: MeasurementType.Weight })) {
  for (const group of page.measuregrps) {
    // ...
  }
}
```

Pages are fetched lazily, so nothing is requested until the loop asks for it
and no further call is made if you `break` early — which matters against a
rate-limited API. Collect everything with `Array.fromAsync` if you need it all
at once, but be aware that issues every request up front.

`paginate` is exported too, so the same walk works over any endpoint that
reports `more` and `offset`.

## API plans and missing metrics

Withings splits health data into a **Basic** and a **Total** biomarker pack, and
which one you get depends on your **developer plan** — not on the end user's
account or any consumer subscription they hold. The free plan grants the Basic
pack.

Roughly: weight and body composition, steps, distance, calories, workouts,
sleep durations, blood pressure and body temperature are Basic. Sleep score,
heart rate during sleep, snoring, respiration, HRV, SpO₂ auto, VO₂ max, ECG,
atrial fibrillation, segmental body composition, visceral fat and BMR are
Total.

The awkward part is that requesting data you are not entitled to **does not
fail** — the field is simply absent from the response, which is hard to tell
from "the user has no such data". So the SDK helps you name the cause:

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
## Rate limits

Withings allows roughly **120 requests per minute** by default, and more on a
paid plan. Exceeding it is reported as status `601` — in the response body, not
as an HTTP error.

The client backs off and retries a rate limited request automatically, up to
three attempts in total, with exponential delays and full jitter:

```typescript
const client = new WithingsClient({
  ...credentials,
  retry: {
    maxAttempts: 3,        // default; 1 disables retrying
    initialDelayMs: 1000,  // doubles each attempt
    maxDelayMs: 30000,
    jitter: true,          // spreads retries so clients do not sync up
    onRetry: ({ attempt, delayMs }) => console.warn(`rate limited, retry ${attempt} in ${delayMs}ms`),
  },
});

// Or opt out entirely and handle 601 yourself:
const strict = new WithingsClient({ ...credentials, retry: false });
```

Once the attempts are exhausted the rate limit surfaces as a
`WithingsApiError` with `type === WithingsResponseStatus.TooManyRequests`.

Withings also rejects a **repeated request with identical arguments inside ten
seconds**, reporting it with the same `601`. The client recognises that case
and waits out the full window instead of retrying inside it, where every
attempt would be rejected again.

Retrying only smooths over bursts. If you are polling regularly, subscribe to
notifications instead — Withings recommends it precisely to keep you under the
limit.

## Error handling

The Withings API answers with HTTP 200 even when a call fails, putting the
outcome in the response body. Failures are raised as a `WithingsApiError`
carrying the raw status code and the category it maps to, so you can branch on
a specific failure without matching on message strings:

```typescript
import { WithingsApiError, WithingsResponseStatus } from "withings-sdk";

try {
  await client.measures.getMeasurement();
} catch (error) {
  if (error instanceof WithingsApiError) {
    if (error.type === WithingsResponseStatus.TooManyRequests) {
      // rate limited - back off and retry later
    }
    console.error(error.status, error.message);
  }
}
```

An expired access token is handled for you: the client renews it and retries
once before throwing.

## API surface

| Export                                  | Description                                                     |
| --------------------------------------- | --------------------------------------------------------------- |
| `WithingsClient`                        | Entry point. Exposes `.auth`, `.measures` and `.sleep`.          |
| `Auth`                                  | OAuth2 flow: consent URL, token exchange, refresh, signatures.   |
| `Sleep`                                 | `get`, `getSummary`, plus `getSummaryPages`.                     |
| `Measures`                              | `getMeasurement`, `getActivity`, `getIntradayActivity`, `getWorkouts`, `confirmUser`, plus `getMeasurementPages` / `getActivityPages` / `getWorkoutsPages`. |
| `WithingsResponseStatus`                | Maps a Withings `status` code onto a coarse result category.     |
| `WithingsApiError`                      | Thrown when the API reports a failure. Carries `status`, `type` and `body`. |
| `paginate` / `hasMorePages`             | Walk any paginated endpoint one page at a time.                  |
| `requiredPack` / `requiresPaidPlan` / `missingDataFields` / `BiomarkerPack` | Explain metrics your API plan does not include. |
| `WithingsRetryOptions`                  | Tunes the automatic backoff for rate limited requests.           |
| `HttpClient` / `WithingsHttpClient`     | The transport, exported so you can substitute or mock it.        |
| `MeasurementType`, `MeasurementCategoryType`, `ActivityDataFields`, `IntraDayActivityDataFields`, `GetWorkoutDataFields`, `SleepDataFields`, `SleepSummaryDataFields`, `SleepState` | Enums for request parameters. |

Request/response and option types (`WithingsConfig`, `WithingsResponse<T>`,
`GetMeasurementOptions`, `GetActivityOptions`, …) are exported as well.

## Status

Early and incomplete — the `measure`, `sleep` and `oauth2` endpoints are
covered; the other Withings services are not implemented yet. The public API may still change
before 1.0. Issues and pull requests are welcome.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and workflow, and
[AGENTS.md](./AGENTS.md) for the conventions this repository follows.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/);
releases are cut automatically from them.

## License

[MIT](./LICENSE)
