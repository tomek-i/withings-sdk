import { WithingsHttpClient } from "../http/WithingsHttpClient";
import { WithingsService } from "../http/WithingsService";
import { GetDevice } from "./models/GetDevice";
import { GetGoals } from "./models/GetGoals";
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
}
