/**
 * Metrics that can be requested from the sleep `getsummary` action via `data_fields`.
 *
 * Anything not listed in the request is omitted from the response.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-getsummary
 */
export enum SleepSummaryDataFields {
  /**
   * Total time spent in bed (seconds).
   */
  total_timeinbed = "total_timeinbed",
  /**
   * Total time spent asleep. Sum of light, deep and rem durations (seconds).
   */
  total_sleep_time = "total_sleep_time",
  /**
   * Duration of sleep when night comes from external source (seconds).
   */
  asleepduration = "asleepduration",
  /**
   * Duration in state light sleep (seconds).
   */
  lightsleepduration = "lightsleepduration",
  /**
   * Duration in state REM sleep (seconds).
   */
  remsleepduration = "remsleepduration",
  /**
   * Duration in state deep sleep (seconds).
   */
  deepsleepduration = "deepsleepduration",
  /**
   * Ratio of the total sleep time over the time spent in bed.
   */
  sleep_efficiency = "sleep_efficiency",
  /**
   * Time spent in bed before falling asleep (seconds).
   */
  sleep_latency = "sleep_latency",
  /**
   * Time spent in bed after waking up (seconds).
   */
  wakeup_latency = "wakeup_latency",
  /**
   * Time spent awake (seconds).
   */
  wakeupduration = "wakeupduration",
  /**
   * Number of times the user woke up while in bed. Does not include the number of times the user got out of bed.
   */
  wakeupcount = "wakeupcount",
  /**
   * Time spent awake in bed after falling asleep for the 1st time during the night (seconds).
   */
  waso = "waso",
  /**
   * Count of the REM sleep phases.
   */
  nb_rem_episodes = "nb_rem_episodes",
  /**
   * Intensity of.
   */
  breathing_disturbances_intensity = "breathing_disturbances_intensity",
  /**
   * Medical grade AHI. Average number of hypopnea and apnea episodes per hour, that occured during sleep time.
   */
  apnea_hypopnea_index = "apnea_hypopnea_index",
  /**
   * Withings Sleep Rx (FDA Cleared) allows to estimate gaps in breathing sounds and to generate an index. This index corresponds to the number of…
   */
  withings_index = "withings_index",
  /**
   * Time to sleep (seconds). (deprecated).
   */
  durationtosleep = "durationtosleep",
  /**
   * Time to wake up (seconds). (deprecated).
   */
  durationtowakeup = "durationtowakeup",
  /**
   * Number of times the user got out of bed during the night.
   */
  out_of_bed_count = "out_of_bed_count",
  /**
   * Average heart rate. (beats per minute).
   */
  hr_average = "hr_average",
  /**
   * Minimal heart rate (beats per minute).
   */
  hr_min = "hr_min",
  /**
   * Maximal heart rate (beats per minute)..
   */
  hr_max = "hr_max",
  /**
   * Average respiration rate (breaths per minute).
   */
  rr_average = "rr_average",
  /**
   * Minimal respiration rate (breaths per minute).
   */
  rr_min = "rr_min",
  /**
   * Maximal respiration rate (breaths per minute).
   */
  rr_max = "rr_max",
  /**
   * Intensity of.
   */
  breathing_quality_assessment = "breathing_quality_assessment",
  /**
   * Total snoring time (seconds).
   */
  snoring = "snoring",
  /**
   * Numbers of snoring episodes of at least one minute.
   */
  snoringepisodecount = "snoringepisodecount",
  /**
   * Sleep score.
   */
  sleep_score = "sleep_score",
  /**
   * Summary of sleep events that happened during the sleep activity. It is structured as a dictionary, where keys are the type of event, and the value is…
   */
  night_events = "night_events",
  /**
   * Track the average movement score in bed throughout the night. The score ranges from 0 to 255, representing the intensity of movement. This metric is…
   */
  mvt_score_avg = "mvt_score_avg",
  /**
   * Track the duration (in seconds) of movement in bed. Only available for Sleep Analyzer devices (EU) and devices under prescriptions in the US (Sleep…
   */
  mvt_active_duration = "mvt_active_duration",
  /**
   * Heart rate variability - Start average.
   */
  rmssd_start_avg = "rmssd_start_avg",
  /**
   * Heart rate variability - End average.
   */
  rmssd_end_avg = "rmssd_end_avg",
  /**
   * Average respiration rate (breaths per minute).
   */
  chest_movement_rate_wellness_average = "chest_movement_rate_wellness_average",
  /**
   * Minimal respiration rate (breaths per minute).
   */
  chest_movement_rate_wellness_min = "chest_movement_rate_wellness_min",
  /**
   * Maximal respiration rate (breaths per minute).
   */
  chest_movement_rate_wellness_max = "chest_movement_rate_wellness_max",
  /**
   * Total time when breathing sounds were tracked. (seconds).
   */
  breathing_sounds = "breathing_sounds",
  /**
   * Numbers of breathing sounds episodes of at least one minute.
   */
  breathing_sounds_episode_count = "breathing_sounds_episode_count",
  /**
   * Average chest movement rate (events per minute).
   */
  chest_movement_rate_average = "chest_movement_rate_average",
  /**
   * Minimal chest movement rate (events per minute).
   */
  chest_movement_rate_min = "chest_movement_rate_min",
  /**
   * Maximal chest movement rate (events per minute).
   */
  chest_movement_rate_max = "chest_movement_rate_max",
  /**
   * Minimal core body temperature (in celsius degrees).
   */
  core_body_temperature_min = "core_body_temperature_min",
  /**
   * Maximal core body temperature (in celsius degrees).
   */
  core_body_temperature_max = "core_body_temperature_max",
  /**
   * Avenage core body temperature (in celsius degrees).
   */
  core_body_temperature_avg = "core_body_temperature_avg",
  /**
   * Status of the temperature. *(Use 'data_fields' to request this data)* See the linked reference for the possible values.
   */
  core_body_temperature_status = "core_body_temperature_status",
}
