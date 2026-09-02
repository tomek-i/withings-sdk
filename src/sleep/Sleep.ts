import { WithingsHttpClient } from "../http/WithingsHttpClient";
import { WithingsService } from "../http/WithingsService";
import { paginate } from "../pagination/paginate";
import { resolveDateSelection, toUnixSeconds } from "../util";
import { GetSleep } from "./models/GetSleep";
import { GetSleepSummary } from "./models/GetSleepSummary";
import { GetSleepOptions } from "./types/GetSleepOptions";
import { GetSleepSummaryOptions } from "./types/GetSleepSummaryOptions";
import { GetSleepRequest } from "./types/http/requests/GetSleepRequest";
import { GetSleepSummaryRequest } from "./types/http/requests/GetSleepSummaryRequest";

/**
 * The Withings Sleep services, reachable as `client.sleep`.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep
 */
export class Sleep extends WithingsService {
  private static readonly API_URL = "/v2/sleep";

  constructor(httpClient: WithingsHttpClient) {
    super(httpClient, Sleep.API_URL);
  }

  /**
   * Returns high frequency sleep data: the sleep states across a period, plus
   * any heart rate, respiration or movement metrics that were requested.
   *
   * A single call covers at most 7 days. Use several calls for a wider range.
   *
   * @param options The period to read and the metrics to include.
   * @returns The sleep states and requested metrics.
   * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-get
   */
  public async get(options: GetSleepOptions) {
    const params: GetSleepRequest = {
      action: "get",
      startdate: toUnixSeconds(options.startdate),
      enddate: toUnixSeconds(options.enddate),
      data_fields: options.data_fields?.join(",") ?? undefined,
      meastypes: options.meastypes?.join(",") ?? undefined,
    };

    return this.request<GetSleep>(params);
  }

  /**
   * Returns night-level sleep summaries.
   *
   * @param options Either a date range or a `lastUpdate` watermark, plus the
   *   metrics to include.
   * @returns One summary per night in the requested range.
   * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-getsummary
   */
  public async getSummary(options: GetSleepSummaryOptions) {
    const params: GetSleepSummaryRequest = {
      action: "getsummary",
      ...resolveDateSelection(options),
      offset: options.offset ?? undefined,
      data_fields: options.data_fields?.join(",") ?? undefined,
    };

    return this.request<GetSleepSummary>(params);
  }

  /**
   * Walks {@link getSummary} one page at a time.
   *
   * Any `offset` on `options` is ignored: the walk manages it.
   *
   * @param options The same options {@link getSummary} accepts.
   * @returns An async iterator over the response bodies, one per page.
   */
  public getSummaryPages(options: GetSleepSummaryOptions) {
    return paginate((offset) => this.getSummary({ ...options, offset }));
  }
}
