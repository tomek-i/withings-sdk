/**
 * One slice of high frequency activity data.
 *
 * Every metric is optional: the API only returns the fields named in the
 * request's `data_fields`.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getintradayactivity
 */
export interface IntradayActivityEntry {
  /** Identifier of the device that recorded the slice. */
  deviceid?: string;
  /** Name of the device model, e.g. `Steel HR`. */
  model?: string;
  /** Numeric identifier of the device model. */
  model_id?: number;

  /** Length of this slice, in seconds. */
  duration?: number;
  /** Number of steps. */
  steps?: number;
  /** Number of floors climbed. */
  elevation?: number;
  /** Calories burned, in kcal. */
  calories?: number;
  /** Distance travelled, in meters. */
  distance?: number;
  /** Number of swimming strokes. */
  stroke?: number;
  /** Number of pool laps swum. */
  pool_lap?: number;
  /** Heart rate, in bpm. */
  heart_rate?: number;
  /** Automatically measured SpO2, as a percentage. */
  spo2_auto?: number;
}
