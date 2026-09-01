# AGENTS.md

Working notes for this repository. Applies to coding agents and humans alike.

## What this is

`withings-sdk` — an unofficial TypeScript SDK for the [Withings API](https://developer.withings.com/api-reference), published to npm as a public package. Node 18+, zero runtime dependencies, dual ESM/CJS build.

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

pnpm is the package manager, pinned via `packageManager`. Use `corepack enable` to get the right version.

## Conventions

**Commits must follow [Conventional Commits](https://www.conventionalcommits.org/).** This is not cosmetic: release-please reads the type to decide the next version, so a wrong type produces a wrong release. Enforced by commitlint in CI and by a local `commit-msg` hook.

- `feat:` → minor bump
- `fix:` → patch bump
- `docs:`, `chore:`, `ci:`, `test:`, `refactor:`, `style:`, `build:` → no release on their own
- `feat!:` or a `BREAKING CHANGE:` footer → minor bump while pre-1.0 (`bump-minor-pre-major`)

Write the body as prose explaining *why*, not a restatement of the diff.

**Every exported declaration and field carries JSDoc.** Include the unit — the API mixes meters, seconds, kcal, bpm and percentages with no hint in the field names. Do not use `@param {type}`; TypeScript already carries the type, and the two disagreeing is a maintenance trap. The docs ship in `dist/index.d.ts`, so they are the SDK's IntelliSense.

**Verify against the OpenAPI specification, not against other clients.** Withings publishes one; earlier work in this repo modelled fields from third-party clients and got several wrong (a field that does not exist, a misspelled key, missing fields). The spec is not committed — it is Withings' documentation, not ours to redistribute — so download it when you need it and keep it gitignored as `openapi.json`.

The spec is not infallible, and **every disagreement found so far has been a real bug in the models**. Run `pnpm run probe` before trusting a field you have not seen in a response. Where the spec and reality differ, model reality and say so in a comment.

Confirmed against the live API:

- `updatetime` is declared a string, arrives as a number.
- `measuregrps` returns `modelid`; the spec calls it `model_id`, which never appears.
- `deviceid`, `hash_deviceid`, `model`, `modelid` and `comment` arrive as `null` on manually entered data, though the spec does not mark them nullable.
- `measuregrps` entries carry a `timezone` the spec omits.
- `userid` is a string from the authorization_code exchange and a number from a refresh. Same field, same endpoint.

Still unverified: the sleep `get` series, declared an object but modelled as an array.

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

**Reuse `paginate()`** for any endpoint returning `more`/`offset` rather than writing another loop. Note the API is inconsistent — `getmeas` returns `more` as a number, `getactivity` as a boolean — which `hasMorePages` absorbs.

## Testing

Unit tests mock `globalThis.fetch` and assert the request that would go out (URL, action, parameter names and encoding) as well as the typing of the response. Prefer asserting the query string over asserting internal calls.

Tests must not need credentials or the network. Anything that does belongs in `test/e2e/`, which CI does not run.

When fixing a bug, add the test that would have caught it and say so in a comment, so the next person does not "simplify" it away.

## Releases

Releases are automated and should not be cut by hand.

1. Merge PRs to `main` with conventional commits.
2. release-please maintains a Release PR that bumps `package.json` and updates `CHANGELOG.md`.
3. Merging the Release PR tags the commit and publishes to npm.

Do not run `pnpm version`, edit the `version` field, or hand-write `CHANGELOG.md` entries for released versions — release-please owns all three.

**`.github/workflows/release.yml` is load-bearing.** npm trusted publishing is pinned to this repository *and* that exact filename. Renaming the file, or moving the publish step into another workflow, breaks publishing until the trusted publisher on npmjs.com is updated. There is no npm token: authentication is OIDC.

## Gotchas worth knowing

- `actions/setup-node`'s `registry-url` input breaks OIDC publishing. It writes an `.npmrc` with `_authToken=${NODE_AUTH_TOKEN}`, so npm authenticates with an empty placeholder instead of falling back to trusted publishing, and fails with a misleading 404.
- A tag pushed by Actions using `GITHUB_TOKEN` does not trigger other workflows, which is why release-please and the publish step share one workflow.
- npm surfaces trusted-publishing misconfiguration as `ENEEDAUTH` or `404`, never as a useful message. `--loglevel verbose` shows the real OIDC exchange error.
- The `*ymd` parameters take a dashed `YYYY-MM-DD` date, not `YYYYMMDD`.
- pnpm 10 blocks dependency build scripts by default; `esbuild` is allowlisted in `pnpm.onlyBuiltDependencies` because tsup needs it.
- Withings rejects a repeated request with identical arguments inside 10 seconds, reporting it as `601` — the same code as a genuine rate limit. Two e2e tests firing the same call back to back will trip it.
- Refresh tokens rotate on every renewal, so a stale `.env` fails as `503 invalid refresh_token` and then cascades into misleading `601`s. `pnpm run authorize` is the fix.
