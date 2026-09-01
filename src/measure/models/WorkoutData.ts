/**
 * Metrics captured during a workout.
 *
 * Fields marked below as requested are only returned when named in the
 * request's `data_fields`.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getworkouts
 */
export interface WorkoutData {
  /** Workout intensity. */
  intensity?: number;
  /** Intensity entered manually by the user. */
  manual_intensity?: number;
  /** Duration the user paused the workout, in seconds. */
  pause_duration?: number;
  /** Duration detected as paused by the device, in seconds. */
  algo_pause_duration?: number;
  /** Average SpO2, as a percentage. */
  spo2_average?: number;

  /** Requested. Calories burned, in kcal. */
  calories?: number;
  /** Requested. Distance travelled, in meters. */
  distance?: number;
  /** Requested. Number of floors climbed. */
  elevation?: number;
  /** Requested. Number of steps. */
  steps?: number;
  /** Requested. Distance entered manually by the user, in meters. */
  manual_distance?: number;
  /** Requested. Calories entered manually by the user, in kcal. */
  manual_calories?: number;
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
  /** Requested. Number of pool laps swum. */
  pool_laps?: number;
  /** Requested. Pool length, in meters. */
  pool_length?: number;
  /** Requested. Number of swimming strokes. */
  strokes?: number;
  /** Requested. Average core body temperature. */
  core_body_temperature_avg?: number;
  /** Requested. Maximum core body temperature. */
  core_body_temperature_max?: number;
  /** Requested. Minimum core body temperature. */
  core_body_temperature_min?: number;
  /** Requested. Status of the core body temperature measurement. */
  core_body_temperature_status?: number;
}
