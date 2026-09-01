import { PaginatedBody } from "../../pagination/paginate";
import { MeasureGroup } from "./MeasureGroup";

/**
 * Body of a `getmeas` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
 */
export interface GetMeasurements extends PaginatedBody {
  /**
   * Server time at which the answer was generated.
   *
   * Typed as a union deliberately. The published specification declares a
   * string; the live API returns a unix timestamp as a number. The union keeps
   * both safe. Narrow with `Number(updatetime)` before doing arithmetic.
   */
  updatetime: string | number;
  /** IANA timezone the measurements were recorded in. */
  timezone: string;
  /** Measurements, grouped by the moment they were taken. */
  measuregrps: MeasureGroup[];
}
