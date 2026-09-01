/* @description
 * steps
 * > Number of steps.
 *
 * elevation
 * > Number of floors climbed.
 *
 * calories
 * > Estimation of active calories burned (in Kcal).
 *
 * distance
 * > Distance travelled (in meters).
 *
 * stroke
 * > Number of strokes performed.
 *
 * pool_lap
 * > Number of pool_lap performed.
 *
 * duration
 * > Duration of the activity (in seconds).
 *
 * heart_rate
 * > Measured heart rate.
 *
 * spo2_auto
 * > SpO2 measurement automatically tracked by a device tracker
 * */

export enum IntraDayActivityDataFields {
  steps = "steps",
  elevation = "elevation",
  calories = "calories",
  distance = "distance",
  stroke = "stroke",
  pool_lap = "pool_lap",
  duration = "duration",
  heart_rate = "heart_rate",
  spo2_auto = "spo2_auto",
  /**
   * Respiration rate, in breaths per minute.
   */
  rr = "rr",
  /**
   * Chest movement rate, in events per minute.
   */
  chest_movement_rate = "chest_movement_rate",
}
