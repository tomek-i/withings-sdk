/**
 * One day of aggregated activity data.
 *
 * Everything below the device metadata is optional: the API only returns the
 * fields named in the request's `data_fields`, so a response reflects what was
 * asked for rather than the full set.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getactivity
 */
export interface Activity {
  /** The day this row covers, as `YYYY-MM-DD` in `timezone`. */
  date: string;
  /** IANA timezone the `date` is expressed in, e.g. `Europe/Berlin`. */
  timezone: string;
  /** Identifier of the device that recorded the data. */
  deviceid?: string | null;
  /** Hashed device identifier, returned instead of `deviceid` for some apps. */
  hash_deviceid?: string | null;
  /** Brand identifier of the recording device. */
  brand?: number;
  /** Whether the data came from a Withings activity tracker. */
  is_tracker?: boolean;

  /** Number of steps. */
  steps?: number;
  /** Distance travelled, in meters. */
  distance?: number;
  /** Number of floors climbed. */
  elevation?: number;
  /** Duration of soft activity, in seconds. */
  soft?: number;
  /** Duration of moderate activity, in seconds. */
  moderate?: number;
  /** Duration of intense activity, in seconds. */
  intense?: number;
  /** Sum of the intense and moderate durations, in seconds. */
  active?: number;
  /** Active calories burned, in kcal. */
  calories?: number;
  /** Active plus passive calories burned, in kcal. */
  totalcalories?: number;
  /** Average heart rate, in bpm. */
  hr_average?: number;
  /** Minimum heart rate, in bpm. */
  hr_min?: number;
  /** Maximum heart rate, in bpm. */
  hr_max?: number;
  /** Seconds spent in the light heart rate zone. */
  hr_zone_0?: number;
  /** Seconds spent in the moderate heart rate zone. */
  hr_zone_1?: number;
  /** Seconds spent in the intense heart rate zone. */
  hr_zone_2?: number;
  /** Seconds spent in the maximal heart rate zone. */
  hr_zone_3?: number;
}
