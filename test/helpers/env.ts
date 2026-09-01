import * as dotenv from "dotenv";
import { z } from "zod";

// Test-only helper. Loads and validates the credentials used by the live
// end-to-end suites. This is deliberately NOT part of the published package:
// a library must never read a .env file or terminate its host process.
dotenv.config();

const envSchema = z.object({
  WITHINGS_CLIENT_ID: z.string().min(1),
  WITHINGS_CLIENT_SECRET: z.string().min(1),
  WITHINGS_REDIRECT_URI: z.string().url(),
  WITHINGS_USER_ID: z.string().min(1).optional(),
  WITHINGS_ACCESS_TOKEN: z.string().min(1).optional(),
  WITHINGS_REFRESH_TOKEN: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Missing or invalid Withings credentials for the e2e suite. See .env.example.\n` +
      JSON.stringify(parsed.error.format(), null, 2)
  );
}

export const env = parsed.data;
