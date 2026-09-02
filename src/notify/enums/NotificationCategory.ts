/**
 * The `appli` value identifying what a notification is about.
 *
 * Each category requires the matching OAuth scope, noted below. Subscribing to
 * a category the user has not granted will not deliver anything.
 *
 * @see https://developer.withings.com/developer-guide/v3/data-api/notifications/notification-content/
 */
export enum NotificationCategory {
  /** Weight and body composition. Requires `user.metrics`. */
  Weight = 1,
  /** Temperature. Requires `user.metrics`. */
  Temperature = 2,
  /** Blood pressure and heart rate. Requires `user.metrics`. */
  BloodPressure = 4,
  /** Activity: steps, distance, workouts. Requires `user.activity`. */
  Activity = 16,
  /** Sleep summary. Requires `user.activity`. */
  SleepSummary = 44,
  /** User profile change. The payload carries an `action`. Requires `user.info`. */
  UserProfileChange = 46,
  /** Bed in. Requires `user.sleepevents`. */
  BedIn = 50,
  /** Bed out. Requires `user.sleepevents`. */
  BedOut = 51,
  /** Sleep sensor inflated. Requires `user.sleepevents`. */
  SleepSensorInflated = 52,
  /** Setup of a device not associated with an account. */
  UnassociatedDeviceSetup = 53,
  /** ECG measurement. Requires `user.metrics`. */
  Ecg = 54,
  /** ECG measurement failed. Requires `user.metrics`. */
  EcgFailed = 55,
  /** Glucose. Requires `user.metrics`. */
  Glucose = 58,
  /** Survey answered. Requires `user.data`. */
  SurveyAnswered = 60,
  /** Stethoscope. Requires `user.metrics`. */
  Stethoscope = 61,
  /** Heart rate variability. Requires `user.metrics`. */
  HeartRateVariability = 62,
  /** Bed occupied, from the ten minute poll. Requires `user.sleepevents`. */
  BedOccupied = 98,
  /** Bed empty, from the ten minute poll. Requires `user.sleepevents`. */
  BedEmpty = 99,
  /** Bed in or out, from the ten minute poll. Requires `user.sleepevents`. */
  BedInOut = 100,
}
