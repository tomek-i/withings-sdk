/**
 * Metrics that can be requested from `getactivity` via `data_fields`.
 *
 * Anything not listed in the request is omitted from the response.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getactivity
 */
export enum ActivityDataFields {
  /**
   * number of steps
   */
  steps = "steps",
  /**
   * distance travelled in meters
   */
  distance = "distance",
  /**
   * number of floors climbed
   */
  elevation = "elevation",
  /**
   * duration of soft activities in seconds
   */
  soft = "soft",
  /**
   * duration of moderate activities in seconds
   */
  moderate = "moderate",
  /**
   * duration of intense activities in seconds
   */
  intense = "intense",
  /**
   * Sum of intense and moderate activity durations (in seconds).
   */
  active = "active",
  /**
   * Active calories burned (in Kcal).
   * Calculated by mixing fine granularity calories estimation,
   * workouts estimated calories and calories manually set by the user.
   */
  calories = "calories",
  /**
   * Total calories burned (in Kcal).
   * Obtained by adding active calories (see calories) and passive calories.
   */
  totalcalories = "totalcalories",
  /**
   * average heart rate
   */
  hr_average = "hr_average",
  /**
   * minimum heart rate
   */
  hr_min = "hr_min",
  /**
   * maximum heart rate
   */
  hr_max = "hr_max",
  /**
   * Duration in seconds when heart rate was in a light zone
   */
  hr_zone_0 = "hr_zone_0",
  /**
   * Duration in seconds when heart rate was in a moderate zone
   */
  hr_zone_1 = "hr_zone_1",
  /**
   * Duration in seconds when heart rate was in a intense zone
   */
  hr_zone_2 = "hr_zone_2",
  /**
   * Duration in seconds when heart rate was in a maximal zone
   */
  hr_zone_3 = "hr_zone_3",
}
