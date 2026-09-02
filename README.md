# withings-sdk

[![CI](https://github.com/tomek-i/withings-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/tomek-i/withings-sdk/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/withings-sdk.svg)](https://www.npmjs.com/package/withings-sdk)
[![license](https://img.shields.io/npm/l/withings-sdk.svg)](./LICENSE)

An **unofficial** TypeScript SDK for the [Withings API](https://developer.withings.com/api-reference).
Weight, sleep, activity, heart and blood pressure data, fully typed.

> Not affiliated with, endorsed by, or supported by Withings. Use of the
> Withings API is subject to their [terms of service](https://developer.withings.com/).

## Install

```bash
pnpm add withings-sdk
```

Node.js 18 or newer. Zero runtime dependencies. Ships ESM and CommonJS with
bundled types.

## Quick start

You need a client ID, client secret and redirect URI from the
[Withings developer dashboard](https://developer.withings.com/dashboard/).

```typescript
import { MeasurementType, WithingsClient } from "withings-sdk";

const client = new WithingsClient({
  clientId: process.env.WITHINGS_CLIENT_ID!,
  clientSecret: process.env.WITHINGS_CLIENT_SECRET!,
  redirectUri: "https://example.com/auth/withings/callback",
  accessToken: storedAccessToken,
  refreshToken: storedRefreshToken,
});

const measurements = await client.measures.getMeasurement({
  meastype: MeasurementType.Weight,
  startdate: new Date("2024-01-01"),
  enddate: new Date("2024-02-01"),
});
```

Getting those tokens the first time is the
[authentication flow](./docs/authentication.md).

## What it does for you

- **Renews expired tokens** and retries the request, once.
- **Backs off and retries** when the API rate limits you.
- **Types every failure**, so a refused request, a network level failure and a
  proxy error page are told apart rather than all arriving as `Error`.
- **Walks paginated endpoints** lazily, so breaking out early stops the requests.
- **Explains missing metrics**, which usually means your API plan rather than a bug.

## Services

| | |
| --- | --- |
| `client.measures` | Weight, body composition, activity, workouts |
| `client.sleep` | Sleep states and nightly summaries |
| `client.heart` | ECG, atrial fibrillation, blood pressure |
| `client.user` | Devices, goals, account management |
| `client.notify` | Webhooks |
| `client.auth` | OAuth2, token refresh, signed requests |

## Documentation

[**Full documentation**](./docs/README.md), including
[measurements](./docs/measurements.md), [sleep](./docs/sleep.md),
[heart](./docs/heart.md), [notifications](./docs/notifications.md),
[errors and rate limits](./docs/errors.md) and
[API plans](./docs/api-plans.md).

## Status

Stable, and following [semantic versioning](https://semver.org/). A breaking
change to anything documented means a major version.

Every Withings service carrying general health data is covered: `measure`,
`sleep`, `heart`, `user`, `notify`, `signature` and `oauth2`. The partner and
RPM services are not implemented.

Response shapes are checked against the live API by a contract test suite, so a
change on Withings' side is caught here rather than discovered by you.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)
