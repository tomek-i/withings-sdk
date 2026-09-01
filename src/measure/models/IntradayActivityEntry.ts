/**
 * One slice of high frequency activity data.
 *
 * Fields marked below as requested are only returned when named in the
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
  /** SpO2 measured automatically by a tracker, as a percentage. */
  spo2_auto?: number;
  /** Heart rate variability: root mean square of successive differences. */
  rmssd?: number;
  /** Heart rate variability: standard deviation of NN over one minute. */
  sdnn1?: number;
  /** Heart rate variability quality score. */
  hrv_quality?: number;
  /** Core body temperature. */
  core_body_temperature?: number;

  /** Requested. Length of this slice, in seconds. */
  duration?: number;
  /** Requested. Number of steps. */
  steps?: number;
  /** Requested. Number of floors climbed. */
  elevation?: number;
  /** Requested. Calories burned, in kcal. */
  calories?: number;
  /** Requested. Distance travelled, in meters. */
  distance?: number;
  /** Requested. Number of swimming strokes. */
  stroke?: number;
  /** Requested. Number of pool laps swum. */
  pool_lap?: number;
  /** Requested. Heart rate, in bpm. */
  heart_rate?: number;
  /** Requested. Respiration rate, in breaths per minute. */
  rr?: number;
  /** Requested. Chest movement rate, in events per minute. */
  chest_movement_rate?: number;
}
