import { DateSelection, WithDateRange, WithWatermark } from "../../types/DateSelection";
import { GetActivityBaseOptions } from "./GetActivityBaseOptions";

/**
 * Options for {@link Measures.getActivity}.
 *
 * Either a `startDate`/`endDate` range or a `lastUpdate` watermark, never
 * both. See {@link DateSelection}.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getactivity
 */
export type GetActivityOptions = GetActivityBaseOptions & DateSelection;

/** Select activity within an explicit date range. */
export type WithStartEndDate = WithDateRange;

/** Select activity changed since a watermark, for incremental syncing. */
export type WithLastUpdate = WithWatermark;
