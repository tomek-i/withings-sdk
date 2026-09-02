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
export * from "./user";

// Useful for interpreting the `status` field the Withings API returns.
export { WithingsResponseStatus } from "./util";

// Exported so consumers can build their own clients / mock the transport.
export type { IHttpClient } from "./http/HttpClient";
export { HttpClient } from "./http/HttpClient";
export { WithingsHttpClient } from "./http/WithingsHttpClient";
// Only the pieces a consumer configures or receives. The backoff maths, the
// sleep helper and the duplicate-request detection are implementation details:
// exporting them would commit the package to keeping them stable.
export type { RetryAttempt, WithingsRetryOptions } from "./http/retry";
export { DEFAULT_RETRY_OPTIONS } from "./http/retry";
