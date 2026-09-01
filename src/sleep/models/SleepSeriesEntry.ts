import { SleepState } from "../enums/SleepState";

/**
 * One contiguous stretch of a single sleep state, with any high frequency
 * measurements recorded during it.
 *
 * The measurement fields are objects keyed by a unix timestamp in seconds, and
 * are only present when named in the request's `data_fields`.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-get
 */
export interface SleepSeriesEntry {
  /**
   * The starting datetime for the sleep state data.
   */
  startdate: number;
  /**
   * The end datetime for the sleep data. A single call can span up to 7 days maximum. To cover a wider time range, you will need to perform multiple…
   */
  enddate: number;
  /**
   * The state of sleeping. See the linked reference for the possible values.
   */
  state: SleepState;
  /**
   * Device model. See the linked reference for the possible values.
   */
  model?: string;
  /**
   *
   */
  model_id?: number;
  /**
   * Heart Rate (beats per minute). *(Use 'data_fields' to request this data.)*.
   */
  hr?: Record<string, number>;
  /**
   * Respiration Rate (breaths per minute). *(Use 'data_fields' to request this data.)*.
   */
  rr?: Record<string, number>;
  /**
   * Total snoring time (seconds).
   */
  snoring?: Record<string, number>;
  /**
   * Heart rate variability - Standard deviation of the NN over 1 minute (in miliseconds).
   */
  sdnn_1?: Record<string, number>;
  /**
   * Heart rate variability - Root mean square of the successive differences over "a few seconds" (in miliseconds).
   */
  rmssd?: Record<string, number>;
  /**
   * Heart rate variability - quality score.
   */
  hrv_quality?: Record<string, number>;
  /**
   * Track the intensity of movement in bed on a minute-by-minute basis. The score ranges from 0 to 255, representing the intensity of movement. This…
   */
  mvt_score?: Record<string, number>;
  /**
   * Chest movement rate (events per minute). *(Use 'data_fields' to request this data.)*.
   */
  chest_movement_rate?: Record<string, number>;
  /**
   * Withings Sleep Rx (FDA Cleared) allows to estimate gaps in breathing sounds and to generate an index. This index corresponds to the number of…
   */
  withings_index?: Record<string, number>;
  /**
   * Total time when breathing sounds were tracked. (seconds) *(Use 'data_fields' to request this data.)*.
   */
  breathing_sounds?: Record<string, number>;
}
