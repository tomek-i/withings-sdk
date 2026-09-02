/**
 * Coarse battery level of a device.
 *
 * Withings reports a band rather than a percentage.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-getdevice
 */
export enum BatteryLevel {
  /** Above 75%. */
  High = "high",
  /** Above 30%. */
  Medium = "medium",
  /** At or below 30%. */
  Low = "low",
}
