/**
 * Metrics summarising one night.
 *
 * Every field is optional: the API only populates the ones named in the
 * request's `data_fields`.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-getsummary
 */
export interface SleepSummaryData {
  /**
   * Total time spent in bed (seconds). *(Use 'data_fields' to request this data.)*.
   */
  total_timeinbed?: number;
  /**
   * Total time spent asleep. Sum of light, deep and rem durations (seconds). *(Use 'data_fields' to request this data.)*.
   */
  total_sleep_time?: number;
  /**
   * Duration of sleep when night comes from external source (seconds). Light, Deep and Rem sleep durations are null in this case. *(Use 'data_fields' to…
   */
  asleepduration?: number;
  /**
   * Duration in state light sleep (seconds). *(Use 'data_fields' to request this data.)*.
   */
  lightsleepduration?: number;
  /**
   * Duration in state REM sleep (seconds). *(Use 'data_fields' to request this data.)*.
   */
  remsleepduration?: number;
  /**
   * Duration in state deep sleep (seconds). *(Use 'data_fields' to request this data.)*.
   */
  deepsleepduration?: number;
  /**
   * Ratio of the total sleep time over the time spent in bed. *(Use 'data_fields' to request this data.)*.
   */
  sleep_efficiency?: number;
  /**
   * Time spent in bed before falling asleep (seconds). *(Use 'data_fields' to request this data.)*.
   */
  sleep_latency?: number;
  /**
   * Time spent in bed after waking up (seconds). *(Use 'data_fields' to request this data.)*.
   */
  wakeup_latency?: number;
  /**
   * Time spent awake (seconds). *(Use 'data_fields' to request this data.)*.
   */
  wakeupduration?: number;
  /**
   * Number of times the user woke up while in bed. Does not include the number of times the user got out of bed. *(Use 'data_fields' to request this…
   */
  wakeupcount?: number;
  /**
   * Time spent awake in bed after falling asleep for the 1st time during the night (seconds). *(Use 'data_fields' to request this data.)*.
   */
  waso?: number;
  /**
   * Count of the REM sleep phases. *(Use 'data_fields' to request this data.)*.
   */
  nb_rem_episodes?: number;
  /**
   * Time to sleep (seconds). (deprecated) *(Use 'data_fields' to request this data.)*.
   */
  durationtosleep?: number;
  /**
   * Time to wake up (seconds). (deprecated) *(Use 'data_fields' to request this data.)*.
   */
  durationtowakeup?: number;
  /**
   * Number of times the user got out of bed during the night. *(Use 'data_fields' to request this data.)*.
   */
  out_of_bed_count?: number;
  /**
   * Average heart rate. (beats per minute).*(Use 'data_fields' to request this data.)*.
   */
  hr_average?: number;
  /**
   * Minimal heart rate (beats per minute). *(Use 'data_fields' to request this data.)*.
   */
  hr_min?: number;
  /**
   * Maximal heart rate (beats per minute).. *(Use 'data_fields' to request this data.)*.
   */
  hr_max?: number;
  /**
   * Average respiration rate (breaths per minute). *(Use 'data_fields' to request this data.)*.
   */
  rr_average?: number;
  /**
   * Minimal respiration rate (breaths per minute). *(Use 'data_fields' to request this data.)*.
   */
  rr_min?: number;
  /**
   * Maximal respiration rate (breaths per minute). *(Use 'data_fields' to request this data.)*.
   */
  rr_max?: number;
  /**
   * Intensity of breathing disturbances. Available for all Sleep and Sleep Analyzer devices (wellness metric).
   */
  breathing_quality_assessment?: number;
  /**
   * Intensity of breathing disturbances. Available for all Sleep and Sleep Analyzer devices (wellness metric).
   */
  breathing_disturbances_intensity?: number;
  /**
   * Total snoring time (seconds).
   */
  snoring?: number;
  /**
   * Numbers of snoring episodes of at least one minute.
   */
  snoringepisodecount?: number;
  /**
   * Sleep score.
   */
  sleep_score?: number;
  /**
   * Summary of sleep events that happened during the sleep activity. It is structured as a dictionary, where keys are the type of event, and the value is…
   */
  night_events?: Record<string, number[]>;
  /**
   * Medical grade AHI. Average number of hypopnea and apnea episodes per hour, that occured during sleep time. Only available for devices purchased in…
   */
  apnea_hypopnea_index?: number;
  /**
   * Track the average movement score in bed throughout the night. The score ranges from 0 to 255, representing the intensity of movement. This metric is…
   */
  mvt_score_avg?: number;
  /**
   * Track the duration (in seconds) of movement in bed. Only available for Sleep Analyzer devices (EU) and devices under prescriptions in the US (Sleep…
   */
  mvt_active_duration?: number;
  /**
   * Heart rate variability - Start average.
   */
  rmssd_start_avg?: number;
  /**
   * Heart rate variability - End average.
   */
  rmssd_end_avg?: number;
  /**
   * Average respiration rate (breaths per minute). *(Use 'data_fields' to request this data.)*.
   */
  chest_movement_rate_wellness_average?: number;
  /**
   * Minimal respiration rate (breaths per minute). *(Use 'data_fields' to request this data.)*.
   */
  chest_movement_rate_wellness_min?: number;
  /**
   * Maximal respiration rate (breaths per minute). *(Use 'data_fields' to request this data.)*.
   */
  chest_movement_rate_wellness_max?: number;
  /**
   * Withings Sleep Rx (FDA Cleared) allows to estimate gaps in breathing sounds and to generate an index. This index corresponds to the number of…
   */
  withings_index?: number;
  /**
   * Total time when breathing sounds were tracked. (seconds) *(Use 'data_fields' to request this data.)*.
   */
  breathing_sounds?: number;
  /**
   * Numbers of breathing sounds episodes of at least one minute. *(Use 'data_fields' to request this data.)*.
   */
  breathing_sounds_episode_count?: number;
  /**
   * Average chest movement rate (events per minute). *(Use 'data_fields' to request this data.)*.
   */
  chest_movement_rate_average?: number;
  /**
   * Minimal chest movement rate (events per minute). *(Use 'data_fields' to request this data.)*.
   */
  chest_movement_rate_min?: number;
  /**
   * Maximal chest movement rate (events per minute). *(Use 'data_fields' to request this data.)*.
   */
  chest_movement_rate_max?: number;
  /**
   * Minimal core body temperature (in celsius degrees). *(Use 'data_fields' to request this data.)*.
   */
  core_body_temperature_min?: number;
  /**
   * Maximal core body temperature (in celsius degrees). *(Use 'data_fields' to request this data.)*.
   */
  core_body_temperature_max?: number;
  /**
   * Avenage core body temperature (in celsius degrees). *(Use 'data_fields' to request this data.)*.
   */
  core_body_temperature_avg?: number;
  /**
   * Status of the temperature. *(Use 'data_fields' to request this data)* See the linked reference for the possible values.
   */
  core_body_temperature_status?: number;
}
