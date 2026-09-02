# Users and devices

## Devices and goals

```typescript
const { devices } = (await client.user.getDevice()).body;

for (const device of devices) {
  // A device that stopped syncing looks identical to "no new data" from the
  // measure endpoints alone, so check when it last connected.
  console.log(device.type, device.battery, device.last_session_date);
}

const { goals } = (await client.user.getGoals()).body;
// goals.weight is scaled: value * 10 ** unit kilograms

// Link or unlink devices by MAC address
await client.user.link({ mac_addresses: ["00:11:22:33:44:55"] });
await client.user.unlink({ mac_address: "00:11:22:33:44:55" });
```

`user.get`, `user.activate` and `user.addToRpm` are partner services. They
authorize by signature rather than by the user's access token, so pass
`auth.signedParams()` in. `user.get` looks a user up by email or id, so it is
not a way to read the profile of whoever authorized your client.

---

[Documentation index](./README.md) | [Back to the project](../README.md)
