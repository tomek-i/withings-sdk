import { WithingsApiError, WithingsClient, WithingsResponseStatus } from "../../src";
import type { WithingsConfig } from "../../src";
import { backoffDelay, DEFAULT_RETRY_OPTIONS, resolveRetryOptions } from "../../src/http/retry";

const rateLimited = () =>
  ({ ok: true, status: 200, json: async () => ({ status: 601, error: "too many requests" }) }) as unknown as Response;

const ok = () =>
  ({ ok: true, status: 200, json: async () => ({ status: 0, body: { measuregrps: [] } }) }) as unknown as Response;

/** Retries run with no delay, so the tests exercise the loop rather than the clock. */
const client = (retry: WithingsConfig["retry"] = { initialDelayMs: 0, jitter: false }) =>
  new WithingsClient({
    clientId: "id",
    clientSecret: "secret",
    redirectUri: "https://example.com/cb",
    accessToken: "token",
    refreshToken: "refresh",
    retry,
  });

describe("backoffDelay", () => {
  const fixed = { initialDelayMs: 1000, maxDelayMs: 30000, jitter: false };

  it("doubles the delay on each successive attempt", () => {
    expect(backoffDelay(1, fixed)).toEqual(1000);
    expect(backoffDelay(2, fixed)).toEqual(2000);
    expect(backoffDelay(3, fixed)).toEqual(4000);
    expect(backoffDelay(4, fixed)).toEqual(8000);
  });

  it("caps the delay so the doubling cannot run away", () => {
    expect(backoffDelay(20, fixed)).toEqual(30000);
  });

  it("spreads the delay across the range when jitter is on", () => {
    const jittered = { ...fixed, jitter: true };
    // Full jitter picks anywhere in [0, exponential], so a fleet limited at the
    // same moment does not retry in lockstep.
    expect(backoffDelay(3, jittered, () => 0)).toEqual(0);
    expect(backoffDelay(3, jittered, () => 0.5)).toEqual(2000);
    expect(backoffDelay(3, jittered, () => 0.999)).toBeLessThanOrEqual(4000);
  });
});

describe("resolveRetryOptions", () => {
  it("uses the documented defaults when nothing is supplied", () => {
    expect(resolveRetryOptions(undefined)).toEqual(DEFAULT_RETRY_OPTIONS);
    expect(DEFAULT_RETRY_OPTIONS.maxAttempts).toEqual(3);
  });

  it("treats false as a single attempt", () => {
    expect(resolveRetryOptions(false).maxAttempts).toEqual(1);
  });

  it("keeps the defaults for anything not overridden", () => {
    const resolved = resolveRetryOptions({ maxAttempts: 5 });
    expect(resolved.maxAttempts).toEqual(5);
    expect(resolved.initialDelayMs).toEqual(DEFAULT_RETRY_OPTIONS.initialDelayMs);
  });
});

describe("rate limit retrying", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it("retries a rate limited request and returns the eventual success", async () => {
    fetchMock.mockResolvedValueOnce(rateLimited()).mockResolvedValueOnce(ok());

    const response = await client().measures.getMeasurement();

    expect(response.status).toEqual(0);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("gives up after maxAttempts and throws the rate limit error", async () => {
    fetchMock.mockResolvedValue(rateLimited());

    await expect(client({ initialDelayMs: 0, maxAttempts: 3 }).measures.getMeasurement()).rejects.toMatchObject({
      name: "WithingsApiError",
      status: 601,
      type: WithingsResponseStatus.TooManyRequests,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does not retry when retrying is disabled", async () => {
    fetchMock.mockResolvedValue(rateLimited());

    await expect(client(false).measures.getMeasurement()).rejects.toBeInstanceOf(WithingsApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not retry failures that are not rate limits", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 247, error: "bad parameter" }),
    } as unknown as Response);

    await expect(client().measures.getMeasurement()).rejects.toMatchObject({ status: 247 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports each retry through onRetry", async () => {
    fetchMock.mockResolvedValueOnce(rateLimited()).mockResolvedValueOnce(rateLimited()).mockResolvedValueOnce(ok());

    const seen: number[] = [];
    await client({
      initialDelayMs: 0,
      jitter: false,
      onRetry: ({ attempt }) => seen.push(attempt),
    }).measures.getMeasurement();

    expect(seen).toEqual([1, 2]);
  });

  it("passes the rate limit error to onRetry", async () => {
    fetchMock.mockResolvedValueOnce(rateLimited()).mockResolvedValueOnce(ok());

    let reported: WithingsApiError | undefined;
    await client({ initialDelayMs: 0, onRetry: ({ error }) => void (reported = error) }).measures.getMeasurement();

    expect(reported).toBeInstanceOf(WithingsApiError);
    expect(reported?.type).toEqual(WithingsResponseStatus.TooManyRequests);
  });

  it("keeps the token refresh budget separate from the retry budget", async () => {
    // An expired token followed by rate limiting must not consume the same
    // allowance: they are different failures.
    fetchMock
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ status: 401, error: "expired" }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 0, body: { access_token: "new", refresh_token: "new-r" } }),
      })
      .mockResolvedValueOnce(rateLimited())
      .mockResolvedValueOnce(ok());

    const response = await client().measures.getMeasurement();

    expect(response.status).toEqual(0);
    // original, refresh, retried request, retry after the rate limit
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
