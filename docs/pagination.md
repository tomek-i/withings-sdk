# Pagination

List endpoints cap how many rows one call returns, reporting `more` and an
`offset` to resume from. The `*Pages` methods follow that for you:

```typescript
for await (const page of client.measures.getMeasurementPages({ meastype: MeasurementType.Weight })) {
  for (const group of page.measuregrps) {
    // ...
  }
}
```

Pages are fetched lazily. Nothing is requested until the loop asks for it, and
no further call is made if you `break` early. That matters against a
rate-limited API. You can collect everything with `Array.fromAsync` if you need
it all at once, but that issues every request up front.

`paginate` is exported too, so the same walk works over any endpoint that
reports `more` and `offset`.

---

[Documentation index](./README.md) | [Back to the project](../README.md)
