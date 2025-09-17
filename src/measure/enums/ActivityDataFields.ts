export enum ActivityDataFields {
  /**
   * number of steps
   */
  steps,
  /**
   * distance travelled in meters
   */
  distance,
  /**
   * number of floors climbed
   */
  elevation,
  /**
   * duration of soft activities in seconds
   */
  soft,
  /**
   * duration of moderate activities in seconds
   */
  moderate,
  /**
   * duration of intense activities in seconds
   */
  intense,
  /**
   * Sum of intense and moderate activity durations (in seconds).
   */
  active,
  /**
   * Active calories burned (in Kcal).
   * Calculated by mixing fine granularity calories estimation,
   * workouts estimated calories and calories manually set by the user.
   */
  calories,
  /**
   * Total calories burned (in Kcal).
   * Obtained by adding active calories (see calories) and passive calories.
   */
  totalcalories,
  /**
   * average heart rate
   */
  hr_average,
  /**
   * minimum heart rate
   */
  hr_min,
  /**
   * maximum heart rate
   */
  hr_max,
  /**
   * Duration in seconds when heart rate was in a light zone
   */
  hr_zone_0,
  /**
   * Duration in seconds when heart rate was in a moderate zone
   */
  hr_zone_1,
  /**
   * Duration in seconds when heart rate was in a intense zone
   */
  hr_zone_2,
  /**
   * Duration in seconds when heart rate was in a maximal zone
   */
  hr_zone_3,
}
