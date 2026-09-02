import { HeartDeviceModel } from "../enums/HeartDeviceModel";
import { WearPosition } from "../enums/WearPosition";

/** The heart rate measured alongside a signal. */
export interface HeartRateMeasure {
  /** Identifier of the measure group. */
  grpid?: number;
  /** Average heart rate, in bpm. */
  value?: number;
  /** When it was taken, as a unix timestamp in seconds. */
  date?: number;
  /** Whether the measure has since been deleted. */
  is_deleted?: boolean;
}

/**
 * Body of a heart `get` response: one recorded signal.
 *
 * @see https://developer.withings.com/api-reference/#tag/heart/operation/heartv2-get
 */
export interface GetHeartSignal {
  /**
   * The signal itself, in microvolts (μV), sampled at
   * {@link GetHeartSignal.sampling_frequency}.
   *
   * There is no timestamp per sample: the nth value is at
   * `n / sampling_frequency` seconds from the start of the recording.
   */
  signal: number[];
  /** Sampling frequency of `signal`, in Hz. */
  sampling_frequency?: number;
  /** Where the device was held or worn. */
  wearposition?: WearPosition;
  /** The device model that produced the recording. */
  model?: HeartDeviceModel;
  /** Average heart rate recorded alongside the signal. */
  heart_rate?: HeartRateMeasure;
}
