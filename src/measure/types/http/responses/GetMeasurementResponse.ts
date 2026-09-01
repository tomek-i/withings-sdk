import { WithingsResponse } from "../../../../types";
import { GetMeasurements } from "../../../models/GetMeasurements";

/**
 * Response to the `getmeas` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
 */
export interface GetMeasurementResponse extends WithingsResponse<GetMeasurements> {}
