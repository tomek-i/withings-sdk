/**
 * Mints a fresh Withings token pair for local development.
 *
 * Withings access tokens last about three hours, and the refresh token is
 * rotated on every renewal — so a `.env` that sat unused goes stale, and the
 * failure it produces ("invalid refresh_token", then a cascade of "Same
 * arguments in less than 10 seconds") does not obviously mean "re-authorize".
 * This script is the way back.
 *
 * It serves the redirect URI locally, opens the consent screen, exchanges the
 * code, and writes the resulting tokens into `.env`.
 *
 *     pnpm run authorize
 *
 * Not part of the published package: `files` ships `dist` only.
 */
import { exec } from "node:child_process";
import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";
import * as dotenv from "dotenv";
import { WithingsClient } from "../src";

const ENV_PATH = path.resolve(process.cwd(), ".env");
dotenv.config({ path: ENV_PATH });

const SCOPES = ["user.info", "user.metrics", "user.activity", "user.sleepevents"];

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    console.error(`Missing ${key} in .env. Copy .env.example and fill it in.`);
    process.exit(1);
  }
  return value;
};

/** Rewrites a key in .env, appending it when it is not already present. */
const writeEnv = (contents: string, key: string, value: string): string =>
  new RegExp(`^${key}=.*$`, "m").test(contents)
    ? contents.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=${value}`)
    : `${contents.trimEnd()}\n${key}=${value}\n`;

const openBrowser = (url: string) => {
  const command =
    process.platform === "win32"
      ? `start "" "${url}"`
      : process.platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(command, (error) => {
    if (error) console.log(`Could not open a browser. Visit this URL yourself:\n\n${url}\n`);
  });
};

const main = async () => {
  const redirectUri = required("WITHINGS_REDIRECT_URI");
  const client = new WithingsClient({
    clientId: required("WITHINGS_CLIENT_ID"),
    clientSecret: required("WITHINGS_CLIENT_SECRET"),
    redirectUri,
  });

  const callback = new URL(redirectUri);
  const port = Number(callback.port || 80);
  const state = Math.random().toString(36).slice(2);

  await new Promise<void>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
      if (url.pathname !== callback.pathname) {
        res.writeHead(404).end("Not found");
        return;
      }

      const code = url.searchParams.get("code");
      if (!code) {
        res.writeHead(400).end("No code in the callback");
        return;
      }
      if (url.searchParams.get("state") !== state) {
        // The state exists precisely so a spoofed redirect cannot be accepted.
        res.writeHead(400).end("State mismatch, ignoring this callback");
        reject(new Error("state mismatch on the OAuth callback"));
        return;
      }

      try {
        await client.auth.fetchAccessToken(code);
        res.writeHead(200, { "Content-Type": "text/plain" }).end("Authorized. You can close this tab.");
        resolve();
      } catch (error) {
        res.writeHead(500).end("Token exchange failed");
        reject(error);
      } finally {
        server.close();
      }
    });

    server.listen(port, () => {
      const url = client.auth.getAuthCodeUrl(SCOPES, state);
      console.log(`Listening on ${callback.origin}${callback.pathname}`);
      console.log("Opening the Withings consent screen…\n");
      openBrowser(url);
    });

    server.on("error", reject);
  });

  const accessToken = client.auth.getCurrentAccessToken();
  const refreshToken = client.auth.getCurrentRefreshToken();
  if (!accessToken || !refreshToken) throw new Error("no tokens after a successful exchange");

  let env = fs.readFileSync(ENV_PATH, "utf8");
  env = writeEnv(env, "WITHINGS_ACCESS_TOKEN", accessToken);
  env = writeEnv(env, "WITHINGS_REFRESH_TOKEN", refreshToken);
  fs.writeFileSync(ENV_PATH, env, "utf8");

  console.log("Tokens written to .env. `pnpm run test:e2e` should work now.");
  console.log("Note: refreshing rotates the refresh token, so re-run this if the suite sits unused for a while.");
};

main().catch((error: Error) => {
  console.error(`\nAuthorization failed: ${error.message}`);
  process.exit(1);
});
