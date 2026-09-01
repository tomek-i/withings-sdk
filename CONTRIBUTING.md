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
| `pnpm run test:e2e`  | Live API contract tests. Unattended. Requires credentials — see below. |
| `pnpm run test:e2e:consent` | The OAuth consent flow. Opens a browser and needs a human. |
| `pnpm run probe`     | Prints the shape of live responses, to check models against reality. |
| `pnpm run commitlint` | Checks your commit messages against the convention.               |

Formatting is handled by [Biome](https://biomejs.dev/); linting by ESLint. Run
`pnpm run format` before committing.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/).
This is not a style preference: release-please reads the commit type to decide
the next version number, so the wrong type produces the wrong release.

```
feat: add the sleep service          -> minor bump
fix: send ymd dates with dashes      -> patch bump
docs: document the error type        -> no release
feat!: rename the client options     -> minor bump while pre-1.0
```

A `commit-msg` hook checks this locally as soon as you have run `pnpm install`,
and CI checks every commit in a pull request.

## End-to-end tests

`pnpm run test:e2e` talks to the real Withings API. It is deliberately excluded
from `pnpm test` and from CI, but it runs unattended: the only test needing a
browser and a human is the consent flow, which lives in `test/e2e/interactive/`
and runs separately via `pnpm run test:e2e:consent`.

The contract suite checks the **shape** of every response against the types the
SDK claims, never the values — those are the account holder's health data, and
they differ per account. It fails in two directions:

- a field of an unexpected type, meaning our types are wrong
- a field the SDK does not model at all, meaning the API grew something

A field that is simply **absent** does not fail. Absence is expected: the API
returns only what `data_fields` requested, what your API plan includes, and what
the user's devices measure. Absent fields are logged rather than asserted.

To run it, copy `.env.example` to `.env` and fill in the client ID, secret and
redirect URI from your
[Withings developer dashboard](https://developer.withings.com/dashboard/), then
authorize once:

```bash
cp .env.example .env
pnpm run authorize   # opens the consent screen, writes the tokens to .env
pnpm run test:e2e
```

`pnpm run authorize` serves your redirect URI locally, opens the Withings
consent screen and writes the resulting token pair back into `.env`.

The suite writes rotated tokens back to `.env` when it finishes, so running it
does not invalidate your own credentials.

Re-run `authorize` whenever the suite starts failing with `invalid refresh_token`.
Access tokens last about three hours and **the refresh token is rotated on
every renewal**, so a `.env` that has sat unused goes stale. The symptom is
easy to misread: the first call fails with `503 invalid refresh_token`, and
every call after it fails with `601 Same arguments in less than 10 seconds`,
because each one retries the same doomed refresh.

`.env` is gitignored. Never commit real credentials.

## Releasing

Releases are automated. Do not bump the version or edit the changelog by hand.

1. Merge your PR to `main` with conventional commits.
2. [release-please](https://github.com/googleapis/release-please) opens and
   maintains a **Release PR** that bumps `package.json` and writes
   `CHANGELOG.md` from the commits since the last release.
3. Merging that Release PR is the release decision. It tags the commit, creates
   the GitHub release, and publishes to npm with provenance.

To hold a release back, simply leave the Release PR open; it keeps updating as
more commits land. To force a particular version, add a `Release-As: 1.2.3`
footer to a commit.

Authentication uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers)
over OIDC, so there is no publish token to store or rotate. The trusted
publisher registered on npmjs.com is pinned to this repository *and* to the
workflow filename `release.yml` — if you rename that file, update the trusted
publisher to match or releases will start failing with a 404.
