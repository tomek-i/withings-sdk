import { WithingsApiError, WithingsClient, WithingsResponseStatus } from "../../src";
import { ErrorCodeHandler } from "../../src/util";
import { rawResponse } from "../helpers/response";

const jsonResponse = (payload: unknown) => rawResponse(payload);

// Retrying is off here: this suite is about how failures surface, and the
// backoff would otherwise swallow the single mocked rate limit response.
// The retry behaviour itself is covered in retry.test.ts.
const client = (accessToken = "token") =>
  new WithingsClient({
    clientId: "id",
    clientSecret: "secret",
    redirectUri: "https://example.com/cb",
    accessToken,
    refreshToken: "refresh",
    retry: false,
  });

describe("ErrorCodeHandler", () => {
  it("never returns undefined, for any status code", () => {
    // Regression test: the mapping used to fall through the if-chain and
    // return undefined, which then produced `Error: undefined` downstream.
    for (let code = 0; code <= 11000; code++) {
      expect(ErrorCodeHandler(code)).toBeDefined();
    }
  });

  it("maps codes it does not recognise to Unknown", () => {
    expect(ErrorCodeHandler(99999)).toEqual(WithingsResponseStatus.Unknown);
    expect(ErrorCodeHandler(-1)).toEqual(WithingsResponseStatus.Unknown);
  });

  it("still maps the documented codes as before", () => {
    expect(ErrorCodeHandler(0)).toEqual(WithingsResponseStatus.Success);
    expect(ErrorCodeHandler(401)).toEqual(WithingsResponseStatus.AuthenticationFailed);
    expect(ErrorCodeHandler(601)).toEqual(WithingsResponseStatus.TooManyRequests);
  });
});

describe("WithingsApiError", () => {
  it("carries the raw status, the mapped category and the body", () => {
    const error = new WithingsApiError({ status: 601, body: { detail: 1 }, error: "too many requests" });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(WithingsApiError);
    expect(error.name).toEqual("WithingsApiError");
    expect(error.status).toEqual(601);
    expect(error.type).toEqual(WithingsResponseStatus.TooManyRequests);
    expect(error.body).toEqual({ detail: 1 });
    expect(error.apiMessage).toEqual("too many requests");
  });

  it("includes the API message when there is one", () => {
    const error = new WithingsApiError({ status: 401, body: {}, error: "invalid token" });
    expect(error.message).toEqual("Withings API error 401 (AuthenticationFailed): invalid token");
  });

  it("stays informative when the API supplies no error string", () => {
    // This is the case that used to produce `Error: undefined`.
    const error = new WithingsApiError({ status: 401, body: {} });

    expect(error.message).not.toContain("undefined");
    expect(error.message).toContain("401");
    expect(error.message).toContain("AuthenticationFailed");
  });

  it("reports an unmapped code as Unknown rather than failing", () => {
    const error = new WithingsApiError({ status: 99999, body: {} });

    expect(error.type).toEqual(WithingsResponseStatus.Unknown);
    expect(error.message).toContain("99999");
    expect(error.message).not.toContain("undefined");
  });
});

describe("errors thrown from requests", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it("throws WithingsApiError with the status attached", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 601, error: "too many requests" }));

    await expect(client().measures.getMeasurement()).rejects.toMatchObject({
      name: "WithingsApiError",
      status: 601,
      type: WithingsResponseStatus.TooManyRequests,
    });
  });

  it("lets a caller distinguish rate limiting without matching on strings", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 601 }));

    let caught: unknown;
    try {
      await client().measures.getMeasurement();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(WithingsApiError);
    expect((caught as WithingsApiError).type).toEqual(WithingsResponseStatus.TooManyRequests);
  });

  it("throws a usable error when the API reports a failure with no message", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 247 }));

    await expect(client().measures.getMeasurement()).rejects.toThrow(/Withings API error 247/);
  });

  it("surfaces a failed token exchange as WithingsApiError, not a TypeError", async () => {
    // Regression test: fetchAccessToken read data.body.access_token without
    // checking the status, so an error response failed with
    // "Cannot read properties of undefined (reading 'access_token')".
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 503, error: "invalid code" }));

    await expect(client().auth.fetchAccessToken("bad-code")).rejects.toBeInstanceOf(WithingsApiError);
  });

  it("surfaces a failed token refresh as WithingsApiError, not a TypeError", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 503, error: "invalid refresh token" }));

    await expect(client().auth.refreshAccessToken()).rejects.toMatchObject({
      name: "WithingsApiError",
      status: 503,
    });
  });

  it("reports the second failure when a refresh does not fix the request", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ status: 401, error: "expired" }))
      .mockResolvedValueOnce(jsonResponse({ status: 0, body: { access_token: "new", refresh_token: "new-r" } }))
      .mockResolvedValueOnce(jsonResponse({ status: 401, error: "still invalid" }));

    await expect(client().measures.getMeasurement()).rejects.toMatchObject({
      name: "WithingsApiError",
      status: 401,
      apiMessage: "still invalid",
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
