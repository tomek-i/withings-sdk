/**
 * Whether a measure group holds real measurements or the user's objectives.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
 */
export enum MeasurementCategoryType {
  /** An actual measurement taken by a device. */
  RealMesurement = 1,
  /** A target the user set for themselves, rather than a measurement. */
  UserObjectives = 2,
}
