/* calories
 * > Active calories burned (in Kcal).
 *
 * intensity
 * > Intensity of the workout, from 0 to 100, as inputed by the user. If the user didn't manually give the intensity of his workout, the value will be 0.
 *
 * manual_distance
 * > Distance travelled manually entered by user (in meters).
 *
 * manual_calories
 * > Active calories burned manually entered by user (in Kcal).
 *
 * hr_average
 * > Average heart rate.
 *
 * hr_min
 * > Minimal heart rate.
 *
 * hr_max
 * > Maximal heart rate.
 *
 * hr_zone_0
 * > Duration in seconds when heart rate was in a light zone (cf. Glossary).
 *
 * hr_zone_1
 * > Duration in seconds when heart rate was in a moderate zone (cf. Glossary).
 *
 * hr_zone_2
 * > Duration in seconds when heart rate was in an intense zone (cf. Glossary).
 *
 * hr_zone_3
 * > Duration in seconds when heart rate was in maximal zone (cf. Glossary).
 *
 * pause_duration
 * > Total pause time in second filled by user
 *
 * algo_pause_duration
 * > Total pause time in seconds detected by Withings device (swim only)
 *
 * spo2_average
 * > Average percent of SpO2 percent value during a workout
 *
 * steps
 * > Number of steps.
 *
 * distance
 * > Distance travelled (in meters).
 *
 * elevation
 * > Number of floors climbed.
 *
 * pool_laps
 * > Number of pool laps.
 *
 * strokes
 * > Number of strokes.
 *
 * pool_length
 * > Length of the pool
 */

export enum GetWorkoutDataFields {
  calories = "calories",
  intensity = "intensity",
  manual_distance = "manual_distance",
  manual_calories = "manual_calories",
  hr_average = "hr_average",
  hr_min = "hr_min",
  hr_max = "hr_max",
  hr_zone_0 = "hr_zone_0",
  hr_zone_1 = "hr_zone_1",
  hr_zone_2 = "hr_zone_2",
  hr_zone_3 = "hr_zone_3",
  pause_duration = "pause_duration",
  algo_pause_duration = "algo_pause_duration",
  spo2_average = "spo2_average",
  steps = "steps",
  distance = "distance",
  elevation = "elevation",
  pool_laps = "pool_laps",
  strokes = "strokes",
  pool_length = "pool_length",
  /**
   * Average core body temperature.
   */
  core_body_temperature_avg = "core_body_temperature_avg",
  /**
   * Maximum core body temperature.
   */
  core_body_temperature_max = "core_body_temperature_max",
  /**
   * Minimum core body temperature.
   */
  core_body_temperature_min = "core_body_temperature_min",
  /**
   * Status of the core body temperature measurement.
   */
  core_body_temperature_status = "core_body_temperature_status",
}
