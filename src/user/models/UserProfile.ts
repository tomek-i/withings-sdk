/**
 * A user's unit preferences.
 *
 * These affect how Withings displays values to the user. They do not change
 * the units the API returns, which are always kilograms and meters.
 */
export interface UnitPreferences {
  /** Preferred weight unit. */
  weight?: number;
  /** Preferred height unit. */
  height?: number;
  /** Preferred temperature unit. */
  temperature?: number;
  /** Preferred distance unit. */
  distance?: number;
}

/**
 * A user's profile.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-get
 */
export interface UserProfile {
  /** Email address. */
  email?: string;
  /** First name. */
  firstname?: string;
  /** Last name. */
  lastname?: string;
  /** Short name, three characters. */
  shortname?: string;
  /** 0 for man, 1 for woman. */
  gender?: number;
  /** Date of birth, as a unix timestamp in seconds. */
  birthdate?: number;
  /** Language preference, for example `en_US`. */
  preflang?: string;
  /** IANA timezone, for example `Europe/Paris`. */
  timezone?: string;
  /** Whether the user accepted marketing communication. */
  mailingpref?: boolean;
  /** Display unit preferences. */
  unit_pref?: UnitPreferences;
  /** Phone number, only when one is set. */
  phonenumber?: string;
}

/**
 * Body of a user `get` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-get
 */
export interface GetUser {
  /** The requested user. */
  user: UserProfile;
}
