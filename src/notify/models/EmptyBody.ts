/**
 * Body of the `notify` actions that only acknowledge: subscribe, update and
 * revoke. The outcome is carried by the response `status`, not by a payload.
 *
 * Deliberately not an empty interface: `Record<string, never>` says "no
 * properties" rather than "anything".
 */
export type EmptyBody = Record<string, never>;
