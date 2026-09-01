import { GetActivityBaseOptions } from "./GetActivityBaseOptions";

/**
 * Options for {@link Measures.getActivity}.
 *
 * A union, because the two ways of selecting a period are mutually exclusive:
 * either a `startDate`/`endDate` range, or a `lastUpdate` watermark. The
 * `never` members are what stop both forms being supplied at once.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getactivity
 */
export type GetActivityOptions =
  | (GetActivityBaseOptions & WithStartEndDate)
  | (GetActivityBaseOptions & WithLastUpdate);

/** Select activity within an explicit date range. */
export interface WithStartEndDate {
  /** First day to return, inclusive. */
  startDate: Date;
  /** Last day to return, inclusive. */
  endDate: Date;
  /** Not valid in this form; use the `lastUpdate` variant instead. */
  lastUpdate?: never;
}

/** Select activity changed since a watermark, for incremental syncing. */
export interface WithLastUpdate {
  /**
   * Return rows created or updated after this moment. `new Date(0)` asks for
   * everything Withings still holds.
   */
  lastUpdate: Date;
  /** Not valid in this form; use the date-range variant instead. */
  startDate?: never;
  /** Not valid in this form; use the date-range variant instead. */
  endDate?: never;
}
