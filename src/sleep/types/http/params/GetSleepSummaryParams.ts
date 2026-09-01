/**
 * Wire parameters for the sleep `getsummary` action.
 *
 * `startdateymd`/`enddateymd` and `lastupdate` are mutually exclusive; the
 * caller-facing `GetSleepSummaryOptions` union is what enforces that.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-getsummary
 */
export interface GetSleepSummaryParams {
  /**
   * Start date, as `YYYY-MM-DD`.
   * IMPORTANT: DO NOT USE WITH FOLLOWING PARAMS: [lastupdate]
   */
  startdateymd?: string;
  /**
   * End date, as `YYYY-MM-DD`.
   * IMPORTANT: DO NOT USE WITH FOLLOWING PARAMS: [lastupdate]
   */
  enddateymd?: string;
  /**
   * Return data created or updated after this date, as a unix timestamp in
   * seconds.
   * IMPORTANT: DO NOT USE WITH FOLLOWING PARAMS: [startdateymd, enddateymd]
   */
  lastupdate?: number;
  /** Requested data fields, separated by a comma. */
  data_fields?: string;
  /**
   * When a first call returns `more` and `offset:XX`, set value `XX` in this
   * parameter to retrieve the next available rows.
   */
  offset?: number;
}
