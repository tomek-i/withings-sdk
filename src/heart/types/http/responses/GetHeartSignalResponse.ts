import { WithingsResponse } from "../../../../types";
import { GetHeartSignal } from "../../../models/GetHeartSignal";

/**
 * Response to the heart `get` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/heart/operation/heartv2-get
 */
export interface GetHeartSignalResponse extends WithingsResponse<GetHeartSignal> {}
