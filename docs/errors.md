# Error handling

The Withings API answers with HTTP 200 even when a call fails, putting the
outcome in the response body. Failures are raised as a `WithingsApiError`
carrying the raw status code and the category it maps to, so you can branch on
a specific failure without matching on message strings:

```typescript
import { WithingsApiError, WithingsResponseStatus } from "withings-sdk";

try {
  await client.measures.getMeasurement();
} catch (error) {
  if (error instanceof WithingsApiError) {
    if (error.type === WithingsResponseStatus.TooManyRequests) {
      // rate limited - back off and retry later
    }
    console.error(error.status, error.message);
  }
}
```

An expired access token is handled for you. The client renews it and retries
once before throwing.

## Two kinds of failure

The API normally answers with HTTP 200 and reports problems in the body. A
non-2xx status means the request never got that far, so the two cases are
separate types:

| Thrown | Means | Carries |
| --- | --- | --- |
| `WithingsApiError` | The API ran your request and refused it | `status`, `type`, `body` |
| `WithingsHttpError` | The request failed at the HTTP layer | `status`, `statusText`, `url`, `retryAfterMs` |
| `WithingsInvalidResponseError` | Something answered, but not the API | `url`, `httpStatus`, `snippet` |

The third one covers a proxy error page, a captive portal, or any body that is
not the JSON envelope every Withings response carries. Without it those escape
as a bare `SyntaxError` from `JSON.parse`, which names no URL and reads like a
bug in your own code.

Both extend `Error`, so catching `Error` still catches everything. Check the
type when you want to tell them apart:

```typescript
import { WithingsApiError, WithingsHttpError } from "withings-sdk";

try {
  await client.measures.getMeasurement();
} catch (error) {
  if (error instanceof WithingsHttpError && error.status === 503) {
    // the service is down, rather than anything wrong with the request
  }
  if (error instanceof WithingsApiError) {
    // the API answered, and refused
  }
}
```

The client retries a 429, 502, 503 or 504 on its own, honouring `Retry-After`
when the server sends one. A 400 or 404 is not retried, because it would fail
the same way.

# Rate limits

Withings allows roughly **120 requests per minute** by default, and more on a
paid plan. Exceeding it is reported as status `601` in the response body, not
as an HTTP error.

The client backs off and retries a rate limited request automatically, up to
three attempts in total, with exponential delays and full jitter:

```typescript
const client = new WithingsClient({
  ...credentials,
  retry: {
    maxAttempts: 3,        // default; 1 disables retrying
    initialDelayMs: 1000,  // doubles each attempt
    maxDelayMs: 30000,
    jitter: true,          // spreads retries so clients do not sync up
    onRetry: ({ attempt, delayMs }) => console.warn(`rate limited, retry ${attempt} in ${delayMs}ms`),
  },
});

// Or opt out entirely and handle 601 yourself:
const strict = new WithingsClient({ ...credentials, retry: false });
```

Once the attempts are exhausted the rate limit surfaces as a
`WithingsApiError` with `type === WithingsResponseStatus.TooManyRequests`.

Withings also rejects a **repeated request with identical arguments inside ten
seconds**, reporting it with the same `601`. The client recognises that case
and waits out the full window instead of retrying inside it, where every
attempt would be rejected again.

Retrying only smooths over bursts. If you are polling regularly, subscribe to
notifications instead. Withings recommends that precisely to keep you under the
limit.

---

[Documentation index](./README.md) | [Back to the project](../README.md)
