import { encodeQueryParams, formatYmd } from "../util";
import { ConfirmUser } from "./models/ConfirmUser";
import { GetActivity } from "./models/GetActivity";
import { GetIntradayActivity } from "./models/GetIntradayActivity";
import { GetMeasurements } from "./models/GetMeasurements";
import { GetWorkouts } from "./models/GetWorkouts";
import { GetActivityRequest } from "./types/http/requests/GetActivityRequest";
import { GetIntradayActivityRequest } from "./types/http/requests/GetIntradayActivityRequest";
import { ConfirmUserRequest } from "./types/http/requests/ConfirmUserRequest";
import { GetMeasurementRequest } from "./types/http/requests/GetMeasurementRequest";
import { GetWorkoutsRequest } from "./types/http/requests/GetWorkoutsRequest";
import { GetMeasurementOptions } from "./types/GetMeasurementOptions";
import { GetActivityOptions } from "./types/GetActivityOptions";

import { WithingsHttpClient } from "../http/WithingsHttpClient";
import { GetConfirmUserOptions } from "./types/GetConfirmUserOptions";

/**
 * The Withings Measure services, reachable as `client.measures`.
 *
 * Covers both the v1 `/measure` endpoint and the v2 `/v2/measure` endpoints.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure
 */
export class Measures {
  private static API_URL = "/measure";
  private static APIv2_URL = "/v2/measure";

  constructor(private readonly httpClient: WithingsHttpClient) {}

  /**
   * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-confirmuser
   */
  public async confirmUser(options: GetConfirmUserOptions) {
    const params: ConfirmUserRequest = {
      action: "confirmuser",
      ...options,
    };
    const queryString = encodeQueryParams(params);
    return this.httpClient.get<ConfirmUser>(`${Measures.APIv2_URL}?${queryString}`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  }

  /**
   * Provides daily aggregated activity data of a user.
   * @see https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
   */
  public async getActivity(options: GetActivityOptions) {
    // The GetActivityOptions union makes the two forms mutually exclusive, so
    // only one of these pairs is ever populated.
    let startdateymd: string | undefined;
    let enddateymd: string | undefined;
    let lastupdate: number | undefined;

    if (options.startDate !== undefined && options.endDate !== undefined) {
      // The API expects these as YYYYMMDD rather than a timestamp.
      startdateymd = formatYmd(options.startDate);
      enddateymd = formatYmd(options.endDate);
    } else {
      // new Date(0) is meaningful: it asks for everything Withings still holds.
      lastupdate = Math.floor(options.lastUpdate.getTime() / 1000);
    }

    const params: GetActivityRequest = {
      action: "getactivity",
      startdateymd,
      enddateymd,
      lastupdate,
      offset: options.offset ?? undefined,
      data_fields: options.data_fields?.join(",") ?? undefined,
    };

    const queryString = encodeQueryParams(params);
    return this.httpClient.get<GetActivity>(`${Measures.APIv2_URL}?${queryString}`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  }

  /**
   * Returns workout summaries, which are an aggregation all data that was captured during that workout.
   * Use the Measure v2 - getIntradayActivity service to get the high frequency data used to build this summary.
   * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getworkouts
   */
  public async getWorkouts() {
    const params: GetWorkoutsRequest = {
      action: "getworkouts",
      enddateymd: formatYmd(new Date()),
      lastupdate: Math.floor(new Date().getTime() / 1000),
      startdateymd: formatYmd(new Date(new Date().setDate(new Date().getDate() - 7))),
    };
    const queryString = encodeQueryParams(params);
    return this.httpClient.get<GetWorkouts>(`${Measures.APIv2_URL}?${queryString}`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  }
  /**
   * Returns user activity data captured at high frequency.
   * Notes:
   * If your input startdate and enddate are separated by more than 24h, only the first 24h after startdate will be returned.
   * If no startdate and enddate are passed as parameters, the most recent activity data will be returned.
   * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getintradayactivity
   */
  public async getIntradayActivity() {
    const params: GetIntradayActivityRequest = {
      action: "getintradayactivity",
    };
    const queryString = encodeQueryParams(params);
    return this.httpClient.get<GetIntradayActivity>(`${Measures.APIv2_URL}?${queryString}`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  }

  /**
   * Provides measures stored at a specific date among the types below.
   *
   * @see: https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
   * @param options
   * @returns
   */
  public async getMeasurement(options: GetMeasurementOptions = {} as GetMeasurementOptions) {
    const startdateUnix = options.startdate !== undefined ? Math.floor(options.startdate.getTime() / 1000) : undefined;
    const enddateUnix = options.enddate !== undefined ? Math.floor(options.enddate.getTime() / 1000) : undefined;
    const lastupdateUnix =
      options.lastupdate !== undefined ? Math.floor(options.lastupdate.getTime() / 1000) : undefined;

    const params: GetMeasurementRequest = {
      action: "getmeas",
      meastype: options.meastype ?? undefined,
      meastypes: options.meastypes?.join(",") ?? undefined,
      category: options.category ?? undefined,
      startdate: startdateUnix,
      enddate: enddateUnix,
      lastupdate: lastupdateUnix,
      offset: options.offset ?? undefined,
    };
    const queryString = encodeQueryParams(params);

    return this.httpClient.get<GetMeasurements>(`${Measures.API_URL}?${queryString}`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  }
}
