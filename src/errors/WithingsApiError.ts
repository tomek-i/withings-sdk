import { WithingsResponse } from "../types";
import { ErrorCodeHandler, WithingsResponseStatus } from "../util";

/**
 * Thrown when the Withings API reports a failure.
 *
 * The API answers with HTTP 200 and puts the outcome in the response body, so
 * a failure is not visible from the HTTP status. This error carries the raw
 * `status` code, the category it maps to, and the body, so callers can react
 * to a specific failure without matching on message strings:
 *
 * ```typescript
 * try {
 *   await client.measures.getMeasurement();
 * } catch (error) {
 *   if (error instanceof WithingsApiError && error.type === WithingsResponseStatus.TooManyRequests) {
 *     // back off and retry later
 *   }
 * }
 * ```
 *
 * @see https://developer.withings.com/api-reference/#tag/response_status
 */
export class WithingsApiError extends Error {
  /** The raw `status` code the API returned, e.g. `601`. */
  public readonly status: number;

  /**
   * The category `status` maps to. {@link WithingsResponseStatus.Unknown} when
   * the code is not one this SDK recognises.
   */
  public readonly type: WithingsResponseStatus;

  /** The response body, as returned. Often empty on a failure. */
  public readonly body: unknown;

  /**
   * The `error` string from the response, when the API supplied one. Withings
   * frequently omits it, which is why the message never relies on it alone.
   */
  public readonly apiMessage?: string;

  /**
   * @param response The decoded Withings response that reported the failure.
   */
  constructor(response: WithingsResponse<unknown>) {
    const type = ErrorCodeHandler(response.status);
    super(WithingsApiError.buildMessage(response, type));

    this.name = "WithingsApiError";
    this.status = response.status;
    this.type = type;
    this.body = response.body;
    this.apiMessage = response.error;
  }

  /**
   * Builds a message that stays informative when the API sends no `error`
   * string, which is the case that used to surface as `Error: undefined`.
   */
  private static buildMessage(response: WithingsResponse<unknown>, type: WithingsResponseStatus): string {
    const category = WithingsResponseStatus[type];
    const detail = response.error?.trim();

    return detail
      ? `Withings API error ${response.status} (${category}): ${detail}`
      : `Withings API error ${response.status} (${category}). The API did not provide an error message.`;
  }
}
