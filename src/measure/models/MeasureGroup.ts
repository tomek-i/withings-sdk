import { Measure } from "./Measure";

/**
 * A set of measurements taken at the same moment, e.g. the weight, fat ratio
 * and bone mass recorded by a single step onto a scale.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
 */
export interface MeasureGroup {
  /** Group identifier. */
  grpid: number;
  /** Attribution of the data, describing how it was captured. */
  attrib: number;
  /** When the measurement was taken, as a unix timestamp in seconds. */
  date: number;
  /** When the group was created, as a unix timestamp in seconds. */
  created: number;
  /** When the group was last modified, as a unix timestamp in seconds. */
  modified: number;
  /** Whether these are real measurements or user objectives. */
  category: number;
  /** Identifier of the device that took the measurement. */
  deviceid?: string;
  /** Hashed device identifier, returned instead of `deviceid` for some apps. */
  hash_deviceid?: string;
  /** The individual measurements in this group. */
  measures: Measure[];
  /** Name of the device model, e.g. `Body+`. */
  model?: string;
  /**
   * Numeric identifier of the device model.
   *
   * Note the spelling: `getmeas` returns `model_id`, while `getactivity`
   * returns the same concept as `modelid`. That inconsistency is in the API.
   */
  model_id?: number;
  /** @deprecated The API always returns this empty. */
  comment?: string;
}
