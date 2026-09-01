# Contributing

Thanks for your interest in improving `withings-sdk`.

## Setup

This project uses [pnpm](https://pnpm.io/). The required version is pinned in
`package.json` via the `packageManager` field, so the easiest way to get it is:

```bash
corepack enable
pnpm install
```

Node.js 18 or newer is required.

## Everyday commands

| Command              | What it does                                                      |
| -------------------- | ----------------------------------------------------------------- |
| `pnpm test`          | Unit tests. No network, no credentials. This is what CI runs.      |
| `pnpm run typecheck` | `tsc --noEmit` over `src` and `test`.                              |
| `pnpm run lint`      | ESLint.                                                            |
| `pnpm run format`    | Formats with Biome.                                                |
| `pnpm run format:check` | Verifies formatting (used by CI).                               |
| `pnpm run build`     | Produces the ESM + CJS bundles and type declarations in `dist/`.   |
| `pnpm run test:e2e`  | Live API tests. Requires credentials — see below.                  |

Formatting is handled by [Biome](https://biomejs.dev/); linting by ESLint. Run
`pnpm run format` before committing.

## End-to-end tests

`pnpm run test:e2e` talks to the real Withings API, and the auth suite opens a
browser window for the consent screen. It is deliberately excluded from
`pnpm test` and from CI.

To run it, copy `.env.example` to `.env` and fill in credentials from your
[Withings developer dashboard](https://developer.withings.com/dashboard/):

```bash
cp .env.example .env
pnpm run test:e2e
```

`.env` is gitignored. Never commit real credentials.

## Releasing

Releases are published by CI when a `v*` tag is pushed:

```bash
pnpm version minor      # or patch / major — updates package.json and tags
git push --follow-tags
```

The `Release` workflow runs `prepublishOnly` (typecheck, lint, tests, build) and
then publishes to npm with provenance. It needs an `NPM_TOKEN` repository
secret. Update `CHANGELOG.md` as part of the release commit.
