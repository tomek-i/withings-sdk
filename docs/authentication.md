# Authentication

Withings uses OAuth2. You send the user to a consent screen, exchange the
code they come back with for tokens, and reuse those tokens afterwards.

## 1. Send the user to the consent screen

```typescript
import { WithingsClient } from "withings-sdk";

const client = new WithingsClient({
  clientId: process.env.WITHINGS_CLIENT_ID!,
  clientSecret: process.env.WITHINGS_CLIENT_SECRET!,
  redirectUri: "https://example.com/auth/withings/callback",
});

const url = client.auth.getAuthCodeUrl(["user.info", "user.metrics", "user.activity"], "some-csrf-state");
// Redirect the user to `url`.
```

## Exchange the authorization code for tokens

Withings redirects back to your `redirectUri` with a `code` query parameter:

```typescript
const response = await client.auth.fetchAccessToken(code);

// Persist these. They let you skip the consent screen next time.
const accessToken = client.auth.getCurrentAccessToken();
const refreshToken = client.auth.getCurrentRefreshToken();
```

## Reuse stored tokens

Pass a previously obtained token pair straight into the constructor:

```typescript
const client = new WithingsClient({
  clientId: process.env.WITHINGS_CLIENT_ID!,
  clientSecret: process.env.WITHINGS_CLIENT_SECRET!,
  redirectUri: "https://example.com/auth/withings/callback",
  accessToken: storedAccessToken,
  refreshToken: storedRefreshToken,
});
```

…or set them on an existing client with `client.auth.setTokens({ accessToken, refreshToken })`.

When a request fails because the access token has expired, the client refreshes
it with the refresh token and retries the request once, automatically.

> **Note:** Withings rotates the refresh token on every renewal. Read
> `client.auth.getCurrentRefreshToken()` after a call and persist the new value,
> or the stored one will eventually stop working.

---

[Documentation index](./README.md) | [Back to the project](../README.md)
