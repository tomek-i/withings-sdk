/**
 * One day of aggregated activity data.
 *
 * Fields marked below as requested are only returned when named in the
 * request's `data_fields`, so a response reflects what was asked for rather
 * than the full set.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getactivity
 */
export interface Activity {
  /** The day this row covers, as `YYYY-MM-DD` in `timezone`. */
  date?: string;
  /** IANA timezone the `date` is expressed in, e.g. `Europe/Berlin`. */
  timezone?: string;
  /** Identifier of the device that recorded the data. */
  deviceid?: string;
  /** Hashed device identifier, returned instead of `deviceid` for some apps. */
  hash_deviceid?: string;
  /** Brand identifier of the recording device. */
  brand?: number;
  /** Whether the data came from a Withings activity tracker. */
  is_tracker?: boolean;
  /** Last modification, as a unix timestamp in seconds. */
  modified?: number;
  /** Name of the device model, e.g. `Steel HR`. */
  model?: string;
  /** Numeric identifier of the device model. */
  modelid?: number;
  /** Active plus passive calories burned, in kcal. */
  totalcalories?: number;

  /** Requested. Number of steps. */
  steps?: number;
  /** Requested. Distance travelled, in meters. */
  distance?: number;
  /** Requested. Number of floors climbed. */
  elevation?: number;
  /** Requested. Duration of soft activity, in seconds. */
  soft?: number;
  /** Requested. Duration of moderate activity, in seconds. */
  moderate?: number;
  /** Requested. Duration of intense activity, in seconds. */
  intense?: number;
  /** Requested. Sum of the intense and moderate durations, in seconds. */
  active?: number;
  /** Requested. Active calories burned, in kcal. */
  calories?: number;
  /** Requested. Average heart rate, in bpm. */
  hr_average?: number;
  /** Requested. Minimum heart rate, in bpm. */
  hr_min?: number;
  /** Requested. Maximum heart rate, in bpm. */
  hr_max?: number;
  /** Requested. Seconds spent in the light heart rate zone. */
  hr_zone_0?: number;
  /** Requested. Seconds spent in the moderate heart rate zone. */
  hr_zone_1?: number;
  /** Requested. Seconds spent in the intense heart rate zone. */
  hr_zone_2?: number;
  /** Requested. Seconds spent in the maximal heart rate zone. */
  hr_zone_3?: number;
}
