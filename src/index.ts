export { WithingsClient } from "./client";

export * from "./auth";
export * from "./errors";
export * from "./heart";
export * from "./measure";
export * from "./notify";
export * from "./pagination";
export * from "./plans";
export * from "./sleep";
export * from "./types";

// Useful for interpreting the `status` field the Withings API returns.
export { WithingsResponseStatus } from "./util";

// Exported so consumers can build their own clients / mock the transport.
export type { IHttpClient } from "./http/HttpClient";
export { HttpClient } from "./http/HttpClient";
export { WithingsHttpClient } from "./http/WithingsHttpClient";
export * from "./http/retry";
