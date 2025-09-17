//TODO: create union type to avoid using startdateymd + enddateymd with lastupdate
export interface GetActivityParams {
  /**
   * Start date.
   * IMPORTANT: DO NOT USE WITH FOLLOWING PARAMS: [lastupdate]
   */
  startdateymd: string;
  /**
   * End date.
   * IMPORTANT: DO NOT USE WITH FOLLOWING PARAMS: [lastupdate]
   */
  enddateymd: string;
  /**
   * Timestamp for requesting data that were updated or created after this date.
   * Useful for data synchronization between systems.
   * Use this instead of startdateymd + enddateymd.
   * IMPORTANT: DO NOT USE WITH FOLLOWING PARAMS: [startdateymd, enddateymd]
   */
  lastupdate: number;

  /**
   * When a first call returns more:true and offset:XX, set value XX in this parameter to retrieve next available rows.
   */
  //TODO: should extract offset into something paginated interface
  offset?: number;

  /**
   * List of requested data fields, separated by a comma.
   * Available data fields are listed below.
   * @example  data_fields=steps,distance,elevation
   * @description
   * steps
   * > Number of steps.
   *
   * distance
   * > Distance travelled (in meters).
   *
   * elevation
   * > Number of floors climbed.
   *
   * soft
   * > Duration of soft activities (in seconds).
   *
   * moderate
   * > Duration of moderate activities (in seconds).
   *
   * intense
   * > Duration of intense activities (in seconds).
   *
   * active
   * > Sum of intense and moderate activity durations (in seconds).
   *
   * calories
   * > Active calories burned (in Kcal). Calculated by mixing fine granularity calories estimation, workouts estimated calories and calories manually set by the user.
   *
   * totalcalories
   * > Total calories burned (in Kcal). Obtained by adding active calories (see calories) and passive calories.
   *
   * hr_average
   * > Average heart rate.
   *
   * hr_min
   * > Minimal heart rate.
   *
   * hr_max
   * > Maximal heart rate.
   *
   * hr_zone_0
   * > Duration in seconds when heart rate was in a light zone (cf. Glossary).
   *
   * hr_zone_1
   * > Duration in seconds when heart rate was in a moderate zone (cf. Glossary).
   *
   * hr_zone_2
   * > Duration in seconds when heart rate was in an intense zone (cf. Glossary).
   *
   * hr_zone_3
   * > Duration in seconds when heart rate was in maximal zone (cf. Glossary).
   */
  data_fields?: string;
}
