import { WithingsResponse } from "../../../../types";
import { ListHeart } from "../../../models/ListHeart";

/**
 * Response to the heart `list` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/heart/operation/heartv2-list
 */
export interface ListHeartResponse extends WithingsResponse<ListHeart> {}
