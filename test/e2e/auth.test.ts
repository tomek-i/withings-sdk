import { WithingsClient } from "../../src";
import { expectContract } from "../helpers/contract";
import { env } from "../helpers/env";
import { persistTokens } from "../helpers/persistTokens";

/**
 * Token refresh against the live API. Non-interactive, so it runs as part of
 * `pnpm run test:e2e`. The consent flow, which needs a browser and a human,
 * lives in interactive/ and is excluded by default.
 */
describe("live auth contract", () => {
  let client: WithingsClient;

  beforeAll(() => {
    if (!env.WITHINGS_REFRESH_TOKEN) {
      throw new Error("Run `pnpm run authorize` first: this suite needs a live token pair.");
    }

    client = new WithingsClient({
      clientId: env.WITHINGS_CLIENT_ID,
      clientSecret: env.WITHINGS_CLIENT_SECRET,
      redirectUri: env.WITHINGS_REDIRECT_URI,
      accessToken: env.WITHINGS_ACCESS_TOKEN,
      refreshToken: env.WITHINGS_REFRESH_TOKEN,
    });
  });

  afterAll(() => {
    persistTokens(client?.auth.getCurrentAccessToken() ?? null, client?.auth.getCurrentRefreshToken() ?? null);
  });

  it("refreshes, and the token body matches the modelled shape", async () => {
    const response = await client.auth.refreshAccessToken();

    expect(response.status).toEqual(0);
    expectContract("requesttoken body", response.body, {
      // A string from the authorization_code exchange, a number from a
      // refresh. Same field, same endpoint.
      userid: ["string", "number"],
      access_token: ["string"],
      refresh_token: ["string"],
      scope: ["string"],
      expires_in: ["number"],
      token_type: ["string"],
      csrf_token: ["string"],
    });
  });

  // Deliberately no second refresh here. Two refreshes back to back are, to
  // Withings, the same request inside its 10 second duplicate window, so the
  // test would trip the guard it is not trying to exercise. That rotation
  // happens is established by the suites writing the new pair back to .env.
});
