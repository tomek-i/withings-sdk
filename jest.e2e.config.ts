import type { Config } from "jest";

/**
 * End-to-end tests. These hit the live Withings API, require real credentials
 * in .env (see .env.example), and one of them opens a browser window for the
 * OAuth consent screen (that one is opt in). They are intentionally excluded
 * from `pnpm test` and CI.
 *
 * Run with: pnpm run test:e2e
 */
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test/e2e"],
  // The consent flow needs a browser and a human, so it is opt in via
  // `pnpm run test:e2e:consent`. Everything else runs unattended.
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/test/e2e/interactive/"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testTimeout: 60000,
};

export default config;
