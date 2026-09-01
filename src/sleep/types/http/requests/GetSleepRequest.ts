import { WithingsRequest } from "../../../../types";
import { GetSleepParams } from "../params/GetSleepParams";

/**
 * Full wire request for the sleep `get` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-get
 */
export interface GetSleepRequest extends WithingsRequest, GetSleepParams {
  /** Pins the action this request performs. */
  action: "get";
}
