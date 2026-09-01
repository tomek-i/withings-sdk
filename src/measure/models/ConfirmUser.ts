/**
 * Body of a `confirmuser` response.
 *
 * `confirmuser` only acknowledges the request; the outcome is carried by the
 * response `status` rather than by a payload, so the body is empty by design.
 * This is deliberately not an empty interface — `Record<string, never>` says
 * "no properties" rather than "anything".
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-confirmuser
 */
export type ConfirmUser = Record<string, never>;
