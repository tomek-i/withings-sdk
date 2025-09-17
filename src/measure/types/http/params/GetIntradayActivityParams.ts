/**
 *
 */
export interface GetIntradayActivityParams {
  /**
   * Data start date as a unix timestamp.
   */
  startdate?: number;
  /**
   * Data end date as a unix timestamp.
   */
  enddate?: number;
  /**
   *
   * List of requested data fields, separated by a comma.
   * Available data fields are listed below.
   * @example data_fields=steps,elevation,calories
  
   */
  data_fields?: string;
}
