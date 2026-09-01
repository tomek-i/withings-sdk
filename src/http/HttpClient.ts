export interface IHttpClient {
  setBaseUrl(baseUrl: string): void;
  get<T>(endpoint: string, body: T, options?: RequestInit): Promise<Response>;
  post<T>(endpoint: string, body: T, options?: RequestInit): Promise<Response>;
  send<T>(endpoint: string, body?: T, options?: RequestInit): Promise<Response>;
}

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
   * @param {string} endpoint - The endpoint to send the request to.
   * @param {RequestInit} [options={}] - Additional options for the request.
   * @return {Promise<Response>} A Promise that resolves to the response of the GET request.
   */
  public async get<T>(endpoint: string, body: T, options: RequestInit = {}): Promise<Response> {
    return this.send(endpoint, body, { ...options, method: "GET" });
  }
  /**
   * Sends a POST request to the specified endpoint with the provided body.
   *
   * @param {string} endpoint - The endpoint to send the request to.
   * @param {any} body - The payload to include in the request.
   * @param {RequestInit} [options={}] - Additional options for the request.
   * @return {Promise<Response>} A Promise that resolves to the response of the POST request.
   */
  public async post<T>(endpoint: string, body: T, options: RequestInit = {}): Promise<Response> {
    return this.send(endpoint, body, { ...options, method: "POST" });
  }

  /**
   * Sends a request to the specified endpoint with the provided method, body, and options.
   *
   * @param {string} endpoint - The endpoint to send the request to.
   * @param {string} method - The HTTP method to use for the request.
   * @param {RequestInit} [options={}] - Additional options for the request.
   * @return {Promise<Response>} A Promise that resolves to the response of the request.
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
