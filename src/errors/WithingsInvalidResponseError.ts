/**
 * Thrown when a response cannot be read as a Withings response.
 *
 * This covers the case where the request succeeded at the HTTP layer but what
 * came back is not what the API is supposed to send: a proxy error page, a
 * captive portal, an HTML maintenance notice, or JSON without the `status`
 * envelope every Withings response carries.
 *
 * Without this, a non-JSON body escapes as a raw `SyntaxError` from
 * `JSON.parse`, which names no URL, carries no status, and reads like a bug in
 * the caller's own code.
 *
 * ```typescript
 * try {
 *   await client.measures.getMeasurement();
 * } catch (error) {
 *   if (error instanceof WithingsInvalidResponseError) {
 *     // something between you and Withings answered instead of the API
 *     console.error(error.url, error.httpStatus, error.snippet);
 *   }
 * }
 * ```
 */
export class WithingsInvalidResponseError extends Error {
  /** The URL that was requested. */
  public readonly url: string;

  /** The HTTP status of the response, which was in the success range. */
  public readonly httpStatus: number;

  /**
   * The start of the body that could not be read, truncated.
   *
   * Enough to recognise an HTML error page or a proxy notice, and short enough
   * to be safe to log.
   */
  public readonly snippet: string;

  /**
   * @param reason Why the body could not be read.
   * @param url The URL that was requested.
   * @param httpStatus The HTTP status of the response.
   * @param body The raw body text.
   */
  constructor(reason: string, url: string, httpStatus: number, body: string) {
    const snippet = summarise(body);
    super(`Withings returned a response that could not be read: ${reason}. Requested ${url}, got: ${snippet}`);

    this.name = "WithingsInvalidResponseError";
    this.url = url;
    this.httpStatus = httpStatus;
    this.snippet = snippet;
  }
}

/** Trims a body down to something loggable. */
const summarise = (body: string, limit = 200): string => {
  const collapsed = body.replace(/\s+/g, " ").trim();
  if (collapsed.length === 0) return "(empty body)";
  return collapsed.length > limit ? `${collapsed.slice(0, limit)}...` : collapsed;
};
