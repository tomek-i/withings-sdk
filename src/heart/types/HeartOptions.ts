import { WithPagination } from "../../types/WithPagination";

/**
 * Options for {@link Heart.list}.
 *
 * @see https://developer.withings.com/api-reference/#tag/heart/operation/heartv2-list
 */
export interface ListHeartOptions extends WithPagination {
  /** Only return recordings taken at or after this moment. */
  startdate?: Date;
  /** Only return recordings taken at or before this moment. */
  enddate?: Date;
}

/**
 * Options for {@link Heart.get}.
 *
 * A union, because the API offers two ways to identify a signal and they are
 * mutually exclusive: by `signalid`, authorized by the user's access token, or
 * by `signal_token`, authorized by a signed request. The `never` members are
 * what stop the two being mixed.
 *
 * @see https://developer.withings.com/api-reference/#tag/heart/operation/heartv2-get
 */
export type GetHeartSignalOptions =
  | (GetHeartSignalBaseOptions & WithSignalId)
  | (GetHeartSignalBaseOptions & WithSignalToken);

/** Options common to both ways of identifying a signal. */
export interface GetHeartSignalBaseOptions {
  /** Request the filtered version of the signal. */
  with_filtered?: boolean;
  /** Include inactive features in the response. */
  with_intervals?: boolean;
}

/**
 * Identify the signal by its id, using the access token this client already
 * sends. This is the usual form: take the `signalid` from {@link Heart.list}.
 */
export interface WithSignalId {
  /** Identifier of the signal, from a {@link HeartRecord}. */
  signalid: number;
  signal_token?: never;
  client_id?: never;
  signature?: never;
  nonce?: never;
}

/**
 * Identify the signal by a signal token, authorized by a signed request.
 *
 * Spread the result of `auth.signedParams("get")` in. The `action` it carries
 * is accepted and ignored — this method sets it — and is part of what the
 * signature covers, so it must not be changed.
 */
export interface WithSignalToken {
  /** The signal identifier issued for a signed request. */
  signal_token: string;
  /** Your application's client ID. */
  client_id: string;
  /** HMAC signature over the sorted values. */
  signature: string;
  /** Single-use nonce from `auth.getNonce()`. */
  nonce: string;
  /** Accepted so `auth.signedParams()` can be spread in; ignored. */
  action?: string;
  signalid?: never;
}
