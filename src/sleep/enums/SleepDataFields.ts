/**
 * Metrics that can be requested from the sleep `get` action via `data_fields`.
 *
 * Anything not listed in the request is omitted from the response.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-get
 */
export enum SleepDataFields {
  /**
   * Heart Rate (beats per minute).
   */
  hr = "hr",
  /**
   * Respiration Rate (breaths per minute).
   */
  rr = "rr",
  /**
   * Total snoring time (seconds).
   */
  snoring = "snoring",
  /**
   * Heart rate variability - Standard deviation of the NN over 1 minute (in miliseconds).
   */
  sdnn_1 = "sdnn_1",
  /**
   * Heart rate variability - Root mean square of the successive differences over "a few seconds" (in miliseconds).
   */
  rmssd = "rmssd",
  /**
   * Heart rate variability - quality score.
   */
  hrv_quality = "hrv_quality",
  /**
   * Track the intensity of movement in bed on a minute-by-minute basis. The score ranges from 0 to 255, representing the intensity of movement. This…
   */
  mvt_score = "mvt_score",
  /**
   * Chest movement rate (events per minute).
   */
  chest_movement_rate = "chest_movement_rate",
  /**
   * Withings Sleep Rx (FDA Cleared) allows to estimate gaps in breathing sounds and to generate an index. This index corresponds to the number of…
   */
  withings_index = "withings_index",
  /**
   * Total time when breathing sounds were tracked. (seconds).
   */
  breathing_sounds = "breathing_sounds",
}
