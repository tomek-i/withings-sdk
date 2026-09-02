import { DateSelection, WithDateRange, WithWatermark } from "../../types/DateSelection";
import { WithPagination } from "../../types/WithPagination";
import { GetWorkoutDataFields } from "../enums/GetWorkoutDataFields";

/**
 * Options for {@link Measures.getWorkouts}.
 *
 * Either a `startDate`/`endDate` range or a `lastUpdate` watermark, never
 * both. See {@link DateSelection}.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getworkouts
 */
export type GetWorkoutsOptions = GetWorkoutsBaseOptions & DateSelection;

/** Options common to both forms of {@link GetWorkoutsOptions}. */
export interface GetWorkoutsBaseOptions extends WithPagination {
  /**
   * Which workout metrics to return. The `data` object comes back empty
   * unless they are requested here.
   */
  data_fields?: GetWorkoutDataFields[];
}

/** Select workouts within an explicit date range. */
export type WithWorkoutStartEndDate = WithDateRange;

/** Select workouts changed since a watermark, for incremental syncing. */
export type WithWorkoutLastUpdate = WithWatermark;
