//TODO: extract to more global folder scope as it is mostl likely used outside of measure too
export interface WithPagination {
  /**
   * When a first call returns more:1 and offset:XX,
   * set value XX in this parameter to retrieve next available rows.
   */
  offset?: number;
}
