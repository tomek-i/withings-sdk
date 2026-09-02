import { paginate } from "../pagination/paginate";
import { resolveDateSelection, toUnixSeconds } from "../util";
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
import { WithingsService } from "../http/WithingsService";
import { GetConfirmUserOptions } from "./types/GetConfirmUserOptions";

/**
 * The Withings Measure services, reachable as `client.measures`.
 *
 * Covers both the v1 `/measure` endpoint and the v2 `/v2/measure` endpoints.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure
 */
export class Measures extends WithingsService {
  private static API_URL = "/measure";
  private static APIv2_URL = "/v2/measure";

  constructor(httpClient: WithingsHttpClient) {
    super(httpClient, Measures.APIv2_URL);
  }

  /**
   * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-confirmuser
   */
  public async confirmUser(options: GetConfirmUserOptions) {
    const params: ConfirmUserRequest = {
      action: "confirmuser",
      ...options,
    };
    return this.request<ConfirmUser>(params);
  }

  /**
   * Provides daily aggregated activity data of a user.
   * @see https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
   */
  public async getActivity(options: GetActivityOptions) {
    const params: GetActivityRequest = {
      action: "getactivity",
      ...resolveDateSelection(options),
      offset: options.offset ?? undefined,
      data_fields: options.data_fields?.join(",") ?? undefined,
    };

    return this.request<GetActivity>(params);
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
    // Sending a range and a watermark together, as this method once did,
    // produces a request the API documents as invalid.
    const params: GetWorkoutsRequest = {
      action: "getworkouts",
      ...resolveDateSelection(options),
      offset: options.offset ?? undefined,
      data_fields: options.data_fields?.join(",") ?? undefined,
    };
    return this.request<GetWorkouts>(params);
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
      startdate: options.startdate !== undefined ? toUnixSeconds(options.startdate) : undefined,
      enddate: options.enddate !== undefined ? toUnixSeconds(options.enddate) : undefined,
      data_fields: options.data_fields?.join(",") ?? undefined,
    };
    return this.request<GetIntradayActivity>(params);
  }

  /**
   * Provides measures stored at a specific date among the types below.
   *
   * @see: https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
   * @param options
   * @returns
   */
  public async getMeasurement(options: GetMeasurementOptions = {} as GetMeasurementOptions) {
    const startdateUnix = options.startdate !== undefined ? toUnixSeconds(options.startdate) : undefined;
    const enddateUnix = options.enddate !== undefined ? toUnixSeconds(options.enddate) : undefined;
    const lastupdateUnix = options.lastupdate !== undefined ? toUnixSeconds(options.lastupdate) : undefined;

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
    // getmeas is the one v1 endpoint, so it overrides the service path.
    return this.request<GetMeasurements>(params, Measures.API_URL);
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
