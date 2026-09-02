import {
  encodeQueryParams,
  ErrorCodeHandler,
  formatYmd,
  resolveDateSelection,
  sortParams,
  toUnixSeconds,
  WithingsResponseStatus,
} from "../../src/util";

describe("sortParams", () => {
  it("sorts entries alphabetically by key", () => {
    expect(sortParams({ client_id: "id", action: "getnonce", timestamp: 1 })).toEqual([
      ["action", "getnonce"],
      ["client_id", "id"],
      ["timestamp", 1],
    ]);
  });
});

describe("formatYmd", () => {
  // The API's own code samples pass '2020-07-01', so the *ymd parameters take
  // a dashed date rather than a bare YYYYMMDD run of digits.
  it("zero-pads month and day", () => {
    expect(formatYmd(new Date(2024, 0, 5))).toEqual("2024-01-05");
  });

  it("handles two-digit month and day", () => {
    expect(formatYmd(new Date(2024, 10, 23))).toEqual("2024-11-23");
  });
});

describe("encodeQueryParams", () => {
  it("omits undefined values", () => {
    expect(encodeQueryParams({ action: "getmeas", offset: undefined, meastype: 1 })).toEqual(
      "action=getmeas&meastype=1"
    );
  });

  it("omits null values", () => {
    expect(encodeQueryParams({ action: "getmeas", category: null })).toEqual("action=getmeas");
  });

  it("percent-encodes keys and values", () => {
    expect(encodeQueryParams({ "data fields": "a,b" })).toEqual("data%20fields=a%2Cb");
  });
});

describe("ErrorCodeHandler", () => {
  it("maps 0 to Success", () => {
    expect(ErrorCodeHandler(0)).toEqual(WithingsResponseStatus.Success);
  });

  it.each([100, 101, 102, 200, 401])("maps %i to AuthenticationFailed", (code) => {
    expect(ErrorCodeHandler(code)).toEqual(WithingsResponseStatus.AuthenticationFailed);
  });

  it.each([201, 247, 400])("maps %i to InvalidParamsError", (code) => {
    expect(ErrorCodeHandler(code)).toEqual(WithingsResponseStatus.InvalidParamsError);
  });

  it.each([214, 277, 2553])("maps %i to UnauthorizedError", (code) => {
    expect(ErrorCodeHandler(code)).toEqual(WithingsResponseStatus.UnauthorizedError);
  });

  it("maps 522 to Timeout, 524 to BadState and 601 to TooManyRequests", () => {
    expect(ErrorCodeHandler(522)).toEqual(WithingsResponseStatus.Timeout);
    expect(ErrorCodeHandler(524)).toEqual(WithingsResponseStatus.BadState);
    expect(ErrorCodeHandler(601)).toEqual(WithingsResponseStatus.TooManyRequests);
  });
});

describe("toUnixSeconds", () => {
  it("converts to whole seconds, not milliseconds", () => {
    // Passing milliseconds is the easiest mistake to make against this API,
    // and it fails silently by asking for a range far in the future.
    expect(toUnixSeconds(new Date("2024-01-05T00:00:00Z"))).toEqual(1704412800);
  });

  it("floors sub-second precision rather than rounding up", () => {
    expect(toUnixSeconds(new Date(1704412800999))).toEqual(1704412800);
  });

  it("keeps the epoch as zero, which is a meaningful watermark", () => {
    expect(toUnixSeconds(new Date(0))).toEqual(0);
  });
});

describe("resolveDateSelection", () => {
  it("turns a date range into the ymd pair and omits the watermark", () => {
    expect(resolveDateSelection({ startDate: new Date(2024, 0, 5), endDate: new Date(2024, 10, 23) })).toEqual({
      startdateymd: "2024-01-05",
      enddateymd: "2024-11-23",
    });
  });

  it("turns a watermark into unix seconds and omits the range", () => {
    expect(resolveDateSelection({ lastUpdate: new Date("2024-01-05T00:00:00Z") })).toEqual({
      lastupdate: 1704412800,
    });
  });

  it("keeps an epoch-zero watermark, which asks for all history", () => {
    expect(resolveDateSelection({ lastUpdate: new Date(0) })).toEqual({ lastupdate: 0 });
  });

  it("never produces both forms at once", () => {
    // The API documents them as mutually exclusive, and getWorkouts used to
    // send both.
    const range = resolveDateSelection({ startDate: new Date(0), endDate: new Date(0) });
    expect(range.lastupdate).toBeUndefined();

    const watermark = resolveDateSelection({ lastUpdate: new Date(0) });
    expect(watermark.startdateymd).toBeUndefined();
    expect(watermark.enddateymd).toBeUndefined();
  });

  it("needs both ends of a range, treating a half-open one as a watermark", () => {
    expect(resolveDateSelection({ startDate: new Date(0) })).toEqual({ lastupdate: undefined });
  });
});
