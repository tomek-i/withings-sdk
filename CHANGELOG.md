# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
