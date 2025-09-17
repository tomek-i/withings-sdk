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
  steps,
  elevation,
  calories,
  distance,
  stroke,
  pool_lap,
  duration,
  heart_rate,
  spo2_auto,
}
