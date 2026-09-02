import { SignedParams } from "../../types";
import { UnitPreferences } from "../models/UserProfile";

/**
 * Options for {@link User.get}.
 *
 * Identify the user by email or by id. This service authorizes by signature,
 * so spread `auth.signedParams("get")` in as well.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-get
 */
export type GetUserOptions = SignedParams & ({ email: string; userid?: never } | { userid: string; email?: never });

/**
 * Options for {@link User.link}.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-link
 */
export interface LinkDevicesOptions {
  /** MAC addresses of the devices to link to the authorized user. */
  mac_addresses: string[];
}

/**
 * Options for {@link User.unlink}.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-unlink
 */
export interface UnlinkDeviceOptions {
  /** MAC address of the device to unlink. */
  mac_address: string;
}

/** Step, sleep and weight goals to set on a new user. */
export interface UserGoals {
  /** Target steps per day. */
  steps?: number;
  /** Target sleep duration, in seconds. */
  sleep?: number;
  /** Target weight, in kilograms. */
  weight?: number;
}

/** Initial measurements for a new user, in kilograms and meters. */
export interface UserMeasures {
  /** Height, in meters, whatever the unit preference says. */
  height?: number;
  /** Weight, in kilograms, whatever the unit preference says. */
  weight?: number;
}

/**
 * Options for {@link User.activate}.
 *
 * Creates a Withings account on the user's behalf and links devices to it.
 * This is a partner service: it authorizes by signature, so spread
 * `auth.signedParams("activate")` in.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-activate
 */
export interface ActivateUserOptions extends SignedParams {
  /** Email address for the new account. */
  email: string;
  /** Three characters representing the user, for example `Rob`. */
  shortname: string;
  /** Your own identifier for this user. */
  external_id: string;
  /** 0 for man, 1 for woman. */
  gender: number;
  /** Date of birth. */
  birthdate: Date;
  /** IANA timezone, for example `Europe/Paris`. */
  timezone: string;
  /** Language preference, for example `en_US`. */
  preflang: string;
  /** Whether the user accepted marketing communication. */
  mailingpref: boolean;
  /**
   * Initial measurements, in kilograms and meters. These stay metric even when
   * `unit_pref` asks for other display units.
   */
  measures: UserMeasures;
  /** Display unit preferences. */
  unit_pref: UnitPreferences;
  /** MAC addresses of the devices to link to the new account. */
  mac_addresses: string[];
  /** First name. Defaults to `shortname`. */
  firstname?: string;
  /** Last name. Defaults to `shortname`. */
  lastname?: string;
  /** Phone number in E.164 format. The user receives a verification code. */
  phonenumber?: string;
  /** Recovery code, usable as a second authentication factor. */
  recovery_code?: string;
  /** Initial goals. */
  goals?: UserGoals;
  /** Where to redirect the user after they authorize. */
  redirect_uri?: string;
}

/**
 * Options for {@link User.addToRpm}.
 *
 * A Remote Patient Monitoring service, available to healthcare partners. It
 * authorizes by signature.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-addtorpm
 */
export interface AddToRpmOptions extends SignedParams {
  /** The user to enrol. */
  userid: string;
  /** The RPM programme to enrol them in. */
  programid: number;
  /** Whether to onboard the user by SMS. */
  sms_onboarding?: boolean;
  /** Whether assisted onboarding is offered. */
  assistance_onboarding?: boolean;
  /** ICD code identifiers for the user. */
  icdcodeids?: number[];
  /** Your own identifiers for the user. */
  external_ids?: string[];
  /** Department the user belongs to. */
  department?: string;
  /** Category the user belongs to. */
  category?: string;
}
