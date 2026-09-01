/**
 * The sleep state a {@link SleepSeriesEntry} covers.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-get
 */
export enum SleepState {
  /** Awake. */
  Awake = 0,
  /** Light sleep. */
  Light = 1,
  /** Deep sleep. */
  Deep = 2,
  /** REM sleep. */
  Rem = 3,
  /** Entered manually by the user rather than measured. */
  Manual = 4,
  /** Unspecified. */
  Unspecified = 5,
  /** Out of bed. Requires a specific plan to be enabled on the account. */
  OutOfBed = 15,
}
