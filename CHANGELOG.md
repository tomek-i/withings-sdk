# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0](https://github.com/tomek-i/withings-sdk/compare/v0.5.0...v0.6.0) (2026-09-02)


### Added

* implement getnonce so signature authentication is usable ([#26](https://github.com/tomek-i/withings-sdk/issues/26)) ([dabc751](https://github.com/tomek-i/withings-sdk/commit/dabc75154c80a1890e567d79af1a9fb3c8eebbf9))

## [0.5.0](https://github.com/tomek-i/withings-sdk/compare/v0.4.0...v0.5.0) (2026-09-02)


### Added

* add the Notify service for webhooks ([#24](https://github.com/tomek-i/withings-sdk/issues/24)) ([678bb4e](https://github.com/tomek-i/withings-sdk/commit/678bb4e844a2cc7e81c2d01f1ecadd9c858056e3))

## [0.4.0](https://github.com/tomek-i/withings-sdk/compare/v0.3.0...v0.4.0) (2026-09-02)


### Added

* back off and retry when the API rate limits a request ([b198b2f](https://github.com/tomek-i/withings-sdk/commit/b198b2f0523e4cfe72d3708f05c59a6df7f146c7))
* back off and retry when the API rate limits a request ([110849a](https://github.com/tomek-i/withings-sdk/commit/110849af6defa7b1ebcb9d48d981c183fce44a3b))
* explain metrics that a Withings API plan does not include ([2f76c17](https://github.com/tomek-i/withings-sdk/commit/2f76c1771f0697531fb7c9ecf4a6a661e56beebd))
* explain metrics that a Withings API plan does not include ([365f2dc](https://github.com/tomek-i/withings-sdk/commit/365f2dc282c7a25b5002c4bb3fadf27af760251a))


### Fixed

* correct the measure models against live API responses ([#22](https://github.com/tomek-i/withings-sdk/issues/22)) ([8f90acd](https://github.com/tomek-i/withings-sdk/commit/8f90acd159935c35a74cd514d05332bec9785481))
* wait out the duplicate-request window before retrying ([23d980c](https://github.com/tomek-i/withings-sdk/commit/23d980cadb71372e8bf0351fdbf88233d2da1fce))

## [0.3.0](https://github.com/tomek-i/withings-sdk/compare/v0.2.0...v0.3.0) (2026-09-01)


### ⚠ BREAKING CHANGES

* getWorkouts now requires an options argument. The previous no-argument form returned an arbitrary 7-day window and built a request the API documents as invalid, so there is no behaviour worth preserving. Callers should pass either { startDate, endDate } or { lastUpdate }.

### Added

* give getWorkouts and getIntradayActivity their request options ([20adbbc](https://github.com/tomek-i/withings-sdk/commit/20adbbc15af48a5def2898a063438dbd8ac5b3a9))

## [0.2.0](https://github.com/tomek-i/withings-sdk/compare/v0.1.1...v0.2.0) (2026-09-01)

### Added

- The Sleep service, as `client.sleep`. `get` returns high frequency sleep
  states with their heart rate, respiration and movement measurements;
  `getSummary` returns night-level summaries, with `getSummaryPages` to walk
  them. Includes `SleepState` and the two `data_fields` enums.
- Pagination. `paginate` walks any endpoint that reports `more` and `offset`,
  and `Measures` exposes `getMeasurementPages` and `getActivityPages` built on
  it. Pages are fetched lazily, so breaking out of the loop early issues no
  further requests.
- `PaginatedBody` and `hasMorePages`, which absorb the API returning `more` as
  a number from `getmeas` and a boolean from `getactivity`/`getworkouts`.
- `WithingsApiError`, thrown when the API reports a failure. It carries the raw
  `status`, the mapped `WithingsResponseStatus` as `type`, and the response
  `body`, so callers can react to a specific failure such as rate limiting
  without matching on message strings.
- `WithingsResponseStatus.Unknown`, for status codes this SDK does not
  recognise. Appended to the enum, so existing member values are unchanged.

- Response bodies for the Measure endpoints are modelled: `Activity`, `Workout`,
  `WorkoutData` and `IntradayActivityEntry`, with field-level documentation of
  the units the API returns.

### Fixed

- `formatYmd` produced `20240105`, but the `*ymd` parameters take a dashed
  `YYYY-MM-DD` date, as the API's own code samples show. Every `getActivity`
  and `getWorkouts` call using a date range was therefore sending a malformed
  date.
- `ErrorCodeHandler` returned `undefined` for any status code outside its
  if-chain, and the transport then threw `new Error(data.error)` with an
  optional field, so an unmapped or message-less failure surfaced as
  `Error: undefined`.
- `Auth.fetchAccessToken` and `Auth.refreshAccessToken` read `data.body`
  without checking the status first. Because the API reports failures with
  HTTP 200, a rejected code or refresh token failed as
  `Cannot read properties of undefined (reading 'access_token')` instead of
  reporting what went wrong.
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

### CI

* automate releases with release-please and conventional commits ([f1dcc9f](https://github.com/tomek-i/withings-sdk/commit/f1dcc9fd801100158998b9997bd054de571d84ae))

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

[0.1.1]: https://github.com/tomek-i/withings-sdk/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/tomek-i/withings-sdk/releases/tag/v0.1.0
