import { WithingsClient } from "../../src";
import { env } from "../../src/env";

describe("WITHINGS CLIENT AUTHORIZATION TESTS", () => {
  let client: WithingsClient;

  beforeAll(() => {
    const config = {
      clientId: env.WHITININGS_CLIENT_ID,
      clientSecret: env.WHITININGS_SECRET,
      redirectUri: env.WHITININGS_REDIRECT_URI!,
    };
    client = new WithingsClient(config);
  });

  it("should throw an error if scope is not provided", () => {
    const anyState = "";
    expect(() => client.auth.getAuthCodeUrl([], anyState)).toThrow("scope is required");
  });

  it("should generate the correct authorization code URL", () => {
    const scope = ["user.info", "user.metrics", "user.activity"];
    const state = "test_state";
    const expectedUrl = `https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id=${
      env.WHITININGS_CLIENT_ID
    }&state=test_state&scope=user.info,user.metrics,user.activity&redirect_uri=${encodeURIComponent(
      env.WHITININGS_REDIRECT_URI
    )}`;
    expect(client.auth.getAuthCodeUrl(scope, state)).toEqual(expectedUrl);
  });

  it("should remove the last comma from the scope parameter", () => {
    const scope = ["user.info", "user.metrics", "user.activity", ""];
    const state = "test_state";
    const expectedUrl = `https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id=${
      env.WHITININGS_CLIENT_ID
    }&state=test_state&scope=user.info,user.metrics,user.activity&redirect_uri=${encodeURIComponent(
      env.WHITININGS_REDIRECT_URI
    )}`;
    expect(client.auth.getAuthCodeUrl(scope, state)).toEqual(expectedUrl);
  });
});
