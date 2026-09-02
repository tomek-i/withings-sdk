# AGENTS.md

Working notes for this repository. Applies to coding agents and humans alike.

## What this is

`withings-sdk` is an unofficial TypeScript SDK for the [Withings API](https://developer.withings.com/api-reference), published to npm as a public package. It needs Node 18+, has zero runtime dependencies, and ships dual ESM and CJS builds.

Keeping it dependency-free is deliberate. Do not add a runtime dependency without a strong reason; `fetch` and `node:crypto` cover what the SDK needs.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm test` | Unit tests. No network, no credentials. This is what CI runs. |
| `pnpm run typecheck` | `tsc --noEmit` over `src` and `test`. |
| `pnpm run lint` | ESLint. |
| `pnpm run format` | Formats with Biome. |
| `pnpm run build` | ESM + CJS bundles and type declarations into `dist/`. |
| `pnpm run test:e2e` | Live API tests. Needs real credentials in `.env`; excluded from CI. |
| `pnpm run authorize` | Opens the Withings consent screen and writes fresh tokens into `.env`. |
| `pnpm run probe` | Prints the shape of live API responses, to check the models against reality. |
| `pnpm run test:e2e:consent` | The OAuth consent flow. Opens a browser and needs a human. |

pnpm is the package manager, pinned via `packageManager`. Use `corepack enable` to get the right version.

## Conventions

**Commits must follow [Conventional Commits](https://www.conventionalcommits.org/).** This is not cosmetic: release-please reads the type to decide the next version, so a wrong type produces a wrong release. Enforced by commitlint in CI and by a local `commit-msg` hook.

- `feat:` → minor bump
- `fix:` → patch bump
- `refactor:` and `perf:` → patch bump, because the shipped code changes
- `docs:`, `chore:`, `ci:`, `test:`, `style:`, `build:` → **no release**

That last line is deliberate. A README correction should not publish a new
version to npm, so those types are marked hidden in `release-please-config.json`,
which stops them triggering a release as well as keeping them out of the
changelog. A documentation change reaches npm with the next real release.
- `feat!:` or a `BREAKING CHANGE:` footer → **major** bump, now that the package is 1.x

Write the body as prose explaining *why*, not a restatement of the diff.

**The README stays short.** It is the 100 foot view: what this is, how to install it, one working example, and links. Anything longer belongs in `docs/`, one page per topic, linked from `docs/README.md`. A reader deciding whether to use the package should not have to scroll past a rate limiting guide.

**The public API is stable.** Removing or renaming an export is a breaking change, so keep implementation details out of `src/index.ts` in the first place. Adding an export later costs nothing; taking one away costs a major version.

**Every exported declaration and field carries JSDoc.** Always include the unit. The API mixes meters, seconds, kcal, bpm and percentages, and the field names give no hint. Do not use `@param {type}`. TypeScript already carries the type, and letting the two disagree is a maintenance trap. These docs ship in `dist/index.d.ts`, so they are what consumers see in their editor.

**Verify against the OpenAPI specification, not against other clients.** Withings publishes one. Earlier work in this repo modelled fields from third-party clients and got several wrong: a field that does not exist, a misspelled key, and missing fields. The spec is not committed, because it is Withings' documentation rather than ours to redistribute. Download it when you need it and keep it gitignored as `openapi.json`.

The spec is not infallible, and **every disagreement found so far has been a real bug in the models**. Run `pnpm run probe` before trusting a field you have not seen in a response. Where the spec and reality differ, model reality and say so in a comment.

Confirmed against the live API:

- `updatetime` is declared a string, arrives as a number.
- `measuregrps` returns `modelid`; the spec calls it `model_id`, which never appears.
- `deviceid`, `hash_deviceid`, `model`, `modelid` and `comment` arrive as `null` on manually entered data, though the spec does not mark them nullable.
- `measuregrps` entries carry a `timezone` the spec omits.
- `userid` is a string from the authorization_code exchange and a number from a refresh. Same field, same endpoint.

- the sleep `get` series is declared an object and returns an **array**.

`test/e2e/contract.test.ts` pins all of this against the live API. It fails when
a field has an unexpected type, and when the API returns a field the SDK does
not model. The second case is how API drift gets noticed. A missing field never
fails, because absence means plan, device or `data_fields`, not a change.

**Mirror the existing module layout** when adding a service:

```
src/<service>/
  <Service>.ts          the class, exposed as client.<service>
  index.ts              barrel
  enums/                request parameter enums, always STRING enums for data_fields
  models/               response bodies
  types/                caller-facing options
  types/http/params     wire parameters
  types/http/requests   full wire requests, action pinned as a literal
  types/http/responses  response wrappers
```

Then export the barrel from `src/index.ts` and add the service to `WithingsClient`.

**`data_fields` enums must have explicit string values.** A value-less enum is numeric, which silently serialises as `data_fields=0,7` instead of field names. This shipped as a real bug once.

**Reuse `paginate()`** for any endpoint returning `more` and `offset`, rather than writing another loop. The API is inconsistent here: `getmeas` returns `more` as a number and `getactivity` returns a boolean. `hasMorePages` absorbs that.

## Testing

Unit tests mock `globalThis.fetch` and assert the request that would go out (URL, action, parameter names and encoding) as well as the typing of the response. Prefer asserting the query string over asserting internal calls.

Tests must not need credentials or the network. Anything that does belongs in `test/e2e/`, which CI does not run.

When fixing a bug, add the test that would have caught it and say so in a comment, so the next person does not "simplify" it away.

## Releases

Releases are automated and should not be cut by hand.

1. Merge PRs to `main` with conventional commits.
2. release-please maintains a Release PR that bumps `package.json` and updates `CHANGELOG.md`.
3. Merging the Release PR tags the commit and publishes to npm.

Do not run `pnpm version`, edit the `version` field, or hand-write `CHANGELOG.md` entries for released versions. release-please owns all three.

**`.github/workflows/release.yml` is load-bearing.** npm trusted publishing is pinned to this repository *and* that exact filename. Renaming the file, or moving the publish step into another workflow, breaks publishing until the trusted publisher on npmjs.com is updated. There is no npm token: authentication is OIDC.

## Gotchas worth knowing

- `actions/setup-node`'s `registry-url` input breaks OIDC publishing. It writes an `.npmrc` with `_authToken=${NODE_AUTH_TOKEN}`, so npm authenticates with an empty placeholder instead of falling back to trusted publishing, and fails with a misleading 404.
- A tag pushed by Actions using `GITHUB_TOKEN` does not trigger other workflows, which is why release-please and the publish step share one workflow.
- npm surfaces trusted-publishing misconfiguration as `ENEEDAUTH` or `404`, never as a useful message. `--loglevel verbose` shows the real OIDC exchange error.
- The `*ymd` parameters take a dashed `YYYY-MM-DD` date, not `YYYYMMDD`.
- pnpm 10 blocks dependency build scripts by default; `esbuild` is allowlisted in `pnpm.onlyBuiltDependencies` because tsup needs it.
- Withings rejects a repeated request with identical arguments inside 10 seconds, reporting it as `601`. That is the same code as a genuine rate limit. Two e2e tests firing the same call back to back will trip it.
- Refresh tokens rotate on every renewal, so a stale `.env` fails as `503 invalid refresh_token` and then cascades into misleading `601`s. `pnpm run authorize` is the fix.
