import { MeasurementCategoryType } from "../enums/MeasurementCategoryType";
import { MeasurementType } from "../enums/MeasurementType";
import { WithPagination } from "../../types/WithPagination";

// Union type for the GetMeasurement interface

export type GetMeasurementOptions =
  | (GetMeasurementBaseOptions & WithMeastype)
  | (GetMeasurementBaseOptions & WithMeastypes);

export interface WithMeastypes {
  meastype?: never;
  meastypes?: MeasurementType[];
}

export interface WithMeastype {
  meastype?: MeasurementType;
  meastypes?: never;
}

export interface GetMeasurementBaseOptions extends WithPagination {
  category?: MeasurementCategoryType;
  startdate?: Date;
  enddate?: Date;
  /**
   * Timestamp for requesting data that were updated or created after this date.
   * Useful for data synchronization between systems.
   * Use this instead of startdate + enddate.
   */
  lastupdate?: Date;
}
