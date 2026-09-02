import { WithingsInvalidResponseError } from "../errors/WithingsInvalidResponseError";
import { WithingsResponse } from "../types";

/**
 * Reads a response body as a Withings response.
 *
 * Every path that decodes a response goes through here, so a body that is not
 * what the API is supposed to send fails in one recognisable way rather than
 * as a raw `SyntaxError` from `JSON.parse`.
 *
 * Two things are checked, and nothing more. The body must be JSON, and it must
 * carry the numeric `status` that every Withings response has. Field-level
 * validation is deliberately not done here: it would need a schema for every
 * endpoint, and the contract tests already hold the API to its shape.
 *
 * @param response The response to read.
 * @param url The URL that was requested, for the error message.
 * @returns The decoded response.
 * @throws {WithingsInvalidResponseError} If the body is not JSON, or is JSON
 *   without a numeric `status`.
 */
export const readWithingsResponse = async <T>(response: Response, url: string): Promise<WithingsResponse<T>> => {
  const text = await response.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new WithingsInvalidResponseError("the body is not JSON", url, response.status, text);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new WithingsInvalidResponseError("the body is not an object", url, response.status, text);
  }

  if (typeof (parsed as { status?: unknown }).status !== "number") {
    // Without a status there is nothing to map onto success or failure, and
    // continuing would hand the caller a body that may be anything at all.
    throw new WithingsInvalidResponseError("the body has no numeric status field", url, response.status, text);
  }

  return parsed as WithingsResponse<T>;
};
