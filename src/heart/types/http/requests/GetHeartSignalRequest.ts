import { WithingsRequest } from "../../../../types";
import { HeartParams } from "../params/HeartParams";

/**
 * Full wire request for the heart `get` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/heart/operation/heartv2-get
 */
export interface GetHeartSignalRequest extends WithingsRequest, HeartParams {
  /** Pins the action this request performs. */
  action: "get";
}
