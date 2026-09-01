import { paginate } from "../pagination/paginate";
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
import { GetIntradayActivityOptions } from "./types/GetIntradayActivityOptions";
import { GetWorkoutsOptions } from "./types/GetWorkoutsOptions";

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
   *
   * @param options Either a date range or a `lastUpdate` watermark, plus the
   *   metrics to include.
   * @returns The workouts in the requested period.
   * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getworkouts
   */
  public async getWorkouts(options: GetWorkoutsOptions) {
    // The GetWorkoutsOptions union makes the two forms mutually exclusive, so
    // only one of these pairs is ever populated. Sending both, as this method
    // used to, produces a request the API documents as invalid.
    let startdateymd: string | undefined;
    let enddateymd: string | undefined;
    let lastupdate: number | undefined;

    if (options.startDate !== undefined && options.endDate !== undefined) {
      startdateymd = formatYmd(options.startDate);
      enddateymd = formatYmd(options.endDate);
    } else {
      // new Date(0) is meaningful: it asks for everything Withings still holds.
      lastupdate = Math.floor(options.lastUpdate.getTime() / 1000);
    }

    const params: GetWorkoutsRequest = {
      action: "getworkouts",
      startdateymd,
      enddateymd,
      lastupdate,
      offset: options.offset ?? undefined,
      data_fields: options.data_fields?.join(",") ?? undefined,
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
   *
   * @param options The period to read and the metrics to include. The response
   *   carries no measurements unless `data_fields` names them.
   * @returns The activity slices, keyed by unix timestamp.
   * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getintradayactivity
   */
  public async getIntradayActivity(options: GetIntradayActivityOptions = {}) {
    const params: GetIntradayActivityRequest = {
      action: "getintradayactivity",
      startdate: options.startdate !== undefined ? Math.floor(options.startdate.getTime() / 1000) : undefined,
      enddate: options.enddate !== undefined ? Math.floor(options.enddate.getTime() / 1000) : undefined,
      data_fields: options.data_fields?.join(",") ?? undefined,
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

  /**
   * Walks {@link getMeasurement} one page at a time.
   *
   * The API caps how many rows a single call returns; this follows the
   * `offset` it hands back until there are none left. Pages are fetched
   * lazily, so nothing is requested until the iterator is advanced.
   *
   * ```typescript
   * for await (const page of client.measures.getMeasurementPages(options)) {
   *   for (const group of page.measuregrps) {
   *     // ...
   *   }
   * }
   * ```
   *
   * Any `offset` on `options` is ignored: the walk manages it.
   *
   * @param options The same options {@link getMeasurement} accepts.
   * @returns An async iterator over the response bodies, one per page.
   */
  public getMeasurementPages(options: GetMeasurementOptions = {} as GetMeasurementOptions) {
    return paginate((offset) => this.getMeasurement({ ...options, offset }));
  }

  /**
   * Walks {@link getWorkouts} one page at a time.
   *
   * Any `offset` on `options` is ignored: the walk manages it.
   *
   * @param options The same options {@link getWorkouts} accepts.
   * @returns An async iterator over the response bodies, one per page.
   */
  public getWorkoutsPages(options: GetWorkoutsOptions) {
    return paginate((offset) => this.getWorkouts({ ...options, offset }));
  }

  /**
   * Walks {@link getActivity} one page at a time.
   *
   * Any `offset` on `options` is ignored: the walk manages it.
   *
   * @param options The same options {@link getActivity} accepts.
   * @returns An async iterator over the response bodies, one per page.
   */
  public getActivityPages(options: GetActivityOptions) {
    return paginate((offset) => this.getActivity({ ...options, offset }));
  }
}
