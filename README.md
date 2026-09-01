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
import { MeasurementType } from "withings-sdk";

const measurements = await client.measures.getMeasurement({
  meastype: MeasurementType.Weight,
  startdate: new Date("2024-01-01"),
  enddate: new Date("2024-02-01"),
});

const activity = await client.measures.getActivity({
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-02-01"),
});

const workouts = await client.measures.getWorkouts();
```

## API surface

| Export                                  | Description                                                     |
| --------------------------------------- | --------------------------------------------------------------- |
| `WithingsClient`                        | Entry point. Exposes `.auth` and `.measures`.                    |
| `Auth`                                  | OAuth2 flow: consent URL, token exchange, refresh, signatures.   |
| `Measures`                              | `getMeasurement`, `getActivity`, `getIntradayActivity`, `getWorkouts`, `confirmUser`. |
| `WithingsResponseStatus`                | Maps a Withings `status` code onto a coarse result category.     |
| `HttpClient` / `WithingsHttpClient`     | The transport, exported so you can substitute or mock it.        |
| `MeasurementType`, `MeasurementCategoryType`, `ActivityDataFields`, `IntraDayActivityDataFields`, `GetWorkoutDataFields` | Enums for request parameters. |

Request/response and option types (`WithingsConfig`, `WithingsResponse<T>`,
`GetMeasurementOptions`, `GetActivityOptions`, …) are exported as well.

## Status

Early and incomplete — the `measure` and `oauth2` endpoints are covered; the
other Withings services are not implemented yet. The public API may still change
before 1.0. Issues and pull requests are welcome.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)
