import { WithingsClient } from "../../src";
import { rawResponse } from "../helpers/response";

type WithingsBody = { status: number; body?: unknown; error?: string };

const jsonResponse = (payload: WithingsBody) => rawResponse(payload);

const baseConfig = {
  clientId: "id",
  clientSecret: "secret",
  redirectUri: "https://example.com/cb",
};

describe("authenticated requests", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it("throws a helpful error when no access token is available", async () => {
    const client = new WithingsClient(baseConfig);
    await expect(client.measures.getMeasurement()).rejects.toThrow(/Access token is not set/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the access token supplied via config", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 0, body: { measuregrps: [] } }));

    const client = new WithingsClient({ ...baseConfig, accessToken: "token-from-config" });
    await client.measures.getMeasurement();

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>).Authorization).toEqual("Bearer token-from-config");
  });

  it("picks up a token acquired after construction", async () => {
    const client = new WithingsClient(baseConfig);
    // Regression test: the token used to be snapshotted in the constructor,
    // so tokens obtained later were never sent.
    client.auth.setTokens({ accessToken: "token-acquired-later" });

    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 0, body: {} }));
    await client.measures.getMeasurement();

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>).Authorization).toEqual("Bearer token-acquired-later");
  });

  it("refreshes an expired token and retries the request once", async () => {
    fetchMock
      // 1. original request rejected as unauthenticated
      .mockResolvedValueOnce(jsonResponse({ status: 401, error: "invalid token" }))
      // 2. token refresh
      .mockResolvedValueOnce(
        jsonResponse({
          status: 0,
          body: { access_token: "new-access", refresh_token: "new-refresh", expires_in: 10800 },
        })
      )
      // 3. retry
      .mockResolvedValueOnce(jsonResponse({ status: 0, body: { measuregrps: [] } }));

    const client = new WithingsClient({
      ...baseConfig,
      accessToken: "expired-access",
      refreshToken: "valid-refresh",
    });

    // Regression test: the refresh callback used to be passed unbound, which
    // threw "Cannot read properties of undefined (reading 'refreshAccessToken')".
    const response = await client.measures.getMeasurement();

    expect(response.status).toEqual(0);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const [, retryInit] = fetchMock.mock.calls[2];
    expect((retryInit.headers as Record<string, string>).Authorization).toEqual("Bearer new-access");

    // The rotated refresh token must be stored, not the access token.
    expect(client.auth.getCurrentRefreshToken()).toEqual("new-refresh");
    expect(client.auth.getCurrentAccessToken()).toEqual("new-access");
  });

  it("does not retry more than once", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ status: 401, error: "invalid token" }))
      .mockResolvedValueOnce(
        jsonResponse({ status: 0, body: { access_token: "new-access", refresh_token: "new-refresh" } })
      )
      .mockResolvedValueOnce(jsonResponse({ status: 401, error: "still invalid" }));

    const client = new WithingsClient({
      ...baseConfig,
      accessToken: "expired-access",
      refreshToken: "valid-refresh",
    });

    await expect(client.measures.getMeasurement()).rejects.toThrow("still invalid");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("throws when a refresh is needed but no refresh token is known", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 401, error: "invalid token" }));

    const client = new WithingsClient({ ...baseConfig, accessToken: "expired-access" });

    await expect(client.measures.getMeasurement()).rejects.toThrow(/Refresh token is not set/);
  });
});
