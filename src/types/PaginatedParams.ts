/**
 * The pagination parameter the list endpoints accept.
 *
 * Mixed into the wire parameter types. {@link WithPagination} is the
 * caller-facing equivalent.
 */
export interface PaginatedParams {
  /**
   * When a first call reports more rows and an offset, pass that offset here
   * to read the next page.
   */
  offset?: number;
}
