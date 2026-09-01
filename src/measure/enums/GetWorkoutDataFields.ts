/**
 * Metrics that can be requested from `getworkouts` via `data_fields`.
 *
 * Anything not listed in the request is omitted from the response. Availability
 * also depends on the workout category: unless noted otherwise, a field is
 * available for every category except Multi-sport and Breathing exercises.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getworkouts
 */
export enum GetWorkoutDataFields {
  /**
   * Active calories burned, in kcal.
   */
  calories = "calories",
  /**
   * Intensity of the workout, from 0 to 100, as entered by the user. Zero when
   * the user did not set one.
   */
  intensity = "intensity",
  /**
   * Distance travelled, manually entered by the user, in meters.
   */
  manual_distance = "manual_distance",
  /**
   * Active calories burned, manually entered by the user, in kcal.
   */
  manual_calories = "manual_calories",
  /**
   * Average heart rate, in bpm.
   */
  hr_average = "hr_average",
  /**
   * Minimal heart rate, in bpm.
   */
  hr_min = "hr_min",
  /**
   * Maximal heart rate, in bpm.
   */
  hr_max = "hr_max",
  /**
   * Duration in seconds spent in the light heart rate zone.
   */
  hr_zone_0 = "hr_zone_0",
  /**
   * Duration in seconds spent in the moderate heart rate zone.
   */
  hr_zone_1 = "hr_zone_1",
  /**
   * Duration in seconds spent in the intense heart rate zone.
   */
  hr_zone_2 = "hr_zone_2",
  /**
   * Duration in seconds spent in the maximal heart rate zone.
   */
  hr_zone_3 = "hr_zone_3",
  /**
   * Total pause time, in seconds, as set by the user.
   */
  pause_duration = "pause_duration",
  /**
   * Total pause time, in seconds, as detected by the device.
   */
  algo_pause_duration = "algo_pause_duration",
  /**
   * Average SpO2, as a percentage.
   */
  spo2_average = "spo2_average",
  /**
   * Number of steps. Not available for Swimming.
   */
  steps = "steps",
  /**
   * Distance travelled, in meters. Not available for Swimming.
   */
  distance = "distance",
  /**
   * Number of floors climbed. Not available for Swimming.
   */
  elevation = "elevation",
  /**
   * Number of pool laps. Swimming only.
   */
  pool_laps = "pool_laps",
  /**
   * Number of strokes. Swimming only.
   */
  strokes = "strokes",
  /**
   * Length of the pool. Swimming only.
   */
  pool_length = "pool_length",
  /**
   * Average core body temperature.
   */
  core_body_temperature_avg = "core_body_temperature_avg",
  /**
   * Maximal core body temperature.
   */
  core_body_temperature_max = "core_body_temperature_max",
  /**
   * Minimal core body temperature.
   */
  core_body_temperature_min = "core_body_temperature_min",
  /**
   * Status of the core body temperature measurement.
   */
  core_body_temperature_status = "core_body_temperature_status",
}
