/**
 * Sorts a parameter object by key, alphabetically.
 *
 * Withings requires signed requests to concatenate their values in this order.
 *
 * @param params Key-value pairs to sort.
 * @returns The entries, ordered by key.
 */
export const sortParams = (params: { [key: string]: string | number }) => {
  return Object.entries(params).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
};

/**
 * Formats a date as the `YYYYMMDD` string several Withings parameters expect.
 *
 * Uses the local date parts, so the result matches the caller's timezone.
 *
 * @param date The date to format.
 * @returns The date as `YYYYMMDD`.
 */
export const formatYmd = (date: Date): string => {
  const year = date.getFullYear();
  // Adding 1 because getMonth() returns month from 0-11
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Ensuring month and day are in 'MM' and 'DD' format
  const monthFormatted = month < 10 ? `0${month}` : month.toString();
  const dayFormatted = day < 10 ? `0${day}` : day.toString();

  return `${year}${monthFormatted}${dayFormatted}`;
};

/**
 * Serialises a request-parameter object into a query string, dropping any
 * parameter that was not set.
 *
 * Typed as `object` rather than `Record<string, unknown>` on purpose: the
 * request types are interfaces, and interfaces are not assignable to an index
 * signature in TypeScript.
 */
export const encodeQueryParams = (params: object): string => {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
};
/**
 * Coarse grouping of the many status codes the Withings API returns.
 *
 * The API reports failures in the response body with HTTP 200, using a large
 * and sparsely documented set of numeric codes. {@link ErrorCodeHandler} maps
 * a raw code onto one of these categories.
 *
 * @see https://developer.withings.com/api-reference/#tag/response_status
 */
export enum WithingsResponseStatus {
  /** The call succeeded. Corresponds to raw status `0`. */
  Success,
  /** The access token is missing, expired or otherwise not accepted. */
  AuthenticationFailed,
  /** The request was malformed, or a parameter was missing or invalid. */
  InvalidParamsError,
  /** Authenticated, but not permitted to access this resource. */
  UnauthorizedError,
  /** An unclassified error reported by the API. */
  Error,
  /** The request timed out. */
  Timeout,
  /** The resource is in a state that does not allow this operation. */
  BadState,
  /** Rate limited. Back off before retrying. */
  TooManyRequests,
  /** The requested operation is not implemented. */
  NotImplemented,
}

const isBetween = (val: number, min: number, max: number) => {
  return val >= min && val <= max;
};

/**
 * Maps a raw Withings status code onto a {@link WithingsResponseStatus}.
 *
 * @param code The `status` field from a Withings response.
 * @returns The matching category, or `undefined` if the code is unmapped.
 * @see https://developer.withings.com/api-reference/#tag/response_status
 */
export const ErrorCodeHandler = (code: number) => {
  if (code === 0) {
    return WithingsResponseStatus.Success;
  }

  if (isBetween(code, 100, 102) || [200, 401].includes(code)) return WithingsResponseStatus.AuthenticationFailed;

  if (
    isBetween(code, 201, 213) ||
    isBetween(code, 216, 218) ||
    isBetween(code, 220, 221) ||
    isBetween(code, 227, 230) ||
    isBetween(code, 234, 236) ||
    isBetween(code, 240, 252) ||
    isBetween(code, 260, 267) ||
    isBetween(code, 271, 272) ||
    isBetween(code, 275, 276) ||
    isBetween(code, 283, 288) ||
    isBetween(code, 293, 295) ||
    isBetween(code, 300, 304) ||
    isBetween(code, 323, 353) ||
    isBetween(code, 380, 382) ||
    isBetween(code, 501, 511) ||
    isBetween(code, 3017, 3019) ||
    [223, 225, 238, 254, 290, 297, 321, 400, 523, 532].includes(code)
  ) {
    return WithingsResponseStatus.InvalidParamsError;
  }

  if ([214, 277, 2553, 2555].includes(code)) return WithingsResponseStatus.UnauthorizedError;

  if (
    isBetween(code, 231, 233) ||
    isBetween(code, 255, 259) ||
    isBetween(code, 268, 270) ||
    isBetween(code, 273, 274) ||
    isBetween(code, 278, 282) ||
    isBetween(code, 291, 292) ||
    isBetween(code, 305, 320) ||
    isBetween(code, 370, 375) ||
    isBetween(code, 516, 521) ||
    isBetween(code, 525, 531) ||
    isBetween(code, 1051, 1054) ||
    isBetween(code, 2551, 2552) ||
    isBetween(code, 2556, 2559) ||
    isBetween(code, 3000, 3016) ||
    isBetween(code, 3020, 3024) ||
    isBetween(code, 5000, 5006) ||
    isBetween(code, 6010, 6011) ||
    [215, 219, 222, 224, 226, 237, 253, 289, 296, 298, 322, 383, 391, 402, 533, 602, 700, 6000, 9000, 10000].includes(
      code
    )
  )
    return WithingsResponseStatus.Error;

  if (code === 522) return WithingsResponseStatus.Timeout;
  if (code === 524) return WithingsResponseStatus.BadState;
  if (code === 601) return WithingsResponseStatus.TooManyRequests;
};
