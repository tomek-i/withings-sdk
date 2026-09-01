import { WithPagination } from "../../types/WithPagination";
import { MeasurementCategoryType } from "../enums/MeasurementCategoryType";
import { MeasurementType } from "../enums/MeasurementType";

/**
 * Options for {@link Measures.getMeasurement}.
 *
 * A union, because `meastype` and `meastypes` are mutually exclusive: request
 * either one measure type or several, never both.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
 */
export type GetMeasurementOptions =
  | (GetMeasurementBaseOptions & WithMeastype)
  | (GetMeasurementBaseOptions & WithMeastypes);

/** Request several measure types at once. */
export interface WithMeastypes {
  /** Not valid in this form; use the single `meastype` variant instead. */
  meastype?: never;
  /** The measure types to return. */
  meastypes?: MeasurementType[];
}

/** Request a single measure type. */
export interface WithMeastype {
  /** The measure type to return. */
  meastype?: MeasurementType;
  /** Not valid in this form; use the `meastypes` variant instead. */
  meastypes?: never;
}

/** Options common to both forms of {@link GetMeasurementOptions}. */
export interface GetMeasurementBaseOptions extends WithPagination {
  /** Whether to return real measurements or the user's objectives. */
  category?: MeasurementCategoryType;
  /** Only return measurements taken at or after this moment. */
  startdate?: Date;
  /** Only return measurements taken at or before this moment. */
  enddate?: Date;
  /**
   * Return data created or updated after this date. Useful for synchronising
   * between systems. Use this instead of `startdate` and `enddate`.
   */
  lastupdate?: Date;
}
