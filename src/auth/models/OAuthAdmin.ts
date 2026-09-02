import { PaginatedBody } from "../../pagination/paginate";

/** A user linked to your application. */
export interface LinkedUser {
  /** Hashed user identifier. */
  hash_userid?: string;
  /** The user's id. */
  userid?: number;
  /** The user's email address. */
  email?: string;
  /** Whether the account was created by your application. */
  fully_owned?: boolean;
}

/**
 * Body of an oauth2 `listusers` response.
 *
 * Note: the published specification lists the user fields directly on the
 * body, alongside `more` and `offset`. That is an item schema that was never
 * wrapped, the same slip it makes for the sleep `get` series, so the users are
 * modelled as an array.
 *
 * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-listusers
 */
export interface ListUsers extends PaginatedBody {
  /** The users linked to your application. */
  users: LinkedUser[];
}

/**
 * Body of an oauth2 `recoverauthorizationcode` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-recoverauthorizationcode
 */
export interface RecoveredAuthorizationCode {
  /** The recovered code. */
  user: {
    /** Authorization code to exchange with {@link Auth.fetchAccessToken}. */
    code?: string;
  };
}

/**
 * Body of an oauth2 `getdemoaccess` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-getdemoaccess
 */
export interface DemoAccess {
  /** Access token for the demo user. */
  access_token?: string;
  /** Refresh token for the demo user. */
  refresh_token?: string;
  /** Access token lifetime, in seconds. */
  expires_in?: number;
}

/**
 * Body of an oauth2 `createclient` response.
 *
 * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-createclient
 */
export interface CreatedClient {
  /** The new application's client ID. */
  client_id?: string;
  /** The new application's client secret. */
  client_secret?: string;
  /** The application name. */
  name?: string;
  /** The application description. */
  desc?: string;
  /** URL of the application image. */
  img?: string;
  /** Whether the application is restricted. */
  is_restricted?: boolean;
  /** The organization the application belongs to. */
  organization_id?: number;
}
