/**
 * Metrics captured during a workout.
 *
 * Every field is optional: the API only populates the ones named in the
 * request's `data_fields`.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getworkouts
 */
export interface WorkoutData {
  /** Calories burned, in kcal. */
  calories?: number;
  /** Effective duration excluding pauses, in seconds. */
  effduration?: number;
  /** Workout intensity. */
  intensity?: number;
  /** Distance entered manually by the user, in meters. */
  manual_distance?: number;
  /** Calories entered manually by the user, in kcal. */
  manual_calories?: number;
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
  /** Duration the user paused the workout, in seconds. */
  pause_duration?: number;
  /** Duration detected as paused by the device, in seconds. */
  algo_pause_duration?: number;
  /** Average SpO2, as a percentage. */
  spo2_average?: number;
  /** Number of steps. */
  steps?: number;
  /** Distance travelled, in meters. */
  distance?: number;
  /** Number of floors climbed. */
  elevation?: number;
  /** Number of pool laps swum. */
  pool_laps?: number;
  /** Number of swimming strokes. */
  strokes?: number;
  /** Pool length, in meters. */
  pool_length?: number;
}
