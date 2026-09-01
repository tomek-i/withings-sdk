import { WithingsClient } from "../../src";
import type { GetActivityOptions } from "../../src/measure/types/GetActivityOptions";
import { env } from "../helpers/env";

/**
 * Live API test. Requires WITHINGS_ACCESS_TOKEN (and ideally
 * WITHINGS_REFRESH_TOKEN) in .env — run the auth e2e suite once to obtain them.
 */
describe("MEASUREMENT TESTS", () => {
  let client: WithingsClient;

  beforeAll(() => {
    if (!env.WITHINGS_ACCESS_TOKEN) {
      throw new Error("WITHINGS_ACCESS_TOKEN is required for this suite. See .env.example.");
    }

    client = new WithingsClient({
      clientId: env.WITHINGS_CLIENT_ID,
      clientSecret: env.WITHINGS_CLIENT_SECRET,
      redirectUri: env.WITHINGS_REDIRECT_URI,
      accessToken: env.WITHINGS_ACCESS_TOKEN,
      refreshToken: env.WITHINGS_REFRESH_TOKEN,
    });
  });

  it("should call getMeasurement with no options successfully", async () => {
    const response = await client.measures.getMeasurement();
    // The Withings API reports success as status 0.
    expect(response.status).toEqual(0);
  });

  it("should call getActivity with lastUpdate successfully", async () => {
    const options: GetActivityOptions = { lastUpdate: new Date(0) };
    const response = await client.measures.getActivity(options);
    expect(response.status).toEqual(0);
  });
});
