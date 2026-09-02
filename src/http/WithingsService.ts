import { encodeQueryParams } from "../util";
import { WithingsHttpClient } from "./WithingsHttpClient";

/**
 * Shared behaviour for the service classes hanging off {@link WithingsClient}.
 *
 * Every Withings service is reached the same way: encode the parameters into a
 * query string, send them to the service path, and let the transport attach
 * the token and handle retries. This holds that one copy of that so a new
 * service only has to describe its endpoints.
 */
export abstract class WithingsService {
  /**
   * @param httpClient The transport, already configured with authentication.
   * @param basePath The service path, for example `/v2/measure`.
   */
  protected constructor(
    protected readonly httpClient: WithingsHttpClient,
    private readonly basePath: string
  ) {}

  /**
   * Sends a request to this service.
   *
   * @param params The request parameters, including the action. Undefined
   *   values are dropped rather than sent empty.
   * @param path Overrides the service path, for the few services that span
   *   more than one, such as measure with `/measure` and `/v2/measure`.
   * @returns The decoded response body.
   */
  protected request<T>(params: object, path: string = this.basePath) {
    const queryString = encodeQueryParams(params);

    return this.httpClient.get<T>(`${path}?${queryString}`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  }

  /**
   * Sends a request that authorizes by signature rather than a bearer token.
   *
   * The signature parameters belong in `params`, produced by
   * `auth.signedParams()`. No access token is required or attached.
   *
   * @param params The request parameters, including the signature set.
   * @param path Overrides the service path.
   * @returns The decoded response body.
   */
  protected requestSigned<T>(params: object, path: string = this.basePath) {
    const queryString = encodeQueryParams(params);

    return this.httpClient.getSigned<T>(`${path}?${queryString}`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  }
}
