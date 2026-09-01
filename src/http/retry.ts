import { WithingsApiError } from "../errors/WithingsApiError";

/**
 * How the client should behave when the API rate limits a request.
 *
 * Withings allows roughly 120 requests per minute by default, and more on a
 * paid plan. Exceeding it is reported as status `601`, not as an HTTP error.
 *
 * @see https://developer.withings.com/developer-guide/v3/data-api/keep-user-data-up-to-date/
 */
export interface WithingsRetryOptions {
  /**
   * Total attempts for a single request, including the first one. `1` disables
   * retrying without having to pass `false`.
   *
   * @default 3
   */
  maxAttempts?: number;
  /**
   * Delay before the first retry, in milliseconds. Each subsequent retry
   * doubles it.
   *
   * @default 1000
   */
  initialDelayMs?: number;
  /**
   * Upper bound on a single delay, in milliseconds, so the doubling cannot run
   * away on a long retry chain.
   *
   * @default 30000
   */
  maxDelayMs?: number;
  /**
   * Whether to randomise each delay across the range up to its computed value.
   *
   * On by default, and worth keeping: without it a fleet of clients that are
   * rate limited together will retry in lockstep and stay limited.
   *
   * @default true
   */
  jitter?: boolean;
  /**
   * Called before each wait, for logging or metrics. Purely observational —
   * throwing from it will abort the request.
   */
  onRetry?: (attempt: RetryAttempt) => void;
}

/** Describes a retry that is about to be waited out. */
export interface RetryAttempt {
  /** Which attempt just failed, counting the first as 1. */
  attempt: number;
  /** How long the client is about to wait, in milliseconds. */
  delayMs: number;
  /** The rate limit error that triggered the retry. */
  error: WithingsApiError;
}

/**
 * Withings rejects a repeated request carrying identical arguments inside a
 * ten second window, and reports it with the same `601` used for a genuine
 * rate limit. Backing off for less than that window simply repeats the
 * rejection, so this is the floor applied when the API says so.
 */
export const DUPLICATE_REQUEST_WINDOW_MS = 10000;

/**
 * Whether a rate limit error is the duplicate-argument guard rather than a
 * genuine rate limit.
 *
 * Matched on the message because the API uses one status code for both. It is
 * a substring check on purpose: if Withings rewords it, this stops matching
 * and the caller gets the ordinary backoff, which is the safe direction.
 *
 * @param error The rate limit error the API returned.
 * @returns `true` when the message identifies the duplicate-request guard.
 */
export const isDuplicateRequest = (error: WithingsApiError): boolean =>
  (error.apiMessage ?? "").toLowerCase().includes("same arguments");

/** The defaults applied when a client is constructed without `retry`. */
export const DEFAULT_RETRY_OPTIONS: Required<Omit<WithingsRetryOptions, "onRetry">> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  jitter: true,
};

/**
 * Resolves the retry settings for a client.
 *
 * @param options What the caller supplied, or `false` to disable retrying.
 * @returns The settings to use, with defaults filled in.
 */
export const resolveRetryOptions = (
  options: WithingsRetryOptions | false | undefined
): Required<Omit<WithingsRetryOptions, "onRetry">> & Pick<WithingsRetryOptions, "onRetry"> => {
  if (options === false) return { ...DEFAULT_RETRY_OPTIONS, maxAttempts: 1 };
  return { ...DEFAULT_RETRY_OPTIONS, ...options };
};

/**
 * Computes how long to wait before a given retry.
 *
 * Exponential from `initialDelayMs`, doubling per attempt, capped at
 * `maxDelayMs`, then randomised across the range when `jitter` is on.
 *
 * When the failure is the duplicate-argument guard, the delay is raised to at
 * least {@link DUPLICATE_REQUEST_WINDOW_MS}: anything shorter provably repeats
 * the rejection, so jitter is skipped there too.
 *
 * @param attempt Which attempt just failed, counting the first as 1.
 * @param options Resolved retry settings.
 * @param random Source of randomness, injectable so the jitter can be tested.
 * @param duplicate Whether the API reported the duplicate-request guard.
 * @returns The delay in milliseconds.
 */
export const backoffDelay = (
  attempt: number,
  options: Pick<WithingsRetryOptions, "initialDelayMs" | "maxDelayMs" | "jitter">,
  random: () => number = Math.random,
  duplicate = false
): number => {
  const { initialDelayMs, maxDelayMs, jitter } = { ...DEFAULT_RETRY_OPTIONS, ...options };

  const exponential = Math.min(initialDelayMs * 2 ** (attempt - 1), maxDelayMs);

  if (duplicate) {
    // Waiting out the window is the only thing that clears it, so a random
    // shorter delay would just burn an attempt.
    return Math.min(Math.max(exponential, DUPLICATE_REQUEST_WINDOW_MS), maxDelayMs);
  }

  // Full jitter: anywhere in [0, exponential]. Spreads a fleet that was rate
  // limited at the same moment, rather than having it retry in lockstep.
  return jitter ? Math.floor(random() * exponential) : exponential;
};

/**
 * Waits for the given number of milliseconds.
 *
 * @param ms How long to wait.
 */
export const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
