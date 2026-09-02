import { SignedParams } from "../../types";

/**
 * Options for {@link Auth.revoke}.
 *
 * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-revoke
 */
export interface RevokeUserOptions extends SignedParams {
  /** The user whose authorization should be revoked. */
  userid: string;
}

/**
 * Options for {@link Auth.listUsers}.
 *
 * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-listusers
 */
export interface ListUsersOptions extends SignedParams {
  /**
   * When a first call reports more rows and an offset, pass that offset here
   * to read the next page.
   */
  offset?: number;
}

/**
 * Options for {@link Auth.recoverAuthorizationCode}.
 *
 * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-recoverauthorizationcode
 */
export interface RecoverAuthorizationCodeOptions extends SignedParams {
  /** The user whose authorization code should be recovered. */
  userid: string;
}

/**
 * Options for {@link Auth.getDemoAccess}.
 *
 * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-getdemoaccess
 */
export interface DemoAccessOptions extends SignedParams {
  /** The scopes to grant the demo user, comma separated. */
  scope_oauth2: string;
}

/**
 * Options for {@link Auth.createClient}.
 *
 * @see https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-createclient
 */
export interface CreateClientOptions extends SignedParams {
  /** Name of the application to create. */
  name: string;
  /** Description of the application. */
  description: string;
  /** The environment the application is intended for. */
  intended_environment: string;
  /** The integrations the application is intended for. */
  intended_integrations: string;
  /** Redirect URIs to register, comma separated. */
  redirect_uris: string;
}
