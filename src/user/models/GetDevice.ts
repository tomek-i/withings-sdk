import { Device } from "./Device";

/**
 * Body of a `getdevice` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-getdevice
 */
export interface GetDevice {
  /** The devices linked to the account. */
  devices: Device[];
}
