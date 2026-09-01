import { WithingsRequest } from "../../../../types";
import { GetMeasurementParams } from "../params/GetMeasurementParams";

/**
 * Provides measures stored at a specific date among the types below. Please refer to the following responses for details.
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
 */

export interface GetMeasurementRequest extends WithingsRequest, GetMeasurementParams {
  action: "getmeas";
}
