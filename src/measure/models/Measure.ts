/**
 * A single measurement.
 *
 * The real figure is `value * 10 ** unit` — `value` is an integer and `unit` is
 * the power of ten to apply, so 74250 with unit -3 is 74.25 kg.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
 */
export interface Measure {
  /** Value in SI units, to be scaled by `unit`. */
  value: number;
  /** Measurement type; see `MeasurementType`. */
  type: number;
  /** Power of ten to multiply `value` by to get the real figure. */
  unit: number;
  /** The device position during the measurement. */
  position?: number;
  /** @deprecated */
  algo?: number;
  /** @deprecated */
  fm?: number;
  /** Not part of the published API specification, but present in responses. */
  apppfmid?: number;
  /** Not part of the published API specification, but present in responses. */
  appliver?: number;
}
