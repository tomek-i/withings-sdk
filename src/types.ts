export interface WithingsConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface NonceBody {
  nonce: string;
}

/** REQUEST TYPES */

/**
 * Withings API base request
 * @see https://developer.withings.com/api-reference
 */
export interface WithingsRequest {
  /**
   * Service action name.
   */
  action: string;
}

/** RESPONSES */

/**
 * Withings API base response
 */
export interface WithingsResponse<T> {
  status: number;
  body: T;

  /**
   * Only set if there is an error
   */
  error?: string;
}

export interface NonceResponse extends WithingsResponse<NonceBody> {}
