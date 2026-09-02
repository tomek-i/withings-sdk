import { WithingsHttpClient } from "../http/WithingsHttpClient";
import { WithingsService } from "../http/WithingsService";
import { GetDevice } from "./models/GetDevice";
import { GetGoals } from "./models/GetGoals";
import { toUnixSeconds } from "../util";
import { ActivateUser, LinkDevices } from "./models/LinkedDevice";
import { GetUser } from "./models/UserProfile";
import {
  ActivateUserOptions,
  AddToRpmOptions,
  GetUserOptions,
  LinkDevicesOptions,
  UnlinkDeviceOptions,
} from "./types/UserOptions";
import { GetDeviceRequest } from "./types/http/requests/GetDeviceRequest";
import { GetGoalsRequest } from "./types/http/requests/GetGoalsRequest";

/**
 * The Withings User services, reachable as `client.user`.
 *
 * @see https://developer.withings.com/api-reference/#tag/user
 */
export class User extends WithingsService {
  private static readonly API_URL = "/v2/user";

  constructor(httpClient: WithingsHttpClient) {
    super(httpClient, User.API_URL);
  }

  /**
   * Lists the devices linked to the account.
   *
   * Useful for knowing which metrics to expect at all: a scale will never
   * produce sleep data, and a device whose `last_session_date` is old has
   * stopped syncing, which looks identical to "no new measurements" from the
   * measure endpoints alone.
   *
   * @returns The linked devices, with their battery level and last sync.
   * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-getdevice
   */
  public async getDevice() {
    const params: GetDeviceRequest = { action: "getdevice" };
    return this.request<GetDevice>(params);
  }

  /**
   * Reads the user's step, sleep and weight goals.
   *
   * The weight goal is scaled the same way measurements are:
   * `value * 10 ** unit` kilograms.
   *
   * @returns The goals. Absent entries mean no goal was set.
   * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-getgoals
   */
  public async getGoals() {
    const params: GetGoalsRequest = { action: "getgoals" };
    return this.request<GetGoals>(params);
  }

  /**
   * Reads a user's profile.
   *
   * This is a partner service. It authorizes by signature rather than by the
   * user's access token, and identifies the user by email or id, so it is not
   * a way to read the profile of whoever authorized this client.
   *
   * ```typescript
   * const signed = await client.auth.signedParams("get");
   * const profile = await client.user.get({ ...signed, email: "someone@example.com" });
   * ```
   *
   * @param options The signature parameters, and the email or user id.
   * @returns The user's profile.
   * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-get
   */
  public async get(options: GetUserOptions) {
    return this.requestSigned<GetUser>({
      action: "get",
      client_id: options.client_id,
      nonce: options.nonce,
      signature: options.signature,
      email: options.email ?? undefined,
      userid: options.userid ?? undefined,
    });
  }

  /**
   * Links devices to the authorized user by MAC address.
   *
   * @param options The MAC addresses to link.
   * @returns The devices that were linked.
   * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-link
   */
  public async link(options: LinkDevicesOptions) {
    return this.request<LinkDevices>({
      action: "link",
      mac_addresses: options.mac_addresses.join(","),
    });
  }

  /**
   * Unlinks a device from the authorized user.
   *
   * @param options The MAC address to unlink.
   * @returns An empty body; the outcome is in the response status.
   * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-unlink
   */
  public async unlink(options: UnlinkDeviceOptions) {
    return this.request<Record<string, never>>({
      action: "unlink",
      mac_address: options.mac_address,
    });
  }

  /**
   * Creates a Withings account on a user's behalf and links devices to it.
   *
   * A partner service, authorized by signature. The response carries an
   * authorization code: exchange it with `auth.fetchAccessToken()` to get
   * tokens for the new user.
   *
   * `measures` stays in kilograms and meters even when `unit_pref` asks for
   * other display units. The API is explicit about that, and mixing them up
   * silently records the wrong values.
   *
   * @param options The profile to create, the devices to link, and the
   *   signature parameters.
   * @returns The created user and the linked devices.
   * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-activate
   */
  public async activate(options: ActivateUserOptions) {
    return this.requestSigned<ActivateUser>({
      action: "activate",
      client_id: options.client_id,
      nonce: options.nonce,
      signature: options.signature,
      email: options.email,
      shortname: options.shortname,
      external_id: options.external_id,
      gender: options.gender,
      birthdate: toUnixSeconds(options.birthdate),
      timezone: options.timezone,
      preflang: options.preflang,
      mailingpref: options.mailingpref,
      // The API takes these as JSON encoded strings, not repeated parameters.
      measures: JSON.stringify(options.measures),
      unit_pref: JSON.stringify(options.unit_pref),
      goals: options.goals !== undefined ? JSON.stringify(options.goals) : undefined,
      mac_addresses: options.mac_addresses.join(","),
      firstname: options.firstname ?? undefined,
      lastname: options.lastname ?? undefined,
      phonenumber: options.phonenumber ?? undefined,
      recovery_code: options.recovery_code ?? undefined,
      redirect_uri: options.redirect_uri ?? undefined,
    });
  }

  /**
   * Enrols a user in a Remote Patient Monitoring programme.
   *
   * A healthcare partner service, authorized by signature.
   *
   * @param options The user, the programme, and the signature parameters.
   * @returns The enrolled user.
   * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-addtorpm
   */
  public async addToRpm(options: AddToRpmOptions) {
    return this.requestSigned<{ user?: Record<string, unknown> }>({
      action: "addtorpm",
      client_id: options.client_id,
      nonce: options.nonce,
      signature: options.signature,
      userid: options.userid,
      programid: options.programid,
      sms_onboarding: options.sms_onboarding ?? undefined,
      assistance_onboarding: options.assistance_onboarding ?? undefined,
      icdcodeids: options.icdcodeids?.join(",") ?? undefined,
      external_ids: options.external_ids?.join(",") ?? undefined,
      department: options.department ?? undefined,
      category: options.category ?? undefined,
    });
  }
}
