import { WithingsClient } from "../../src";
import { env } from "../../src/env";
import { GetActivityOptions } from "../../src/measure/types/GetActivityOptions";
import { WithingsResponseStatus } from "../../src/util";

describe("MEASUREMENT TESTS", () => {
  let client: WithingsClient;

  beforeAll(() => {
    const config = {
      clientId: env.WHITININGS_CLIENT_ID,
      clientSecret: env.WHITININGS_SECRET,
      redirectUri: env.WHITININGS_REDIRECT_URI!,
    };

    client = new WithingsClient(config);
  });

  it("should call getMeasurement with no options successfully", async () => {
    const response = await client.measures.getMeasurement();
    expect(response.status).toEqual(WithingsResponseStatus.Success);
  });

  it("should call getActivity with lastUpdate successfully", async () => {
    const options: GetActivityOptions = {
      lastUpdate: 0 as any,
    };
    const response = await client.measures.getActivity(options);
    expect(response.status).toEqual(WithingsResponseStatus.Success);
  });
});
