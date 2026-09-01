/**
 * Mixed into the options of endpoints that page their results.
 */
export interface WithPagination {
  /**
   * When a first call returns `more` set and `offset:XX`, pass `XX` here to
   * retrieve the next available rows.
   */
  offset?: number;
}
