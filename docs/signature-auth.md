# Signature authentication

A few Withings services authenticate with a **signed request** rather than a
user's access token. They are authorized by your client ID and secret, so they
work without anyone having gone through consent.

`signedParams` fetches a nonce and signs the action in one step:

```typescript
const signed = await client.auth.signedParams("subscribe");

await client.notify.subscribe({
  ...signed,
  callbackurl: "https://example.com/withings/callback",
  appli: NotificationCategory.Weight,
});
```

The same applies to the partner services on `client.auth`:

```typescript
// Stop sending data for a user who disconnected
const signed = await client.auth.signedParams("revoke");
await client.auth.revoke({ ...signed, userid });
```

`listUsers`, `recoverAuthorizationCode`, `getDemoAccess` and `createClient`
work the same way. None of them needs a user access token, because the client
secret is what authorizes them.

The nonce is valid for 30 minutes and **single use**, so call `signedParams`
once per request rather than reusing the result. `auth.getNonce()` is available
if you need the nonce alone, and `auth.generateSignature()` signs an arbitrary
parameter set.

The signature covers the exact values sent. Changing any of them after signing
invalidates it. That is why they arrive as one object to spread.

---

[Documentation index](./README.md) | [Back to the project](../README.md)
