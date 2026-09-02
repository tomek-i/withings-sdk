import { WithingsResponse } from "../../../../types";
import { GetDevice } from "../../../models/GetDevice";

/**
 * Response to the user `getdevice` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/user/operation/userv2-getdevice
 */
export interface GetDeviceResponse extends WithingsResponse<GetDevice> {}
