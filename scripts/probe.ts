/**
 * Shape probe against the live Withings API.
 *
 *     pnpm run probe
 *
 * The specification and the live API disagree in places, and every such
 * disagreement so far has been a real bug in the models. This is how to check
 * cheaply: it prints the shape of each response, never the values, and writes
 * back any rotated tokens so a run does not invalidate your .env.
 *
 * Prints the SHAPE of responses (keys and value types) and never the values:
 * this is someone's health data, and the types are what needs verifying.
 *
 * Also writes rotated tokens back to .env, because Withings rotates the
 * refresh token on every renewal and the stored one stops working otherwise.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";
import { WithingsClient } from "../src";

const ENV_PATH = path.resolve(process.cwd(), ".env");
dotenv.config({ path: ENV_PATH });

const need = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`missing ${k}`);
  return v;
};

/** Describes a value by its type, never its content. */
const shape = (v: unknown, depth = 0): unknown => {
  if (v === null) return "null";
  if (Array.isArray(v)) return v.length === 0 ? "[] (empty)" : [`array(${v.length}) of`, shape(v[0], depth + 1)];
  if (typeof v === "object") {
    if (depth > 3) return "object(...)";
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as object)) out[k] = shape(val, depth + 1);
    return out;
  }
  return typeof v;
};

const show = (label: string, v: unknown) => {
  console.log(`\n===== ${label} =====`);
  console.log(JSON.stringify(shape(v), null, 1));
};

const persistTokens = (accessToken: string | null, refreshToken: string | null) => {
  if (!accessToken || !refreshToken) return;
  let env = fs.readFileSync(ENV_PATH, "utf8");
  env = env.replace(/WITHINGS_ACCESS_TOKEN=.*/, `WITHINGS_ACCESS_TOKEN=${accessToken}`);
  env = env.replace(/WITHINGS_REFRESH_TOKEN=.*/, `WITHINGS_REFRESH_TOKEN=${refreshToken}`);
  fs.writeFileSync(ENV_PATH, env, "utf8");
  console.log("\n[tokens rotated and written back to .env]");
};

const main = async () => {
  const client = new WithingsClient({
    clientId: need("WITHINGS_CLIENT_ID"),
    clientSecret: need("WITHINGS_CLIENT_SECRET"),
    redirectUri: need("WITHINGS_REDIRECT_URI"),
    accessToken: process.env.WITHINGS_ACCESS_TOKEN,
    refreshToken: process.env.WITHINGS_REFRESH_TOKEN,
    retry: {
      maxAttempts: 2,
      initialDelayMs: 11000,
      onRetry: (r) => console.log(`  [retry ${r.attempt} in ${r.delayMs}ms]`),
    },
  });

  const before = client.auth.getCurrentRefreshToken();

  try {
    const meas = await client.measures.getMeasurement({ lastupdate: new Date(0) });
    show("getMeasurement body", meas.body);
    const grp = meas.body.measuregrps?.[0];
    if (grp) {
      console.log("\nmeasuregrp key names:", Object.keys(grp).join(", "));
      console.log("measure key names   :", Object.keys(grp.measures?.[0] ?? {}).join(", "));
    }
    console.log("\nupdatetime runtime type:", typeof meas.body.updatetime);
    console.log("more runtime type      :", typeof meas.body.more);
  } catch (e) {
    console.log("\ngetMeasurement FAILED:", (e as Error).message);
  }

  try {
    const act = await client.measures.getActivity({ lastUpdate: new Date(0) });
    show("getActivity body", act.body);
    console.log("\nmore runtime type:", typeof act.body.more);
  } catch (e) {
    console.log("\ngetActivity FAILED:", (e as Error).message);
  }

  try {
    const now = Date.now();
    const sleep = await client.sleep.get({
      startdate: new Date(now - 7 * 24 * 3600 * 1000),
      enddate: new Date(now),
    });
    show("sleep.get body", sleep.body);
    console.log("\nseries is Array?", Array.isArray((sleep.body as { series?: unknown }).series));
  } catch (e) {
    console.log("\nsleep.get FAILED:", (e as Error).message);
  }

  try {
    const summary = await client.sleep.getSummary({ lastUpdate: new Date(0) });
    show("sleep.getSummary body", summary.body);
  } catch (e) {
    console.log("\nsleep.getSummary FAILED:", (e as Error).message);
  }

  const after = client.auth.getCurrentRefreshToken();
  if (after && after !== before) persistTokens(client.auth.getCurrentAccessToken(), after);
};

main().catch((e) => {
  console.error("probe failed:", e.message);
  process.exit(1);
});
