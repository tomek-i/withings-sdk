/**
 * Wire parameters for the `getworkouts` action.
 *
 * `startdateymd` + `enddateymd` and `lastupdate` are mutually exclusive, so all
 * three are optional here. The caller-facing `GetWorkoutsOptions` union is what
 * enforces that exactly one of the two forms is supplied.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getworkouts
 */
export interface GetWorkoutsParams {
  /**
   * Start date.
   * IMPORTANT: DO NOT USE WITH FOLLOWING PARAMS: [lastupdate]
   */
  startdateymd?: string;
  /**
   * End date.
   * IMPORTANT: DO NOT USE WITH FOLLOWING PARAMS: [lastupdate]
   */
  enddateymd?: string;
  /**
   * Timestamp for requesting data that were updated or created after this date.
   * Useful for data synchronization between systems.
   * Use this instead of startdateymd + enddateymd.
   * IMPORTANT: DO NOT USE WITH FOLLOWING PARAMS: [startdateymd, enddateymd]
   */
  lastupdate?: number;

  /**
   * When a first call returns more:true and offset:XX, set value XX in this parameter to retrieve next available rows.
   */
  //TODO: should extract offset into something paginated interface
  offset?: number;

  /**
   * List of requested data fields, separated by a comma.
   * Available data fields are listed below.
   * @example data_fields=calories,intensity,manual_distance
   */
  data_fields?: string;
}
