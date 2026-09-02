import { WithingsRequest } from "../../../../types";
import { HeartParams } from "../params/HeartParams";

/**
 * Full wire request for the heart `list` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/heart/operation/heartv2-list
 */
export interface ListHeartRequest extends WithingsRequest, HeartParams {
  /** Pins the action this request performs. */
  action: "list";
}
