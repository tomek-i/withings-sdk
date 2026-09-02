/**
 * Contract assertions for the live API.
 *
 * These check the *shape* of a response against what the SDK's types claim,
 * never the values. The values are the account holder's health data and they
 * differ per account, so asserting on them would be both invasive and flaky.
 *
 * The asymmetry below is deliberate:
 *
 * - **A field of the wrong type fails.** Our types are lying.
 * - **An undeclared field fails.** The API grew something we do not model,
 *   which is exactly the drift these tests exist to catch.
 * - **A missing field passes.** Absence is not evidence of a change: the API
 *   only returns what `data_fields` asked for, what the account's plan
 *   includes, and what the user's devices actually measure.
 */

/** The types a field is allowed to hold. `null` is written as its own type. */
export type FieldType = "string" | "number" | "boolean" | "object" | "array" | "null";

/** Maps each field the SDK models onto the types it may hold. */
export type Contract = Record<string, readonly FieldType[]>;

const typeOf = (value: unknown): FieldType => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as FieldType;
};

/**
 * Asserts a record matches the contract, in both directions.
 *
 * @param label What is being checked, used in failure messages.
 * @param record The object returned by the API.
 * @param contract The fields the SDK models, and the types each may hold.
 */
export const expectContract = (label: string, record: object | undefined | null, contract: Contract): void => {
  if (!record) return;

  const wrongType: string[] = [];
  const undeclared: string[] = [];

  for (const [key, value] of Object.entries(record)) {
    const allowed = contract[key];

    if (!allowed) {
      undeclared.push(`${key}: ${typeOf(value)}`);
      continue;
    }

    const actual = typeOf(value);
    if (!allowed.includes(actual)) {
      wrongType.push(`${key}: expected ${allowed.join("|")}, got ${actual}`);
    }
  }

  if (wrongType.length) {
    throw new Error(
      `${label}: the API returned types the SDK does not model.\n  ${wrongType.join("\n  ")}\n` +
        `Update the model in src/, and check whether other endpoints share the field.`
    );
  }

  if (undeclared.length) {
    throw new Error(
      `${label}: the API returned fields the SDK does not model.\n  ${undeclared.join("\n  ")}\n` +
        `Either the API grew a field, or one was missed when the model was written.`
    );
  }
};

/** Reports which of the requested fields the account did not receive. */
export const reportAbsent = (label: string, record: object | undefined | null, expected: readonly string[]): void => {
  if (!record) return;
  const present = new Set(Object.keys(record));
  const absent = expected.filter((f) => !present.has(f));
  if (absent.length) {
    // Informational: almost always the biomarker pack or the device, not a bug.
    console.log(`  [${label}] not returned for this account: ${absent.join(", ")}`);
  }
};
