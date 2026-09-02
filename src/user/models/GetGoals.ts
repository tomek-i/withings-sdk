/**
 * A goal expressed as a scaled measurement.
 *
 * The real figure is `value * 10 ** unit`, the same convention `getmeas` uses.
 */
export interface ScaledGoal {
  /** Value in SI units, to be scaled by `unit`. */
  value?: number;
  /** Power of ten to multiply `value` by to get the real figure. */
  unit?: number;
}

/** The goals a user has set for themselves. */
export interface Goals {
  /** Target steps per day. */
  steps?: number;
  /** Target sleep duration, in seconds. */
  sleep?: number;
  /** Target weight. Scaled: `value * 10 ** unit` kilograms. */
  weight?: ScaledGoal;
}

/**
 * Body of a `getgoals` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-getgoals
 */
export interface GetGoals {
  /** The user's goals. Absent entries mean no goal was set. */
  goals: Goals;
}
