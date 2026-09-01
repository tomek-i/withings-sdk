import { encodeQueryParams, formatYmd } from "../util";
import { GetActivityRequest } from "./types/http/requests/GetActivityRequest";
import { GetIntradayActivityRequest } from "./types/http/requests/GetIntradayActivityRequest";
import { ConfirmUserRequest } from "./types/http/requests/ConfirmUserRequest";
import { GetMeasurementRequest } from "./types/http/requests/GetMeasurementRequest";
import { GetWorkoutsRequest } from "./types/http/requests/GetWorkoutsRequest";
import { GetMeasurementOptions } from "./types/GetMeasurementOptions";
import { GetActivityOptions } from "./types/GetActivityOptions";

import { WithingsHttpClient } from "../http/WithingsHttpClient";
import { GetConfirmUserOptions } from "./types/GetConfirmUserOptions";

//TODO should inherit from an abstract http client class or pass
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
    return this.httpClient.get(`${Measures.APIv2_URL}?${queryString}`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  }

  /**
   * Provides daily aggregated activity data of a user.
   * @see https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
   */
  public async getActivity(options: GetActivityOptions) {
    //TODO: there needs to be a better way for mutually exclusive properties
    //TODO: throw some bad request error if both startdate and enddate are set and lastupdate is also set
    let startdateymd: string = undefined!,
      enddateymd: string = undefined!,
      lastupdate: number = undefined!;

    if (options.startDate && options.endDate) {
      //the format is ymd
      startdateymd = formatYmd(options.startDate);
      enddateymd = formatYmd(options.endDate);
    } else {
      lastupdate = (options.lastUpdate as any) === 0 ? 0 : options.lastUpdate.getTime() / 1000;
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
    return this.httpClient.get(`${Measures.APIv2_URL}?${queryString}`, {
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
    return this.httpClient.get(`${Measures.APIv2_URL}?${queryString}`, {
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
    return this.httpClient.get(`${Measures.APIv2_URL}?${queryString}`, {
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

    return this.httpClient.get(`${Measures.API_URL}?${queryString}`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  }
}
