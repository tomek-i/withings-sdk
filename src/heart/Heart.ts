import { WithingsHttpClient } from "../http/WithingsHttpClient";
import { WithingsService } from "../http/WithingsService";
import { paginate } from "../pagination/paginate";
import { GetHeartSignal } from "./models/GetHeartSignal";
import { ListHeart } from "./models/ListHeart";
import { GetHeartSignalOptions, ListHeartOptions } from "./types/HeartOptions";
import { GetHeartSignalRequest } from "./types/http/requests/GetHeartSignalRequest";
import { ListHeartRequest } from "./types/http/requests/ListHeartRequest";

/**
 * The Withings Heart services, reachable as `client.heart`.
 *
 * Covers ECG recordings, blood pressure readings and stethoscope data from
 * BPM Core and Move ECG devices. Note that these are Total Biomarker Pack
 * metrics, so a free plan will not return them.
 *
 * @see https://developer.withings.com/api-reference/#tag/heart
 */
export class Heart extends WithingsService {
  private static readonly API_URL = "/v2/heart";

  constructor(httpClient: WithingsHttpClient) {
    super(httpClient, Heart.API_URL);
  }

  /**
   * Lists heart recordings over a period.
   *
   * Each entry says what was recorded and carries the `signalid` needed to
   * fetch the signal itself with {@link get}. The signal is never included
   * here — it is thousands of samples per recording.
   *
   * @param options The period to read, and an offset when paging by hand.
   * @returns The recordings, most recent first.
   * @see https://developer.withings.com/api-reference/#tag/heart/operation/heartv2-list
   */
  public async list(options: ListHeartOptions = {}) {
    const params: ListHeartRequest = {
      action: "list",
      startdate: options.startdate !== undefined ? Math.floor(options.startdate.getTime() / 1000) : undefined,
      enddate: options.enddate !== undefined ? Math.floor(options.enddate.getTime() / 1000) : undefined,
      offset: options.offset ?? undefined,
    };

    return this.request<ListHeart>(params);
  }

  /**
   * Walks {@link list} one page at a time.
   *
   * Any `offset` on `options` is ignored: the walk manages it.
   *
   * @param options The same options {@link list} accepts.
   * @returns An async iterator over the response bodies, one per page.
   */
  public listPages(options: ListHeartOptions = {}) {
    return paginate((offset) => this.list({ ...options, offset }));
  }

  /**
   * Fetches a recorded signal.
   *
   * Identify it either by `signalid`, using the access token this client
   * already sends, or by `signal_token` with a signed request — spread
   * `auth.signedParams("get")` in for that.
   *
   * @param options Which signal to fetch, and how to identify it.
   * @returns The signal in microvolts, with its sampling frequency.
   * @see https://developer.withings.com/api-reference/#tag/heart/operation/heartv2-get
   */
  public async get(options: GetHeartSignalOptions) {
    const params: GetHeartSignalRequest = {
      action: "get",
      signalid: options.signalid ?? undefined,
      signal_token: options.signal_token ?? undefined,
      client_id: options.client_id ?? undefined,
      signature: options.signature ?? undefined,
      nonce: options.nonce ?? undefined,
      with_filtered: options.with_filtered ?? undefined,
      with_intervals: options.with_intervals ?? undefined,
    };

    return this.request<GetHeartSignal>(params);
  }
}
