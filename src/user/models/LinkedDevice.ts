import { BatteryLevel } from "../enums/BatteryLevel";
import { DeviceType } from "../enums/DeviceType";

/**
 * A device as reported when linking, which includes the serial number and the
 * MAC address that {@link Device} does not carry.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-link
 */
export interface LinkedDevice {
  /** MAC address of the device. */
  mac_address?: string;
  /** The kind of device. */
  type?: DeviceType | string;
  /** Name of the device model. */
  model?: string | null;
  /** Numeric identifier of the device model. */
  model_id?: number | null;
  /** Battery band: high, medium or low. */
  battery?: BatteryLevel | string;
  /** Identifier of the device, as used across the other services. */
  deviceid?: string | null;
  /** IANA timezone the device is set to. */
  timezone?: string;
  /** Last server connection, as a unix timestamp in seconds. */
  last_session_date?: number | null;
  /** Serial number of the device. */
  serial_number?: string | null;
}

/**
 * Body of a user `link` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-link
 */
export interface LinkDevices {
  /** The devices that were linked. */
  devices: LinkedDevice[];
}

/**
 * Body of a user `activate` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-activate
 */
export interface ActivateUser {
  /** The created user. */
  user: {
    /**
     * Authorization code for the new user. Exchange it with
     * `auth.fetchAccessToken()` to obtain tokens.
     */
    code?: string;
    /** The identifier the partner supplied for this user. */
    external_id?: string;
  };
  /** The devices linked during activation. */
  devices?: LinkedDevice[];
}
