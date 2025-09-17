import { z } from "zod";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  WHITININGS_CLIENT_ID: z.string(),
  WHITININGS_SECRET: z.string(),
  WHITININGS_REDIRECT_URI: z.string().url(),
  WHITHINGS_USER_ID: z.string(),
  WHITHINGS_ACCESS_TOKEN: z.string(),
  WHITHINGS_REFRESH_TOKEN: z.string(),
});

// Parse and validate environment variables
const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error("Invalid environment variables:", envParsed.error.format());
  process.exit(1); // Exit the process with an error code
}

export const env = envParsed.data;
