import { WorkoutData } from "./WorkoutData";

/**
 * A single workout session, aggregated from the data captured while it ran.
 *
 * Use `getIntradayActivity` for the high frequency data behind this summary.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getworkouts
 */
export interface Workout {
  /** Workout identifier. */
  id: number;
  /** Workout category, e.g. walking or swimming. */
  category: number;
  /** IANA timezone the workout was recorded in. */
  timezone: string;
  /** Identifier of the device model that recorded the workout. */
  model?: number;
  /** Attribution of the data, describing how it was captured. */
  attrib?: number;
  /** Start of the workout, as a unix timestamp in seconds. */
  startdate: number;
  /** End of the workout, as a unix timestamp in seconds. */
  enddate: number;
  /** The day the workout is attributed to, as `YYYY-MM-DD`. */
  date?: string;
  /** Last modification, as a unix timestamp in seconds. */
  modified?: number;
  /** Identifier of the device that recorded the workout. */
  deviceid?: string | null;
  /** Hashed device identifier, returned instead of `deviceid` for some apps. */
  hash_deviceid?: string | null;
  /** Metrics for the workout. Only the requested `data_fields` are populated. */
  data: WorkoutData;
}
