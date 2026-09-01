/**
 * Wire parameters for the `confirmuser` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-confirmuser
 */
export interface ConfirmUserParams {
  /** Identifier of the measure group to confirm or reject. */
  grpid: number;
  /** Whether the user confirmed the measurement belongs to them. */
  is_confirmed: boolean;
}
