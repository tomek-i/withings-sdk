/**
 * Selects records by an explicit date range.
 *
 * The `never` members are what stop this being combined with a watermark. The
 * API documents the two as mutually exclusive, and sending both produces a
 * request it rejects.
 */
export interface WithDateRange {
  /** First day to return, inclusive. */
  startDate: Date;
  /** Last day to return, inclusive. */
  endDate: Date;
  /** Not valid in this form; use the watermark variant instead. */
  lastUpdate?: never;
}

/**
 * Selects records changed since a point in time, for incremental syncing.
 */
export interface WithWatermark {
  /**
   * Return records created or updated after this moment. `new Date(0)` asks
   * for everything Withings still holds.
   */
  lastUpdate: Date;
  /** Not valid in this form; use the date range variant instead. */
  startDate?: never;
  /** Not valid in this form; use the date range variant instead. */
  endDate?: never;
}

/**
 * Either a date range or a watermark, never both.
 *
 * Several endpoints offer this same choice, so it is declared once here and
 * intersected with each endpoint's own options.
 */
export type DateSelection = WithDateRange | WithWatermark;
