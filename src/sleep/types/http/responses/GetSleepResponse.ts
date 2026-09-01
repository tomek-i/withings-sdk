import { WithingsResponse } from "../../../../types";
import { GetSleep } from "../../../models/GetSleep";

/**
 * Response to the sleep `get` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-get
 */
export interface GetSleepResponse extends WithingsResponse<GetSleep> {}
