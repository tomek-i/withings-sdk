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
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  hr = "hr",
  /**
   * Respiration Rate (breaths per minute).
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  rr = "rr",
  /**
   * Total snoring time (seconds).
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  snoring = "snoring",
  /**
   * Heart rate variability - Standard deviation of the NN over 1 minute (in miliseconds).
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  sdnn_1 = "sdnn_1",
  /**
   * Heart rate variability - Root mean square of the successive differences over "a few seconds" (in miliseconds).
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  rmssd = "rmssd",
  /**
   * Heart rate variability - quality score.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  hrv_quality = "hrv_quality",
  /**
   * Track the intensity of movement in bed on a minute-by-minute basis. The score ranges from 0 to 255, representing the intensity of movement. This…
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  mvt_score = "mvt_score",
  /**
   * Chest movement rate (events per minute).
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  chest_movement_rate = "chest_movement_rate",
  /**
   * Withings Sleep Rx (FDA Cleared) allows to estimate gaps in breathing sounds and to generate an index. This index corresponds to the number of…
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  withings_index = "withings_index",
  /**
   * Total time when breathing sounds were tracked. (seconds).
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  breathing_sounds = "breathing_sounds",
}
