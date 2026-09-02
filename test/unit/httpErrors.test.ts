import { isRetryableHttpStatus, parseRetryAfter, WithingsApiError, WithingsClient, WithingsHttpError } from "../../src";
import type { WithingsConfig } from "../../src";

const client = (retry: WithingsConfig["retry"] = { initialDelayMs: 0, jitter: false }) =>
  new WithingsClient({
    clientId: "id",
    clientSecret: "secret",
    redirectUri: "https://example.com/cb",
    accessToken: "token",
    refreshToken: "refresh",
    retry,
  });

const httpFailure = (status: number, headers: Record<string, string> = {}) =>
  ({
    ok: false,
    status,
    statusText: "Service Unavailable",
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
    json: async () => ({}),
  }) as unknown as Response;

const ok = () =>
  ({ ok: true, status: 200, json: async () => ({ status: 0, body: { measuregrps: [] } }) }) as unknown as Response;

describe("parseRetryAfter", () => {
  it("reads the seconds form", () => {
    expect(parseRetryAfter("120")).toEqual(120000);
    expect(parseRetryAfter(" 5 ")).toEqual(5000);
  });

  it("reads the date form", () => {
    const now = Date.parse("2024-01-05T00:00:00Z");
    expect(parseRetryAfter("Fri, 05 Jan 2024 00:00:30 GMT", now)).toEqual(30000);
  });

  it("treats a date in the past as retry now", () => {
    const now = Date.parse("2024-01-05T00:01:00Z");
    expect(parseRetryAfter("Fri, 05 Jan 2024 00:00:00 GMT", now)).toEqual(0);
  });

  it("returns undefined for anything unusable", () => {
    expect(parseRetryAfter(null)).toBeUndefined();
    expect(parseRetryAfter("")).toBeUndefined();
    expect(parseRetryAfter("soon")).toBeUndefined();
    expect(parseRetryAfter("-5")).toBeUndefined();
  });
});

describe("isRetryableHttpStatus", () => {
  it("retries transient failures", () => {
    for (const status of [429, 502, 503, 504]) expect(isRetryableHttpStatus(status)).toBe(true);
  });

  it("does not retry failures that will repeat", () => {
    // A 400 or 404 fails the same way every time, so retrying is just slower.
    for (const status of [400, 401, 403, 404, 500]) expect(isRetryableHttpStatus(status)).toBe(false);
  });
});

describe("WithingsHttpError", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it("is thrown for a non-2xx response, carrying the status", async () => {
    fetchMock.mockResolvedValue(httpFailure(404));

    await expect(client().measures.getMeasurement()).rejects.toMatchObject({
      name: "WithingsHttpError",
      status: 404,
    });
  });

  it("is an Error, so a caller who only cares that it failed still catches it", async () => {
    fetchMock.mockResolvedValue(httpFailure(404));

    await expect(client().measures.getMeasurement()).rejects.toBeInstanceOf(Error);
  });

  it("is distinct from WithingsApiError, since the causes are different", async () => {
    fetchMock.mockResolvedValue(httpFailure(404));

    let caught: unknown;
    try {
      await client().measures.getMeasurement();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(WithingsHttpError);
    // A body-level failure is a WithingsApiError; a transport failure is not.
    expect(caught).not.toBeInstanceOf(WithingsApiError);
  });

  it("names the status and URL in the message", async () => {
    fetchMock.mockResolvedValue(httpFailure(503));

    await expect(client().measures.getMeasurement()).rejects.toThrow(/503/);
    await expect(client().measures.getMeasurement()).rejects.toThrow(/wbsapi\.withings\.net/);
  });
});

describe("retrying transport failures", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it("retries a 503 and returns the eventual success", async () => {
    fetchMock.mockResolvedValueOnce(httpFailure(503)).mockResolvedValueOnce(ok());

    const response = await client().measures.getMeasurement();

    expect(response.status).toEqual(0);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries an HTTP 429, which the body-level retry never saw", async () => {
    fetchMock.mockResolvedValueOnce(httpFailure(429)).mockResolvedValueOnce(ok());

    await client().measures.getMeasurement();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry a 404", async () => {
    fetchMock.mockResolvedValue(httpFailure(404));

    await expect(client().measures.getMeasurement()).rejects.toBeInstanceOf(WithingsHttpError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("gives up after maxAttempts and throws the transport error", async () => {
    fetchMock.mockResolvedValue(httpFailure(503));

    await expect(client({ initialDelayMs: 0, maxAttempts: 3 }).measures.getMeasurement()).rejects.toMatchObject({
      name: "WithingsHttpError",
      status: 503,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("reports the transport failure through onRetry", async () => {
    fetchMock.mockResolvedValueOnce(httpFailure(503)).mockResolvedValueOnce(ok());

    let reported: unknown;
    await client({ initialDelayMs: 0, onRetry: ({ error }) => void (reported = error) }).measures.getMeasurement();

    expect(reported).toBeInstanceOf(WithingsHttpError);
  });

  it("waits as long as Retry-After asks, when that is longer than the backoff", async () => {
    fetchMock.mockResolvedValueOnce(httpFailure(503, { "retry-after": "2" })).mockResolvedValueOnce(ok());

    let waited = 0;
    await client({
      initialDelayMs: 0,
      maxDelayMs: 5000,
      onRetry: ({ delayMs }) => void (waited = delayMs),
    }).measures.getMeasurement();

    // The server said two seconds, and the computed backoff was zero.
    expect(waited).toEqual(2000);
  });

  it("caps Retry-After at maxDelayMs so a long header cannot hang the caller", async () => {
    fetchMock.mockResolvedValueOnce(httpFailure(503, { "retry-after": "3600" })).mockResolvedValueOnce(ok());

    let waited = 0;
    await client({
      initialDelayMs: 0,
      maxDelayMs: 1000,
      onRetry: ({ delayMs }) => void (waited = delayMs),
    }).measures.getMeasurement();

    expect(waited).toEqual(1000);
  });
});
