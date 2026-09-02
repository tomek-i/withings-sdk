import { BatteryLevel } from "../enums/BatteryLevel";
import { DeviceType } from "../enums/DeviceType";

/**
 * A device linked to the user's account.
 *
 * Several fields are only returned to advanced partners, and are absent
 * otherwise. They are optional here rather than missing, so the type does not
 * change with your plan.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-getdevice
 */
export interface Device {
  /** The kind of device. */
  type?: DeviceType | string;
  /** Name of the device model, e.g. `Body+`. */
  model?: string | null;
  /** Numeric identifier of the device model. */
  model_id?: number | null;
  /** Battery band: high, medium or low. */
  battery?: BatteryLevel | string;
  /** Identifier of the device, as used across the other services. */
  deviceid?: string | null;
  /** Hashed device identifier, returned instead of `deviceid` for some apps. */
  hash_deviceid?: string | null;
  /** IANA timezone the device is set to. */
  timezone?: string;
  /** First server connection, as a unix timestamp in seconds. */
  first_session_date?: number | null;
  /** Last server connection, as a unix timestamp in seconds. Useful for spotting a device that has stopped syncing. */
  last_session_date?: number | null;
  /** MAC address. Advanced partners only. */
  mac_address?: string | null;
  /** Firmware version. Advanced partners only. */
  fw?: string | null;
  /** Network the device uses. Advanced partners only. */
  network?: string | null;
  /** Last network the device used. Advanced partners only. */
  last_used_network?: string | null;
  /** SIM status, for cellular devices. */
  sim_status?: string | null;
}
