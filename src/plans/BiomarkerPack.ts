/**
 * The biomarker pack a metric belongs to in Withings' API plans.
 *
 * Withings splits health data into two packs. Which one you are entitled to is
 * a property of your **developer plan**, not of the end user's account or any
 * consumer subscription they may hold.
 *
 * At the time of writing the free plan grants the Basic pack only.
 *
 * @see https://developer.withings.com/developer-guide/v3/withings-solutions/withings-api-plans/
 * @see https://developer.withings.com/developer-guide/v3/data-api/all-available-health-data/
 */
export enum BiomarkerPack {
  /**
   * Included in every plan, including the free one: core body composition,
   * activity, sleep durations, blood pressure and body temperature.
   */
  Basic = "basic",
  /**
   * Requires a paid plan: sleep scoring and respiration, heart rate variability,
   * ECG, SpO2 auto, VO2 max, segmental body composition and similar.
   */
  Total = "total",
}
