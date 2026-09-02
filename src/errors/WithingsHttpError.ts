/**
 * Thrown when the request fails at the HTTP layer.
 *
 * This is a different failure from {@link WithingsApiError}. The Withings API
 * normally answers with HTTP 200 and reports problems in the response body. A
 * non-2xx status means the request did not reach that point: the edge rate
 * limited it, the service is unavailable, or the URL is wrong.
 *
 * Both extend `Error`, so a caller who only wants to know that something
 * failed can catch `Error`. A caller who wants to react to a specific failure
 * can check the type:
 *
 * ```typescript
 * try {
 *   await client.measures.getMeasurement();
 * } catch (error) {
 *   if (error instanceof WithingsHttpError && error.status === 503) {
 *     // the service is down, not your request
 *   }
 * }
 * ```
 */
export class WithingsHttpError extends Error {
  /** The HTTP status code, for example 503. */
  public readonly status: number;

  /** The HTTP status text, when the server sent one. */
  public readonly statusText: string;

  /** The URL that was requested. */
  public readonly url: string;

  /**
   * How long the server asked the caller to wait, in milliseconds.
   *
   * Parsed from the `Retry-After` header, which may hold either a number of
   * seconds or a date. Undefined when the header is absent or unreadable.
   */
  public readonly retryAfterMs?: number;

  /**
   * @param response The failed response.
   * @param url The URL that was requested.
   */
  constructor(response: Response, url: string) {
    super(`Withings HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""} for ${url}`);

    this.name = "WithingsHttpError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.url = url;

    const retryAfter = parseRetryAfter(response.headers?.get?.("retry-after") ?? null);
    if (retryAfter !== undefined) this.retryAfterMs = retryAfter;
  }
}

/**
 * Reads a `Retry-After` header value into milliseconds.
 *
 * The header holds either a number of seconds or an HTTP date, and both forms
 * are in use.
 *
 * @param value The raw header value.
 * @param now The current time, injectable so the date form can be tested.
 * @returns The delay in milliseconds, or undefined if there is nothing usable.
 */
export const parseRetryAfter = (value: string | null | undefined, now: number = Date.now()): number | undefined => {
  if (!value) return undefined;

  const seconds = Number(value.trim());
  if (!Number.isNaN(seconds)) return seconds >= 0 ? seconds * 1000 : undefined;

  const date = Date.parse(value);
  if (Number.isNaN(date)) return undefined;

  // A date already in the past means "retry now", not "retry in the past".
  return Math.max(0, date - now);
};

/**
 * Whether an HTTP status is worth retrying.
 *
 * Only transient failures qualify. A 400 or 404 will fail again the same way,
 * so retrying it just makes the failure slower.
 *
 * @param status The HTTP status code.
 * @returns True when a retry could plausibly succeed.
 */
export const isRetryableHttpStatus = (status: number): boolean =>
  status === 429 || status === 502 || status === 503 || status === 504;
