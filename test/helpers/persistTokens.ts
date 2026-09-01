import * as fs from "node:fs";
import * as path from "node:path";

const ENV_PATH = path.resolve(process.cwd(), ".env");

const upsert = (contents: string, key: string, value: string): string =>
  new RegExp(`^${key}=.*$`, "m").test(contents)
    ? contents.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=${value}`)
    : `${contents.trimEnd()}\n${key}=${value}\n`;

/**
 * Writes a rotated token pair back into `.env`.
 *
 * Withings rotates the refresh token on every renewal, so any suite that
 * refreshes silently invalidates the credentials it was given. Without this,
 * running the e2e tests once leaves `.env` unusable and the next run fails
 * with `invalid refresh_token` followed by a cascade of misleading `601`s.
 *
 * @param accessToken The current access token.
 * @param refreshToken The current refresh token.
 */
export const persistTokens = (accessToken: string | null, refreshToken: string | null): void => {
  if (!accessToken || !refreshToken || !fs.existsSync(ENV_PATH)) return;

  let env = fs.readFileSync(ENV_PATH, "utf8");
  env = upsert(env, "WITHINGS_ACCESS_TOKEN", accessToken);
  env = upsert(env, "WITHINGS_REFRESH_TOKEN", refreshToken);
  fs.writeFileSync(ENV_PATH, env, "utf8");

  // dotenv only reads the file once per process, so a later suite in the same
  // run would otherwise pick up the pair this one just invalidated.
  process.env.WITHINGS_ACCESS_TOKEN = accessToken;
  process.env.WITHINGS_REFRESH_TOKEN = refreshToken;
};
