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

// Persist these. They let you skip the consent screen next time.
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

### 6. Get notified instead of polling

Withings posts to a callback URL when new data is available. This is the
supported alternative to polling, and what Withings recommends for staying
inside the rate limit.

```typescript
import { NotificationCategory, parseNotificationPayload } from "withings-sdk";

await client.notify.subscribe({
  callbackurl: "https://example.com/withings/callback",
  appli: NotificationCategory.Weight,
});
```

Withings verifies the URL by posting to it during `subscribe`, so it has to be
reachable and answering `200` before you call.

The notification tells you that something changed, and over which range. It
never carries the measurements, so fetch those yourself:

```typescript
app.post("/withings/callback", express.urlencoded({ extended: false }), async (req, res) => {
  const event = parseNotificationPayload(req.body);
  res.sendStatus(200); // acknowledge first: Withings retries on a slow reply

  if (event?.appli === NotificationCategory.Weight && event.startdate && event.enddate) {
    const measures = await client.measures.getMeasurement({
      startdate: new Date(event.startdate * 1000),
      enddate: new Date(event.enddate * 1000),
    });
  }
});
```

`parseNotificationPayload` returns `undefined` for anything that is not a
notification, which is how a stray request to a public callback URL is told
apart from a real one. It also converts the form-encoded strings, so `appli`
compares equal to `NotificationCategory`.

Manage subscriptions with `client.notify.list()`, `.get()`, `.update()` and
`.revoke()`.

### 7. Read ECG and blood pressure

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

### 8. Devices and goals

```typescript
const { devices } = (await client.user.getDevice()).body;

for (const device of devices) {
  // A device that stopped syncing looks identical to "no new data" from the
  // measure endpoints alone, so check when it last connected.
  console.log(device.type, device.battery, device.last_session_date);
}

const { goals } = (await client.user.getGoals()).body;
// goals.weight is scaled: value * 10 ** unit kilograms
```

## Signature authentication

A few Withings services authenticate with a **signed request** rather than a
user's access token. They are authorized by your client ID and secret, so they
work without anyone having gone through consent.

`signedParams` fetches a nonce and signs the action in one step:

```typescript
const signed = await client.auth.signedParams("subscribe");

await client.notify.subscribe({
  ...signed,
  callbackurl: "https://example.com/withings/callback",
  appli: NotificationCategory.Weight,
});
```

The same applies to the partner services on `client.auth`:

```typescript
// Stop sending data for a user who disconnected
const signed = await client.auth.signedParams("revoke");
await client.auth.revoke({ ...signed, userid });
```

`listUsers`, `recoverAuthorizationCode`, `getDemoAccess` and `createClient`
work the same way. None of them needs a user access token, because the client
secret is what authorizes them.

The nonce is valid for 30 minutes and **single use**, so call `signedParams`
once per request rather than reusing the result. `auth.getNonce()` is available
if you need the nonce alone, and `auth.generateSignature()` signs an arbitrary
parameter set.

The signature covers the exact values sent. Changing any of them after signing
invalidates it. That is why they arrive as one object to spread.

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

Pages are fetched lazily. Nothing is requested until the loop asks for it, and
no further call is made if you `break` early. That matters against a
rate-limited API. You can collect everything with `Array.fromAsync` if you need
it all at once, but that issues every request up front.

`paginate` is exported too, so the same walk works over any endpoint that
reports `more` and `offset`.

## API plans and missing metrics

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
## Rate limits

Withings allows roughly **120 requests per minute** by default, and more on a
paid plan. Exceeding it is reported as status `601` in the response body, not
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
notifications instead. Withings recommends that precisely to keep you under the
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

An expired access token is handled for you. The client renews it and retries
once before throwing.

### Two kinds of failure

The API normally answers with HTTP 200 and reports problems in the body. A
non-2xx status means the request never got that far, so the two cases are
separate types:

| Thrown | Means | Carries |
| --- | --- | --- |
| `WithingsApiError` | The API ran your request and refused it | `status`, `type`, `body` |
| `WithingsHttpError` | The request failed at the HTTP layer | `status`, `statusText`, `url`, `retryAfterMs` |

Both extend `Error`, so catching `Error` still catches everything. Check the
type when you want to tell them apart:

```typescript
import { WithingsApiError, WithingsHttpError } from "withings-sdk";

try {
  await client.measures.getMeasurement();
} catch (error) {
  if (error instanceof WithingsHttpError && error.status === 503) {
    // the service is down, rather than anything wrong with the request
  }
  if (error instanceof WithingsApiError) {
    // the API answered, and refused
  }
}
```

The client retries a 429, 502, 503 or 504 on its own, honouring `Retry-After`
when the server sends one. A 400 or 404 is not retried, because it would fail
the same way.

## API surface

| Export                                  | Description                                                     |
| --------------------------------------- | --------------------------------------------------------------- |
| `WithingsClient`                        | Entry point. Exposes `.auth`, `.measures`, `.sleep`, `.heart`, `.user` and `.notify`. |
| `Auth`                                  | OAuth2 flow: consent URL, token exchange, refresh, `getNonce` / `signedParams`, plus `revoke`, `listUsers`, `recoverAuthorizationCode`, `getDemoAccess` and `createClient`. |
| `Sleep`                                 | `get`, `getSummary`, plus `getSummaryPages`.                     |
| `Notify`                                | `subscribe`, `get`, `list`, `update`, `revoke`.                  |
| `Heart`                                 | `list`, `get`, plus `listPages`. ECG, blood pressure, stethoscope. |
| `User`                                  | `getDevice`, `getGoals`.                                         |
| `parseNotificationPayload`              | Turns a posted webhook body into a typed payload.                |
| `Measures`                              | `getMeasurement`, `getActivity`, `getIntradayActivity`, `getWorkouts`, `confirmUser`, plus `getMeasurementPages` / `getActivityPages` / `getWorkoutsPages`. |
| `WithingsResponseStatus`                | Maps a Withings `status` code onto a coarse result category.     |
| `WithingsApiError`                      | Thrown when the API reports a failure. Carries `status`, `type` and `body`. |
| `WithingsHttpError`                     | Thrown when the request fails at the HTTP layer. Carries `status` and `retryAfterMs`. |
| `paginate` / `hasMorePages`             | Walk any paginated endpoint one page at a time.                  |
| `requiredPack` / `requiresPaidPlan` / `missingDataFields` / `BiomarkerPack` | Explain metrics your API plan does not include. |
| `WithingsRetryOptions`                  | Tunes the automatic backoff for rate limited requests.           |
| `HttpClient` / `WithingsHttpClient`     | The transport, exported so you can substitute or mock it.        |
| `MeasurementType`, `MeasurementCategoryType`, `ActivityDataFields`, `IntraDayActivityDataFields`, `GetWorkoutDataFields`, `SleepDataFields`, `SleepSummaryDataFields`, `SleepState`, `NotificationCategory`, `AfibClassification`, `HeartDeviceModel`, `WearPosition`, `DeviceType`, `BatteryLevel` | Enums for request parameters. |

Request/response and option types (`WithingsConfig`, `WithingsResponse<T>`,
`GetMeasurementOptions`, `GetActivityOptions`, …) are exported as well.

## Status

The `measure`, `sleep`, `heart`, `user`, `notify`, `signature` and `oauth2`
services are covered. The rest are not. `stetho`, `rawdata`, `device`,
`survey`, `nudge`, `dropshipment` and `order` are partner or RPM offerings. The public API may still change
before 1.0. Issues and pull requests are welcome.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and workflow, and
[AGENTS.md](./AGENTS.md) for the conventions this repository follows.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/);
releases are cut automatically from them.

## License

[MIT](./LICENSE)
