/**
 * Atrial fibrillation classification for an ECG recording.
 *
 * @see https://developer.withings.com/api-reference/#tag/heart/operation/heartv2-list
 */
export enum AfibClassification {
  /** No atrial fibrillation detected. */
  Negative = 0,
  /** Atrial fibrillation detected. */
  Positive = 1,
  /** The recording could not be classified. */
  Inconclusive = 2,
}
