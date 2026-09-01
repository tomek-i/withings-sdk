import { WithPagination } from "../../types/WithPagination";
import { GetWorkoutDataFields } from "../enums/GetWorkoutDataFields";

/**
 * Options for {@link Measures.getWorkouts}.
 *
 * A union, because the two ways of selecting a period are mutually exclusive:
 * either a `startDate`/`endDate` range, or a `lastUpdate` watermark. The
 * `never` members are what stop both forms being supplied at once.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getworkouts
 */
export type GetWorkoutsOptions =
  | (GetWorkoutsBaseOptions & WithWorkoutStartEndDate)
  | (GetWorkoutsBaseOptions & WithWorkoutLastUpdate);

/** Select workouts within an explicit date range. */
export interface WithWorkoutStartEndDate {
  /** First day to return, inclusive. */
  startDate: Date;
  /** Last day to return, inclusive. */
  endDate: Date;
  /** Not valid in this form; use the `lastUpdate` variant instead. */
  lastUpdate?: never;
}

/** Select workouts changed since a watermark, for incremental syncing. */
export interface WithWorkoutLastUpdate {
  /**
   * Return workouts created or updated after this moment. `new Date(0)` asks
   * for everything Withings still holds.
   */
  lastUpdate: Date;
  /** Not valid in this form; use the date-range variant instead. */
  startDate?: never;
  /** Not valid in this form; use the date-range variant instead. */
  endDate?: never;
}

/** Options common to both forms of {@link GetWorkoutsOptions}. */
export interface GetWorkoutsBaseOptions extends WithPagination {
  /**
   * Which workout metrics to return. The `data` object comes back empty
   * unless they are requested here.
   */
  data_fields?: GetWorkoutDataFields[];
}
