import { BiomarkerPack } from "./BiomarkerPack";
import { requiredPack } from "./requiredPack";

/**
 * A field that was requested but did not come back.
 */
export interface MissingDataField {
  /** The `data_fields` value that was asked for. */
  field: string;
  /**
   * The pack the field belongs to, when Withings' published table maps it.
   * `undefined` means unknown rather than freely available.
   */
  pack?: BiomarkerPack;
  /** A sentence explaining the most likely cause, suitable for a log or error. */
  reason: string;
}

/**
 * Explains which requested `data_fields` are absent from a response.
 *
 * Withings answers a request for data you cannot access by **omitting the
 * field**, not by failing, so a metric silently arrives as `undefined` and it
 * is not obvious whether the cause is your plan, the OAuth scope, the device
 * or the region. This turns that silence into something you can log.
 *
 * ```typescript
 * const options = { lastUpdate: new Date(0), data_fields: [SleepSummaryDataFields.sleep_score] };
 * const response = await client.sleep.getSummary(options);
 *
 * for (const missing of missingDataFields(options.data_fields, response.body.series[0]?.data)) {
 *   console.warn(missing.reason);
 * }
 * ```
 *
 * A field is only reported when the record exists but the field is absent, so
 * an empty result set does not produce noise.
 *
 * This covers `data_fields` only. `meastypes` works differently: measurements
 * come back as an array of `{ type, value }` rather than as named keys, so an
 * absent measure type cannot be detected by looking for a missing property.
 * Use {@link requiredPack} directly for those.
 *
 * @param requested The `data_fields` that were asked for.
 * @param data The record the metrics should have appeared on, e.g. a
 *   `SleepSummary.data` or an `Activity`.
 * @returns One entry per requested field that is absent, with a likely cause.
 */
export const missingDataFields = (
  requested: readonly string[] | undefined,
  data: object | undefined | null
): MissingDataField[] => {
  if (!requested?.length || !data) return [];

  const present = new Set(Object.keys(data));

  return requested
    .filter((field) => !present.has(field))
    .map((field) => {
      const pack = requiredPack(field);

      const reason =
        pack === BiomarkerPack.Total
          ? `"${field}" was requested but not returned. It belongs to the Total Biomarker Pack, so it requires a paid Withings API plan. It can also be absent if the device does not measure it, or if it is restricted in the region the device was bought in.`
          : `"${field}" was requested but not returned. The device may not measure it, the user may not have granted the required scope, or it may be restricted in the region the device was bought in.`;

      return pack === undefined ? { field, reason } : { field, pack, reason };
    });
};
