# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Response bodies for the Measure endpoints are modelled: `Activity`, `Workout`,
  `WorkoutData` and `IntradayActivityEntry`, with field-level documentation of
  the units the API returns.

### Fixed

- `ActivityDataFields`, `IntraDayActivityDataFields` and `GetWorkoutDataFields`
  were value-less numeric enums, so `data_fields` was serialised as enum
  ordinals (`data_fields=0,7`) instead of the field names the API expects
  (`data_fields=steps,calories`). They are string enums now.

### Changed

- `getActivity` no longer routes an epoch-zero `lastUpdate` through an `any`
  cast, and `lastupdate` is now floored to whole seconds like the other
  endpoints.
- The mutually exclusive `startdateymd`/`enddateymd`/`lastupdate` request
  params are optional, which is what the `GetActivityOptions` union already
  implied.
- `encodeQueryParams` is typed instead of taking `any`, and drops `null` as
  well as `undefined`.
- `Measures` methods now declare the response body type. Every one of them
  previously resolved to `WithingsResponse<unknown>`, because the generic was
  never supplied at the call site, so none of the modelled types were reachable
  by callers.
- `MeasureGroup.deviceid`, `hash_deviceid`, `modelid`, `model` and `comment`
  were typed as `null` rather than as nullable values of their real types.
- Paginated Measure responses expose `more` and `offset`.

## [0.1.1] - 2026-09-01

No changes to the published code. Release infrastructure only.

### Changed

- Releases now authenticate to npm with trusted publishing (OIDC) instead of a
  long-lived access token. There is no publish credential stored in the
  repository any more.

## [0.1.0] - 2026-09-01

First publishable release.

### Added

- Dual ESM + CommonJS builds with bundled type declarations, produced by `tsup`.
- `accessToken` / `refreshToken` options on `WithingsConfig`, and
  `auth.setTokens()`, so an existing token pair can be reused without running
  the consent flow again.
- Public exports for `Auth`, `Measures`, the measurement enums, the request and
  option types, `WithingsResponseStatus`, and the HTTP client interfaces.
- CI on Node 18/20/22, and a tag-triggered npm release workflow that publishes
  with provenance.
- Unit test suite that runs without credentials or network access.

### Fixed

- The token refresh callback was passed unbound, so an expired access token
  crashed with `Cannot read properties of undefined (reading 'refreshAccessToken')`
  instead of being renewed.
- The access token was captured when the client was constructed — before any
  token existed — so tokens obtained later were never sent. It is now read on
  every request.
- Both `fetchAccessToken` and `refreshAccessToken` stored the *access* token in
  place of the refresh token, which permanently broke renewal.
- The "refresh token is not set" guard tested the method rather than the token,
  so it could never trigger.
- `WithPagination` was declared but never exported.

### Changed

- The package now has no runtime dependencies. `express` and `dotenv` were
  runtime dependencies but are only used by tests; `zod` was only used by a
  module that was never exported.
- Removed the `src/env` module, which read a `.env` file at import time and
  called `process.exit(1)` on invalid input. Environment handling now lives in
  the test helpers.
- Requires Node.js 18 or newer (declared via `engines`).

[unreleased]: https://github.com/tomek-i/withings-sdk/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/tomek-i/withings-sdk/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/tomek-i/withings-sdk/releases/tag/v0.1.0
