# Withings SDK

A Node.js SDK for the Withings API.

## Installation

```bash
npm install withings-sdk
```

## Usage

```typescript
import { WithingsClient } from "withings-sdk";

const client = new WithingsClient({
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
  redirectUri: "your-redirect-uri",
});

const accessToken = await client.auth.getAccessToken("authorization-code");
console.log(accessToken);
```
