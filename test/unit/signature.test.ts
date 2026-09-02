import { WithingsApiError, WithingsClient, WithingsResponseStatus } from "../../src";

const CLIENT_ID = "test-client-id";
const CLIENT_SECRET = "test-client-secret";

const client = () =>
  new WithingsClient({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: "https://example.com/cb",
  });

const respond = (body: unknown, status = 0) =>
  ({ ok: true, status: 200, json: async () => ({ status, body }) }) as unknown as Response;

describe("generateSignature", () => {
  /**
   * Known vectors, computed independently from the documented algorithm:
   * sort the parameters by key, join the values with commas, then HMAC-SHA256
   * with the client secret. Hard-coded on purpose — deriving them the same way
   * the implementation does would assert nothing.
   */
  it("matches a known vector for the getnonce payload", () => {
    const signature = client().auth.generateSignature({
      action: "getnonce",
      client_id: CLIENT_ID,
      timestamp: 1700000000,
    });

    // hmac_sha256("getnonce,test-client-id,1700000000", "test-client-secret")
    expect(signature).toEqual("0df7af3486fcb107d3e91c41875232b8a944ec204371f439ed599fd0f956a8b6");
  });

  it("matches a known vector for a nonce-signed payload", () => {
    const signature = client().auth.generateSignature({
      action: "subscribe",
      client_id: CLIENT_ID,
      nonce: "test-nonce",
    });

    // hmac_sha256("subscribe,test-client-id,test-nonce", "test-client-secret")
    expect(signature).toEqual("4ee797c55b413aeaae2257208e17070f29f9d3b06bacd7ad40fc7ea773167fd7");
  });

  it("sorts by key, not by the order the payload was written in", () => {
    const auth = client().auth;

    expect(auth.generateSignature({ timestamp: 1700000000, client_id: CLIENT_ID, action: "getnonce" })).toEqual(
      auth.generateSignature({ action: "getnonce", client_id: CLIENT_ID, timestamp: 1700000000 })
    );
  });
});

describe("getNonce", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(respond({ nonce: "server-nonce" }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  const sentBody = () => JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);

  it("posts a signed request to /v2/signature", async () => {
    await client().auth.getNonce();

    expect(String(fetchMock.mock.calls[0][0])).toContain("/v2/signature");
    expect(sentBody().action).toEqual("getnonce");
    expect(sentBody().client_id).toEqual(CLIENT_ID);
    expect(sentBody().signature).toMatch(/^[0-9a-f]{64}$/);
  });

  it("authenticates with the signature rather than a bearer token", async () => {
    // No access token is set, and the call still goes out: this endpoint is
    // authorized by client credentials, not by a user having authorized.
    await client().auth.getNonce();

    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it("signs the timestamp it actually sends", async () => {
    const auth = client().auth;
    await auth.getNonce();

    const { action, client_id, timestamp, signature } = sentBody();
    expect(signature).toEqual(auth.generateSignature({ action, client_id, timestamp }));
  });

  it("returns the nonce", async () => {
    const response = await client().auth.getNonce();
    expect(response.body.nonce).toEqual("server-nonce");
  });

  it("throws WithingsApiError when the API rejects the request", async () => {
    fetchMock.mockResolvedValueOnce(respond({}, 601));

    await expect(client().auth.getNonce()).rejects.toMatchObject({
      name: "WithingsApiError",
      status: 601,
      type: WithingsResponseStatus.TooManyRequests,
    });
  });

  it("does not read the body before checking the status", async () => {
    // Regression shape: an error response has no body, so reading it first
    // would throw a TypeError instead of reporting what went wrong.
    fetchMock.mockResolvedValueOnce(respond(undefined, 503));

    await expect(client().auth.getNonce()).rejects.toBeInstanceOf(WithingsApiError);
  });
});

describe("signedParams", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(respond({ nonce: "server-nonce" }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it("fetches a nonce and signs the action with it", async () => {
    const auth = client().auth;
    const signed = await auth.signedParams("subscribe");

    expect(signed).toEqual({
      action: "subscribe",
      client_id: CLIENT_ID,
      nonce: "server-nonce",
      signature: auth.generateSignature({ action: "subscribe", client_id: CLIENT_ID, nonce: "server-nonce" }),
    });
  });

  it("signs the nonce the server returned, not a locally invented one", async () => {
    fetchMock.mockResolvedValueOnce(respond({ nonce: "a-different-nonce" }));

    const signed = await client().auth.signedParams("subscribe");
    expect(signed.nonce).toEqual("a-different-nonce");
  });

  it("produces a different signature per action, since the action is signed", async () => {
    const auth = client().auth;
    const subscribe = await auth.signedParams("subscribe");
    const revoke = await auth.signedParams("revoke");

    expect(subscribe.signature).not.toEqual(revoke.signature);
  });

  it("spreads into a notify subscribe call", async () => {
    const c = client();
    const signed = await c.auth.signedParams("subscribe");

    fetchMock.mockResolvedValueOnce(respond({}));
    c.auth.setTokens({ accessToken: "token" });
    await c.notify.subscribe({ ...signed, callbackurl: "https://example.com/cb", appli: 1 });

    const params = new URL(fetchMock.mock.calls[1][0] as string).searchParams;
    expect(params.get("signature")).toEqual(signed.signature);
    expect(params.get("nonce")).toEqual("server-nonce");
    expect(params.get("client_id")).toEqual(CLIENT_ID);
  });
});
