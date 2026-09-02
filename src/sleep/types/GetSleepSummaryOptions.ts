import { DateSelection, WithDateRange, WithWatermark } from "../../types/DateSelection";
import { SleepSummaryDataFields } from "../enums/SleepSummaryDataFields";

/**
 * Options for {@link Sleep.getSummary}.
 *
 * Either a `startDate`/`endDate` range or a `lastUpdate` watermark, never
 * both. See {@link DateSelection}.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-getsummary
 */
export type GetSleepSummaryOptions = GetSleepSummaryBaseOptions & DateSelection;

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

/** Select nights within an explicit date range. */
export type WithSleepStartEndDate = WithDateRange;

/** Select nights changed since a watermark, for incremental syncing. */
export type WithSleepLastUpdate = WithWatermark;
