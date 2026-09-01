import { SleepSummaryData } from "./SleepSummaryData";

/**
 * A night of sleep, summarised.
 *
 * @see https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-getsummary
 */
export interface SleepSummary {
  /** Identifier of the sleep activity. */
  id?: number;
  /** IANA timezone the night was recorded in. */
  timezone?: string;
  /** Numeric identifier of the device model. */
  model?: number;
  /** Numeric identifier of the device model. */
  model_id?: number;
  /** Start of the night, as a unix timestamp in seconds. */
  startdate?: number;
  /** End of the night, as a unix timestamp in seconds. */
  enddate?: number;
  /** The day the night is attributed to, as `YYYY-MM-DD`. */
  date?: string;
  /** When the record was created, as a unix timestamp in seconds. */
  created?: number;
  /** When the record was last modified, as a unix timestamp in seconds. */
  modified?: number;
  /** Hashed identifier of the device that recorded the night. */
  hash_deviceid?: string;
  /** Whether the night was fully tracked. */
  completed?: boolean;
  /** The metrics. Only the requested `data_fields` are populated. */
  data?: SleepSummaryData;
}
