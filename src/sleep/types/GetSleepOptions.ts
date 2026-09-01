import { MeasurementType } from "../../measure/enums/MeasurementType";
import { SleepDataFields } from "../enums/SleepDataFields";

/**
 * Options for {@link Sleep.get}.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-get
 */
export interface GetSleepOptions {
  /**
   * Start of the period to read. A single call can span at most 7 days; use
   * several calls to cover a wider range.
   */
  startdate: Date;
  /** End of the period to read. */
  enddate: Date;
  /**
   * Which high frequency metrics to return. Fields not listed here are omitted
   * from the response.
   */
  data_fields?: SleepDataFields[];
  /** Additional measure types to return alongside the sleep data. */
  meastypes?: MeasurementType[];
}
