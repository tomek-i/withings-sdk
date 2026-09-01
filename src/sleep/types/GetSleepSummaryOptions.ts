import { SleepSummaryDataFields } from "../enums/SleepSummaryDataFields";

/**
 * Options for {@link Sleep.getSummary}.
 *
 * A union, because the two ways of selecting a period are mutually exclusive:
 * either a `startDate`/`endDate` range, or a `lastUpdate` watermark.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-getsummary
 */
export type GetSleepSummaryOptions =
  | (GetSleepSummaryBaseOptions & WithSleepStartEndDate)
  | (GetSleepSummaryBaseOptions & WithSleepLastUpdate);

/** Select nights within an explicit date range. */
export interface WithSleepStartEndDate {
  /** First day to return, inclusive. */
  startDate: Date;
  /** Last day to return, inclusive. */
  endDate: Date;
  /** Not valid in this form; use the `lastUpdate` variant instead. */
  lastUpdate?: never;
}

/** Select nights changed since a watermark, for incremental syncing. */
export interface WithSleepLastUpdate {
  /**
   * Return nights created or updated after this moment. `new Date(0)` asks for
   * everything Withings still holds.
   */
  lastUpdate: Date;
  /** Not valid in this form; use the date-range variant instead. */
  startDate?: never;
  /** Not valid in this form; use the date-range variant instead. */
  endDate?: never;
}

/** Options common to both forms of {@link GetSleepSummaryOptions}. */
export interface GetSleepSummaryBaseOptions {
  /**
   * Which metrics to return. Fields not listed here are omitted from the
   * response.
   */
  data_fields?: SleepSummaryDataFields[];
  /**
   * When a first call returns `more` and `offset:XX`, pass `XX` here to
   * retrieve the next available rows.
   */
  offset?: number;
}
