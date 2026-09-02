import { hasMorePages, paginate, WithingsClient } from "../../src";
import type { WithingsResponse } from "../../src";
import { withingsResponse } from "../helpers/response";

const client = () =>
  new WithingsClient({
    clientId: "id",
    clientSecret: "secret",
    redirectUri: "https://example.com/cb",
    accessToken: "token",
  });

const collect = async <T>(iterator: AsyncIterable<T>): Promise<T[]> => {
  const out: T[] = [];
  for await (const item of iterator) out.push(item);
  return out;
};

const page = <T extends object>(body: T): WithingsResponse<T> => ({ status: 0, body });

describe("hasMorePages", () => {
  it("reads the boolean form used by getactivity and getworkouts", () => {
    expect(hasMorePages({ more: true })).toBe(true);
    expect(hasMorePages({ more: false })).toBe(false);
  });

  it("reads the numeric form used by getmeas", () => {
    expect(hasMorePages({ more: 1 })).toBe(true);
    expect(hasMorePages({ more: 0 })).toBe(false);
  });

  it("treats a missing body or missing field as the end", () => {
    expect(hasMorePages(undefined)).toBe(false);
    expect(hasMorePages({})).toBe(false);
  });
});

describe("paginate", () => {
  it("follows the offset until the API reports no more rows", async () => {
    const offsets: (number | undefined)[] = [];
    const pages = [
      { rows: ["a"], more: true, offset: 10 },
      { rows: ["b"], more: true, offset: 20 },
      { rows: ["c"], more: false, offset: 30 },
    ];

    const result = await collect(
      paginate((offset) => {
        offsets.push(offset);
        return Promise.resolve(page(pages[offsets.length - 1]));
      })
    );

    expect(result.map((p) => p.rows[0])).toEqual(["a", "b", "c"]);
    // The first call starts from the beginning, then follows what came back.
    expect(offsets).toEqual([undefined, 10, 20]);
  });

  it("stops after a single page when there is no more", async () => {
    const fetchPage = jest.fn().mockResolvedValue(page({ rows: ["only"], more: false }));

    const result = await collect(paginate(fetchPage));

    expect(result).toHaveLength(1);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("stops when a page claims more rows but returns no offset", async () => {
    const fetchPage = jest.fn().mockResolvedValue(page({ rows: ["x"], more: true }));

    const result = await collect(paginate(fetchPage));

    expect(result).toHaveLength(1);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("stops when the offset fails to advance, rather than looping forever", async () => {
    // A stalled offset would otherwise be an infinite request loop.
    const fetchPage = jest.fn().mockResolvedValue(page({ rows: ["x"], more: true, offset: 5 }));

    const result = await collect(paginate(fetchPage));

    expect(result).toHaveLength(2);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("fetches lazily, requesting a page only as it is consumed", async () => {
    const fetchPage = jest.fn().mockResolvedValue(page({ rows: ["x"], more: true, offset: 1 }));

    const iterator = paginate(fetchPage);
    expect(fetchPage).not.toHaveBeenCalled();

    await iterator.next();
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("makes no further request once the consumer breaks out early", async () => {
    const fetchPage = jest
      .fn()
      .mockResolvedValueOnce(page({ rows: ["a"], more: true, offset: 10 }))
      .mockResolvedValueOnce(page({ rows: ["b"], more: true, offset: 20 }));

    for await (const _ of paginate(fetchPage)) {
      break;
    }

    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
});

describe("Measures page walkers", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  const respond = (body: unknown) => withingsResponse(body);

  it("walks getMeasurement across pages, sending the offset each time", async () => {
    fetchMock
      .mockResolvedValueOnce(respond({ measuregrps: [{ grpid: 1 }], more: 1, offset: 100 }))
      .mockResolvedValueOnce(respond({ measuregrps: [{ grpid: 2 }], more: 0 }));

    const pages = await collect(client().measures.getMeasurementPages());

    expect(pages.flatMap((p) => p.measuregrps.map((g) => g.grpid))).toEqual([1, 2]);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstUrl = new URL(fetchMock.mock.calls[0][0] as string);
    const secondUrl = new URL(fetchMock.mock.calls[1][0] as string);
    expect(firstUrl.searchParams.has("offset")).toBe(false);
    expect(secondUrl.searchParams.get("offset")).toEqual("100");
  });

  it("walks getActivity across pages", async () => {
    fetchMock
      .mockResolvedValueOnce(respond({ activities: [{ date: "2024-01-01" }], more: true, offset: 50 }))
      .mockResolvedValueOnce(respond({ activities: [{ date: "2024-01-02" }], more: false }));

    const pages = await collect(client().measures.getActivityPages({ lastUpdate: new Date(0) }));

    expect(pages.flatMap((p) => p.activities.map((a) => a.date))).toEqual(["2024-01-01", "2024-01-02"]);
    expect(new URL(fetchMock.mock.calls[1][0] as string).searchParams.get("offset")).toEqual("50");
  });

  it("ignores an offset supplied in the options, since the walk owns it", async () => {
    fetchMock.mockResolvedValueOnce(respond({ activities: [], more: false }));

    await collect(client().measures.getActivityPages({ lastUpdate: new Date(0), offset: 999 }));

    expect(new URL(fetchMock.mock.calls[0][0] as string).searchParams.has("offset")).toBe(false);
  });
});

describe("getWorkoutsPages", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  const respond = (body: unknown) => withingsResponse(body);

  it("walks workouts across pages, following the offset", async () => {
    fetchMock
      .mockResolvedValueOnce(respond({ series: [{ id: 1 }], more: true, offset: 30 }))
      .mockResolvedValueOnce(respond({ series: [{ id: 2 }], more: false }));

    const pages = await collect(client().measures.getWorkoutsPages({ lastUpdate: new Date(0) }));

    expect(pages.flatMap((p) => p.series.map((w) => w.id))).toEqual([1, 2]);
    expect(new URL(fetchMock.mock.calls[1][0] as string).searchParams.get("offset")).toEqual("30");
  });
});

describe("a null offset", () => {
  // Observed on the live API: listusers returns offset: null on the last page,
  // where the other endpoints simply omit the field.
  it("ends iteration, exactly as a missing offset does", async () => {
    const fetchPage = jest.fn().mockResolvedValue(page({ rows: ["x"], more: true, offset: null }));

    const result = await collect(paginate(fetchPage));

    expect(result).toHaveLength(1);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("is not treated as offset zero", async () => {
    // Number(null) is 0, so a loose comparison here would restart the walk.
    expect(hasMorePages({ more: true, offset: null })).toBe(true);
  });
});
