import { WithingsApiError, WithingsClient, WithingsInvalidResponseError } from "../../src";
import { nonJsonResponse, rawResponse, withingsResponse } from "../helpers/response";

const client = () =>
  new WithingsClient({
    clientId: "id",
    clientSecret: "secret",
    redirectUri: "https://example.com/cb",
    accessToken: "token",
    retry: false,
  });

describe("a response that is not a Withings response", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it("reports an HTML error page instead of throwing a raw SyntaxError", async () => {
    // A proxy or captive portal answering 200 with HTML used to escape as
    // "SyntaxError: Unexpected token '<'", which names nothing useful.
    fetchMock.mockImplementation(async () => nonJsonResponse("<html><body>Proxy error</body></html>"));

    await expect(client().measures.getMeasurement()).rejects.toBeInstanceOf(WithingsInvalidResponseError);
  });

  it("names the URL and shows what came back", async () => {
    fetchMock.mockImplementation(async () => nonJsonResponse("<html><body>Proxy error</body></html>"));

    let caught: WithingsInvalidResponseError | undefined;
    try {
      await client().measures.getMeasurement();
    } catch (error) {
      caught = error as WithingsInvalidResponseError;
    }

    expect(caught?.message).toContain("/measure");
    expect(caught?.snippet).toContain("Proxy error");
    expect(caught?.httpStatus).toEqual(200);
  });

  it("rejects JSON that has no status envelope", async () => {
    // Valid JSON, but not a Withings response. Continuing would hand the
    // caller a body that could be anything.
    fetchMock.mockImplementation(async () => rawResponse({ error: "blocked by policy" }));

    await expect(client().measures.getMeasurement()).rejects.toBeInstanceOf(WithingsInvalidResponseError);
  });

  it("rejects a status that is not a number", async () => {
    fetchMock.mockImplementation(async () => rawResponse({ status: "0", body: {} }));

    await expect(client().measures.getMeasurement()).rejects.toBeInstanceOf(WithingsInvalidResponseError);
  });

  it("reports an empty body rather than an empty message", async () => {
    fetchMock.mockImplementation(async () => nonJsonResponse(""));

    await expect(client().measures.getMeasurement()).rejects.toThrow(/empty body/);
  });

  it("is a different failure from the API refusing the request", async () => {
    fetchMock.mockImplementation(async () => rawResponse({ status: 601, error: "too many requests" }));

    // A real Withings failure is still a WithingsApiError, not this.
    await expect(client().measures.getMeasurement()).rejects.toBeInstanceOf(WithingsApiError);
  });

  it("leaves a valid response untouched", async () => {
    fetchMock.mockImplementation(async () => withingsResponse({ measuregrps: [] }));

    const response = await client().measures.getMeasurement();
    expect(response.status).toEqual(0);
  });

  it("guards the token endpoints too, which decode separately", async () => {
    fetchMock.mockImplementation(async () => nonJsonResponse("<html>maintenance</html>"));

    const c = new WithingsClient({
      clientId: "id",
      clientSecret: "secret",
      redirectUri: "https://example.com/cb",
      refreshToken: "refresh",
    });

    await expect(c.auth.refreshAccessToken()).rejects.toBeInstanceOf(WithingsInvalidResponseError);
  });
});
