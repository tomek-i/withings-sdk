/**
 * The kind of device, as reported by `getdevice`.
 *
 * A string enum because the API returns these as strings, not codes.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-getdevice
 */
export enum DeviceType {
  Scale = "Scale",
  Babyphone = "Babyphone",
  BloodPressureMonitor = "Blood Pressure Monitor",
  ActivityTracker = "Activity Tracker",
  SleepMonitor = "Sleep Monitor",
  SmartConnectedThermometer = "Smart Connected Thermometer",
  Gateway = "Gateway",
  IGlucose = "iGlucose",
  HealthKitApple = "HealthKit Apple",
  HealthKitGoogle = "HealthKit Google",
  HealthKitHuawei = "HealthKit Huawei",
  Lingo = "Lingo",
}
