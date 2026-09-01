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
  deviceid?: string | null;
  /** Hashed device identifier, returned instead of `deviceid` for some apps. */
  hash_deviceid?: string | null;
  /** The individual measurements in this group. */
  measures: Measure[];
  /** Numeric identifier of the device model. */
  modelid?: number | null;
  /** Name of the device model. */
  model?: string | null;
  /** Comment attached to the group by the user. */
  comment?: string | null;
}
