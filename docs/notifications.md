# Notifications

## Subscribing to notifications

Withings posts to a callback URL when new data is available. This is the
supported alternative to polling, and what Withings recommends for staying
inside the rate limit.

```typescript
import { NotificationCategory, parseNotificationPayload } from "withings-sdk";

await client.notify.subscribe({
  callbackurl: "https://example.com/withings/callback",
  appli: NotificationCategory.Weight,
});
```

Withings verifies the URL by posting to it during `subscribe`, so it has to be
reachable and answering `200` before you call.

The notification tells you that something changed, and over which range. It
never carries the measurements, so fetch those yourself:

```typescript
app.post("/withings/callback", express.urlencoded({ extended: false }), async (req, res) => {
  const event = parseNotificationPayload(req.body);
  res.sendStatus(200); // acknowledge first: Withings retries on a slow reply

  if (event?.appli === NotificationCategory.Weight && event.startdate && event.enddate) {
    const measures = await client.measures.getMeasurement({
      startdate: new Date(event.startdate * 1000),
      enddate: new Date(event.enddate * 1000),
    });
  }
});
```

`parseNotificationPayload` returns `undefined` for anything that is not a
notification, which is how a stray request to a public callback URL is told
apart from a real one. It also converts the form-encoded strings, so `appli`
compares equal to `NotificationCategory`.

Manage subscriptions with `client.notify.list()`, `.get()`, `.update()` and
`.revoke()`.

---

[Documentation index](./README.md) | [Back to the project](../README.md)
