import { NotificationCategory } from "./enums/NotificationCategory";
import { NotificationPayload } from "./models/NotificationPayload";

/** Anything that exposes the posted fields by name. */
export type NotificationSource = Record<string, string | string[] | number | undefined | null> | URLSearchParams;

const read = (source: NotificationSource, key: string): string | undefined => {
  const value = source instanceof URLSearchParams ? source.get(key) : source[key];
  if (value === undefined || value === null) return undefined;
  return Array.isArray(value) ? value[0] : String(value);
};

const toNumber = (value: string | undefined): number | undefined => {
  if (value === undefined || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

/**
 * Turns a posted notification into a typed {@link NotificationPayload}.
 *
 * Withings posts `application/x-www-form-urlencoded`, so every field arrives as
 * a string and `appli` compares unequal to {@link NotificationCategory} until
 * it is converted. This does that conversion, and accepts whatever shape your
 * framework hands you: an Express `req.body`, a `URLSearchParams`, or a plain
 * object.
 *
 * ```typescript
 * app.post("/withings/callback", (req, res) => {
 *   const event = parseNotificationPayload(req.body);
 *   res.sendStatus(200); // acknowledge first, then do the work
 *
 *   if (event?.appli === NotificationCategory.Weight) {
 *     void client.measures.getMeasurement({
 *       startdate: new Date(event.startdate * 1000),
 *       enddate: new Date(event.enddate * 1000),
 *     });
 *   }
 * });
 * ```
 *
 * @param source The posted fields.
 * @returns The parsed payload, or `undefined` when the required `userid` and
 *   `appli` are missing or unparseable — which is how a stray request to your
 *   callback URL is distinguished from a real notification.
 */
export const parseNotificationPayload = (
  source: NotificationSource | undefined | null
): NotificationPayload | undefined => {
  if (!source) return undefined;

  const userid = toNumber(read(source, "userid"));
  const appli = toNumber(read(source, "appli"));
  if (userid === undefined || appli === undefined) return undefined;

  const payload: NotificationPayload = { userid, appli: appli as NotificationCategory };

  const startdate = toNumber(read(source, "startdate"));
  const enddate = toNumber(read(source, "enddate"));
  const date = read(source, "date");
  const deviceid = read(source, "deviceid");
  const action = read(source, "action");

  if (startdate !== undefined) payload.startdate = startdate;
  if (enddate !== undefined) payload.enddate = enddate;
  if (date !== undefined) payload.date = date;
  if (deviceid !== undefined) payload.deviceid = deviceid;
  if (action !== undefined) payload.action = action;

  return payload;
};
