import { IntraDayActivityDataFields } from "../enums/IntraDayActivityDataFields";

/**
 * Options for {@link Measures.getIntradayActivity}.
 *
 * Every field is optional. With no period the API returns the most recent
 * activity data; if `startdate` and `enddate` are more than 24 hours apart,
 * only the first 24 hours after `startdate` come back.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getintradayactivity
 */
export interface GetIntradayActivityOptions {
  /** Only return data recorded at or after this moment. */
  startdate?: Date;
  /** Only return data recorded at or before this moment. */
  enddate?: Date;
  /**
   * Which metrics to return. The response carries no measurements at all
   * unless they are requested here.
   */
  data_fields?: IntraDayActivityDataFields[];
}
