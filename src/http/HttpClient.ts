/**
 * The transport the SDK sends requests through.
 *
 * Exported so it can be substituted, most usefully with a stub in tests.
 */
export interface IHttpClient {
  /** Sets the origin every relative endpoint is resolved against. */
  setBaseUrl(baseUrl: string): void;
  /** Sends a GET request. */
  get<T>(endpoint: string, body: T, options?: RequestInit): Promise<Response>;
  /** Sends a POST request. */
  post<T>(endpoint: string, body: T, options?: RequestInit): Promise<Response>;
  /** Sends a request using whichever method `options` specifies. */
  send<T>(endpoint: string, body?: T, options?: RequestInit): Promise<Response>;
}

/**
 * A thin wrapper over the global `fetch`.
 *
 * Deliberately knows nothing about Withings: it resolves endpoints against a
 * base URL, serialises the body as JSON and rejects non-2xx responses.
 * {@link WithingsHttpClient} layers authentication and retries on top.
 */
export class HttpClient implements IHttpClient {
  private baseUrl: string = "";

  constructor(baseUrl: string = "") {
    this.setBaseUrl(baseUrl);
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Sends a GET request to the specified endpoint with the provided options.
   *
   * @param endpoint The endpoint to send the request to.
   * @param options Additional options for the request.
   * @returns A Promise that resolves to the response of the GET request.
   */
  public async get<T>(endpoint: string, body: T, options: RequestInit = {}): Promise<Response> {
    return this.send(endpoint, body, { ...options, method: "GET" });
  }
  /**
   * Sends a POST request to the specified endpoint with the provided body.
   *
   * @param endpoint The endpoint to send the request to.
   * @param body The payload to include in the request.
   * @param options Additional options for the request.
   * @returns A Promise that resolves to the response of the POST request.
   */
  public async post<T>(endpoint: string, body: T, options: RequestInit = {}): Promise<Response> {
    return this.send(endpoint, body, { ...options, method: "POST" });
  }

  /**
   * Sends a request to the specified endpoint with the provided method, body, and options.
   *
   * @param endpoint The endpoint to send the request to.
   * @param method The HTTP method to use for the request.
   * @param options Additional options for the request.
   * @returns A Promise that resolves to the response of the request.
   */
  public async send<T>(endpoint: string, body: T, options: RequestInit = {}): Promise<Response> {
    const fullEndpoint = `${this.baseUrl}${endpoint}`;
    //TODO: probably can be removed or just be done with = { ... options }
    const requestOptions: RequestInit = {
      ...options,
      // method: options.method,
      headers: {
        ...options.headers,
      },
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(fullEndpoint, requestOptions);

    if (!response.ok) {
      //TODO: better error messaging
      //TODO: add logging
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }
}
