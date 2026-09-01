import { WithingsResponse } from "../types";

/**
 * The pagination fields Withings adds to a list response body.
 *
 * `more` is deliberately a union: `getmeas` reports it as a number while
 * `getactivity` and `getworkouts` report a boolean. That inconsistency is in
 * the API, and {@link hasMorePages} is what absorbs it.
 */
export interface PaginatedBody {
  /** Whether further rows are available. */
  more?: boolean | number;
  /** The offset to pass on the next call to continue reading. */
  offset?: number;
}

/**
 * Whether a response body reports that more rows are available.
 *
 * Handles both spellings the API uses, so callers never have to care which
 * endpoint they are reading.
 *
 * @param body The body of a list response.
 * @returns `true` when another page can be fetched.
 */
export const hasMorePages = (body: PaginatedBody | undefined): boolean => {
  if (!body) return false;
  return typeof body.more === "number" ? body.more > 0 : body.more === true;
};

/**
 * Walks a paginated Withings endpoint one page at a time.
 *
 * Pages are fetched lazily, so nothing is requested until the iterator is
 * advanced and the walk stops as soon as the caller stops consuming. That
 * matters against a rate-limited API: an eager "fetch everything" helper would
 * issue every request up front and hold the whole result set in memory.
 *
 * ```typescript
 * for await (const page of client.measures.getMeasurementPages(options)) {
 *   for (const group of page.measuregrps) {
 *     // ...
 *   }
 * }
 * ```
 *
 * Iteration stops when the API reports no further rows, or when the offset it
 * returns fails to advance — a stalled offset would otherwise loop forever.
 *
 * @param fetchPage Requests one page at the given offset. The first call
 *   receives `undefined`, meaning start from the beginning.
 * @returns An async iterator over the response bodies, one per page.
 */
export async function* paginate<T extends PaginatedBody>(
  fetchPage: (offset: number | undefined) => Promise<WithingsResponse<T>>
): AsyncGenerator<T, void, undefined> {
  let offset: number | undefined;

  while (true) {
    const response = await fetchPage(offset);
    const body = response.body;

    yield body;

    if (!hasMorePages(body)) return;

    const next = body.offset;

    // Defend against a page that claims more rows but cannot say where to
    // resume, or that hands back an offset which does not move forward.
    if (next === undefined || (offset !== undefined && next <= offset)) return;

    offset = next;
  }
}
