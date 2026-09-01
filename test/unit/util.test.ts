import { encodeQueryParams, ErrorCodeHandler, formatYmd, sortParams, WithingsResponseStatus } from "../../src/util";

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
