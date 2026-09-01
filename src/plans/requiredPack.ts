import { MeasurementType } from "../measure/enums/MeasurementType";
import { BiomarkerPack } from "./BiomarkerPack";

/**
 * Which biomarker pack each `data_fields` value belongs to.
 *
 * Transcribed from Withings' published "Available Health Data" table, which
 * maps every metric to the Basic or Total pack.
 *
 * Two caveats, both deliberate:
 *
 * - This is a **hint**, not enforcement. Entitlement is decided server side,
 *   and Withings can change its packaging without changing this SDK. Nothing
 *   here blocks a request; it exists so a missing field can be explained.
 * - Fields Withings' table does not map onto a named metric are **absent**
 *   rather than guessed, so `requiredPack` returns `undefined` for them. An
 *   absent entry means "not known", never "included in every plan".
 *
 * @see https://developer.withings.com/developer-guide/v3/data-api/all-available-health-data/
 */
const DATA_FIELD_PACKS: Readonly<Record<string, BiomarkerPack>> = {
  // --- Activity (measure v2 getactivity, getintradayactivity) -------------
  steps: BiomarkerPack.Basic,
  distance: BiomarkerPack.Basic,
  elevation: BiomarkerPack.Basic,
  calories: BiomarkerPack.Basic,
  totalcalories: BiomarkerPack.Basic,
  soft: BiomarkerPack.Basic,
  moderate: BiomarkerPack.Basic,
  intense: BiomarkerPack.Basic,
  active: BiomarkerPack.Basic,
  duration: BiomarkerPack.Basic,
  // "Continuous Heart Rate" and "Punctual Heart Rate" are both Basic.
  hr_average: BiomarkerPack.Basic,
  hr_min: BiomarkerPack.Basic,
  hr_max: BiomarkerPack.Basic,
  hr_zone_0: BiomarkerPack.Basic,
  hr_zone_1: BiomarkerPack.Basic,
  hr_zone_2: BiomarkerPack.Basic,
  hr_zone_3: BiomarkerPack.Basic,
  heart_rate: BiomarkerPack.Basic,
  // Swimming metrics come with Workouts, which is Basic.
  stroke: BiomarkerPack.Basic,
  pool_lap: BiomarkerPack.Basic,
  pool_laps: BiomarkerPack.Basic,
  pool_length: BiomarkerPack.Basic,
  strokes: BiomarkerPack.Basic,
  intensity: BiomarkerPack.Basic,
  manual_intensity: BiomarkerPack.Basic,
  manual_distance: BiomarkerPack.Basic,
  manual_calories: BiomarkerPack.Basic,
  pause_duration: BiomarkerPack.Basic,
  algo_pause_duration: BiomarkerPack.Basic,

  // "SpO2 Auto" is Total; only manually taken SpO2 is Basic.
  spo2_auto: BiomarkerPack.Total,
  // Respiratory rate and chest movement are Total across every service.
  rr: BiomarkerPack.Total,
  chest_movement_rate: BiomarkerPack.Total,

  // --- Sleep summary (sleep v2 getsummary) --------------------------------
  total_sleep_time: BiomarkerPack.Basic,
  total_timeinbed: BiomarkerPack.Basic,
  sleep_efficiency: BiomarkerPack.Basic,
  sleep_latency: BiomarkerPack.Basic,
  wakeup_latency: BiomarkerPack.Basic,
  wakeupduration: BiomarkerPack.Basic,
  wakeupcount: BiomarkerPack.Basic,
  out_of_bed_count: BiomarkerPack.Basic,
  asleepduration: BiomarkerPack.Basic,
  deepsleepduration: BiomarkerPack.Basic,
  lightsleepduration: BiomarkerPack.Basic,
  remsleepduration: BiomarkerPack.Basic,
  nb_rem_episodes: BiomarkerPack.Basic,

  sleep_score: BiomarkerPack.Total,
  rr_average: BiomarkerPack.Total,
  rr_min: BiomarkerPack.Total,
  rr_max: BiomarkerPack.Total,
  snoring: BiomarkerPack.Total,
  snoringepisodecount: BiomarkerPack.Total,
  breathing_disturbances_intensity: BiomarkerPack.Total,
  breathing_quality_assessment: BiomarkerPack.Total,
  apnea_hypopnea_index: BiomarkerPack.Total,
  withings_index: BiomarkerPack.Total,
  breathing_sounds: BiomarkerPack.Total,
  breathing_sounds_episode_count: BiomarkerPack.Total,
  mvt_score: BiomarkerPack.Total,
  mvt_score_avg: BiomarkerPack.Total,
  mvt_active_duration: BiomarkerPack.Total,
  rmssd: BiomarkerPack.Total,
  rmssd_start_avg: BiomarkerPack.Total,
  rmssd_end_avg: BiomarkerPack.Total,
  sdnn_1: BiomarkerPack.Total,
  hrv_quality: BiomarkerPack.Total,
  chest_movement_rate_average: BiomarkerPack.Total,
  chest_movement_rate_min: BiomarkerPack.Total,
  chest_movement_rate_max: BiomarkerPack.Total,
  chest_movement_rate_wellness_average: BiomarkerPack.Total,
  chest_movement_rate_wellness_min: BiomarkerPack.Total,
  chest_movement_rate_wellness_max: BiomarkerPack.Total,

  // Heart rate measured during sleep is listed as Total, unlike tracker
  // heart rate. `hr` is the sleep get field; `heart_rate` is the intraday one.
  hr: BiomarkerPack.Total,
};

/**
 * Which biomarker pack each {@link MeasurementType} belongs to.
 *
 * Same caveats as the `data_fields` table: a hint, and absent where Withings'
 * table does not map the type onto a named metric.
 */
const MEASUREMENT_TYPE_PACKS: Readonly<Partial<Record<MeasurementType, BiomarkerPack>>> = {
  [MeasurementType.Weight]: BiomarkerPack.Basic,
  [MeasurementType.FatFreeMass]: BiomarkerPack.Basic,
  [MeasurementType.FatRatio]: BiomarkerPack.Basic,
  [MeasurementType.FatMassWeight]: BiomarkerPack.Basic,
  [MeasurementType.MuscleMass]: BiomarkerPack.Basic,
  [MeasurementType.BoneMass]: BiomarkerPack.Basic,
  [MeasurementType.Hydration]: BiomarkerPack.Basic,
  [MeasurementType.DiastolicBloodPressure]: BiomarkerPack.Basic,
  [MeasurementType.SystolicBloodPressure]: BiomarkerPack.Basic,
  [MeasurementType.HeartPulse]: BiomarkerPack.Basic,
  [MeasurementType.Temperature]: BiomarkerPack.Basic,
  [MeasurementType.BodyTemperature]: BiomarkerPack.Basic,
  // Only manually taken SpO2 is Basic.
  [MeasurementType.SPO02]: BiomarkerPack.Basic,

  [MeasurementType.SkinTemperature]: BiomarkerPack.Total,
  [MeasurementType.PulseWaveVelocity]: BiomarkerPack.Total,
  [MeasurementType.VascularAge]: BiomarkerPack.Total,
  [MeasurementType.VisceralFat]: BiomarkerPack.Total,
  [MeasurementType.VO2Max]: BiomarkerPack.Total,
  [MeasurementType.AtrialFibrilation]: BiomarkerPack.Total,
  [MeasurementType.AtrialFibrilationPPG]: BiomarkerPack.Total,
  [MeasurementType.QRSInterval]: BiomarkerPack.Total,
  [MeasurementType.PRInterval]: BiomarkerPack.Total,
  [MeasurementType.QTInterval]: BiomarkerPack.Total,
  [MeasurementType.QTcInterval]: BiomarkerPack.Total,
  [MeasurementType.NerveHealthScore]: BiomarkerPack.Total,
  [MeasurementType.ExtraCellularWater]: BiomarkerPack.Total,
  [MeasurementType.IntraCellularWater]: BiomarkerPack.Total,
  [MeasurementType.FatFreeMassSegments]: BiomarkerPack.Total,
  [MeasurementType.FatMass]: BiomarkerPack.Total,
  [MeasurementType.MuscleMassSegments]: BiomarkerPack.Total,
  [MeasurementType.BasalMetabolicRate]: BiomarkerPack.Total,
};

/**
 * The biomarker pack a `data_fields` value or {@link MeasurementType} needs.
 *
 * Use it to warn before a request, or to explain an absent field after one:
 *
 * ```typescript
 * if (requiredPack(SleepSummaryDataFields.sleep_score) === BiomarkerPack.Total) {
 *   // only returned on a paid plan
 * }
 * ```
 *
 * @param field A `data_fields` value or a {@link MeasurementType}.
 * @returns The pack the field belongs to, or `undefined` when Withings'
 *   published table does not map it. `undefined` means unknown, not free.
 */
export const requiredPack = (field: string | MeasurementType): BiomarkerPack | undefined =>
  typeof field === "number" ? MEASUREMENT_TYPE_PACKS[field] : DATA_FIELD_PACKS[field];

/**
 * Whether a field is only returned on a paid Withings plan.
 *
 * @param field A `data_fields` value or a {@link MeasurementType}.
 * @returns `true` only when the field is known to require the Total pack.
 *   Unknown fields return `false`, so this never over-reports.
 */
export const requiresPaidPlan = (field: string | MeasurementType): boolean =>
  requiredPack(field) === BiomarkerPack.Total;
