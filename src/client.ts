import { Auth } from "./auth/Auth";
import { HttpClient } from "./http";
import { WithingsHttpClient } from "./http/WithingsHttpClient";
import { Measures } from "./measure/Measures";
import { Notify } from "./notify/Notify";
import { Sleep } from "./sleep/Sleep";
import { WithingsConfig } from "./types";

/**
 * The WithingsClient class provides methods for interacting with the Withings API.
 */
export class WithingsClient {
  private static readonly API_BASE_URL = "https://wbsapi.withings.net";

  private readonly httpClient: WithingsHttpClient;

  public readonly auth: Auth;
  public readonly measures: Measures;
  public readonly sleep: Sleep;
  public readonly notify: Notify;

  /**
   * Constructs a new instance of the WithingsClient class.
   *
   * @param config The configuration object containing the clientId, clientSecret, and redirectUri.
   * @throws {Error} If any of the required properties are missing from the config object.
   */
  constructor(private readonly config: WithingsConfig) {
    if (!config.clientId) {
      throw new Error("clientId is required");
    }
    if (!config.clientSecret) {
      throw new Error("clientSecret is required");
    }
    if (!config.redirectUri) {
      throw new Error("redirectUri is required");
    }

    const client = new HttpClient(WithingsClient.API_BASE_URL);

    this.auth = new Auth(this.config, client);

    // Both callbacks are arrow functions so `this` stays bound to the client,
    // and the token is read lazily on every request rather than snapshotted at
    // construction time (when it is usually still null).
    this.httpClient = new WithingsHttpClient(
      client,
      () => this.auth.getCurrentAccessToken(),
      async () => {
        await this.auth.refreshAccessToken();
      },
      config.retry
    );

    this.measures = new Measures(this.httpClient);
    this.sleep = new Sleep(this.httpClient);
    this.notify = new Notify(this.httpClient);
  }
}
