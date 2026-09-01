/**
 * Metrics that can be requested from `getintradayactivity` via `data_fields`.
 *
 * Anything not listed in the request is omitted from the response.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getintradayactivity
 */
export enum IntraDayActivityDataFields {
  /**
   * Number of steps.
   */
  steps = "steps",
  /**
   * Number of floors climbed.
   */
  elevation = "elevation",
  /**
   * Estimation of active calories burned, in kcal.
   */
  calories = "calories",
  /**
   * Distance travelled, in meters.
   */
  distance = "distance",
  /**
   * Number of swimming strokes performed.
   */
  stroke = "stroke",
  /**
   * Number of pool laps performed.
   */
  pool_lap = "pool_lap",
  /**
   * Duration of the activity slice, in seconds.
   */
  duration = "duration",
  /**
   * Measured heart rate, in bpm.
   */
  heart_rate = "heart_rate",
  /**
   * SpO2 measurement automatically tracked by a device, as a percentage.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  spo2_auto = "spo2_auto",
  /**
   * Respiration rate, in breaths per minute.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  rr = "rr",
  /**
   * Chest movement rate, in events per minute.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  chest_movement_rate = "chest_movement_rate",
}
