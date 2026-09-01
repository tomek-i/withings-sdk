import { WithingsClient } from "../../src";

const CLIENT_ID = "test-client-id";
const REDIRECT_URI = "https://example.com/auth/withings/callback";

describe("Auth.getAuthCodeUrl", () => {
  let client: WithingsClient;

  beforeAll(() => {
    client = new WithingsClient({
      clientId: CLIENT_ID,
      clientSecret: "test-client-secret",
      redirectUri: REDIRECT_URI,
    });
  });

  const expectedUrl =
    `https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id=${CLIENT_ID}` +
    `&state=test_state&scope=user.info,user.metrics,user.activity` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  it("throws if no scope is provided", () => {
    expect(() => client.auth.getAuthCodeUrl([], "")).toThrow("scope is required");
  });

  it("generates the correct authorization code URL", () => {
    const scope = ["user.info", "user.metrics", "user.activity"];
    expect(client.auth.getAuthCodeUrl(scope, "test_state")).toEqual(expectedUrl);
  });

  it("drops empty entries from the scope parameter", () => {
    const scope = ["user.info", "user.metrics", "user.activity", ""];
    expect(client.auth.getAuthCodeUrl(scope, "test_state")).toEqual(expectedUrl);
  });
});

describe("Auth.generateSignature", () => {
  it("is a stable HMAC-SHA256 hex digest over the alphabetically sorted values", () => {
    const client = new WithingsClient({
      clientId: CLIENT_ID,
      clientSecret: "test-client-secret",
      redirectUri: REDIRECT_URI,
    });

    const signature = client.auth.generateSignature({
      action: "getnonce",
      client_id: CLIENT_ID,
      timestamp: 1700000000,
    });

    expect(signature).toMatch(/^[0-9a-f]{64}$/);
    // Same payload must always produce the same signature.
    expect(
      client.auth.generateSignature({
        action: "getnonce",
        client_id: CLIENT_ID,
        timestamp: 1700000000,
      })
    ).toEqual(signature);
  });
});
