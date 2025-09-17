import { Auth } from "./auth/Auth";
import { HttpClient } from "./http";
import { WithingsHttpClient } from "./http/WithingsHttpClient";
import { Measures } from "./measure/Measures";
import { WithingsConfig } from "./types";

/**
 * The WithingsClient class provides methods for interacting with the Withings API.
 */
export class WithingsClient {
  private static readonly API_BASE_URL = "https://wbsapi.withings.net";

  private readonly httpClient: WithingsHttpClient;

  public readonly auth: Auth;
  public readonly measures: Measures;

  /**
   * Constructs a new instance of the WithingsClient class.
   *
   * @param {WithingsConfig} config - The configuration object containing the clientId, clientSecret, and redirectUri.
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

    this.httpClient = new WithingsHttpClient(
      client,
      String(this.auth.getCurrentAccessToken()),
      this.refreshAccessToken
    );

    this.measures = new Measures(this.httpClient);
  }

  private async refreshAccessToken() {
    await this.auth.refreshAccessToken();
    this.httpClient.setAccessToken(String(this.auth.getCurrentAccessToken()));
  }
}
