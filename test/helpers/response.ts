/**
 * Builders for the responses the tests feed to a mocked `fetch`.
 *
 * These construct real `Response` objects rather than object literals cast to
 * `Response`. A hand-rolled fake only implements the methods the SDK happened
 * to call when it was written, so it silently stops being representative the
 * moment the SDK reads the body differently. That is exactly what happened
 * when response decoding moved from `json()` to `text()`.
 */

/** A successful Withings response carrying the given body. */
export const withingsResponse = (body: unknown, status = 0): Response =>
  new Response(JSON.stringify({ status, body }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

/** A raw Withings envelope, for asserting on malformed or unusual payloads. */
export const rawResponse = (payload: unknown): Response =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

/** A body that is not JSON at all, such as a proxy error page. */
export const nonJsonResponse = (body: string, status = 200): Response =>
  new Response(body, { status, headers: { "content-type": "text/html" } });

/** A failure at the HTTP layer. */
export const httpFailureResponse = (status: number, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify({}), { status, headers });
