import express from "express";
import * as http from "http";
import { WithingsClient } from "../../src";
import { env } from "../helpers/env";
import { persistTokens } from "../helpers/persistTokens";
import { exec } from "child_process";
import { RequestTokenResponse } from "../../src/auth/types/http/responses/RequestTokenResponse";

describe("WITHINGS CLIENT AUTHORIZATION TESTS", () => {
  let client: WithingsClient;
  let server: http.Server;

  let serverReady: Promise<RequestTokenResponse>;
  let resolveServerReady: (value: RequestTokenResponse | PromiseLike<RequestTokenResponse>) => void;

  beforeAll(() => {
    client = new WithingsClient({
      clientId: env.WITHINGS_CLIENT_ID,
      clientSecret: env.WITHINGS_CLIENT_SECRET,
      redirectUri: env.WITHINGS_REDIRECT_URI,
      // Seeded so the refresh test can run without going through consent first.
      accessToken: env.WITHINGS_ACCESS_TOKEN,
      refreshToken: env.WITHINGS_REFRESH_TOKEN,
    });

    // Start up server
    serverReady = new Promise<RequestTokenResponse>((resolve) => {
      resolveServerReady = resolve;
    });

    const app = express();
    app.get("/auth/withings/callback", async (req, res) => {
      const { code } = req.query;
      if (typeof code === "string") {
        const response = await client.auth.fetchAccessToken(code);
        resolveServerReady(response);
        // Deliberately not res.json(response): that renders the access and
        // refresh tokens into the browser window, and into anything that logs
        // the page.
        res.status(200).send("Authorized. You can close this tab.");
      } else {
        res.status(400).send("Code is required");
      }
    });

    server = app.listen(3000, () => {
      console.log("Server started on port 3000");
    });
  });

  afterAll(() => {
    server.close();
    // Refreshing rotates the refresh token, so the credentials this suite was
    // handed are dead by the time it finishes. Write the new pair back, or the
    // next run fails with invalid_refresh_token.
    persistTokens(client.auth.getCurrentAccessToken(), client.auth.getCurrentRefreshToken());
  });

  const tokenBody = {
    // Observed: a string from the authorization_code exchange, a number from a
    // refresh. Same field, same endpoint, different type.
    userid: expect.anything(),
    access_token: expect.any(String),
    refresh_token: expect.any(String),
    scope: expect.any(String),
    expires_in: expect.any(Number),
    token_type: expect.any(String),
  };

  it("should be able to refresh the access token", async () => {
    const response = await client.auth.refreshAccessToken();
    expect(response).toEqual({ status: 0, body: tokenBody });
  });

  it("should get an access token", async () => {
    // Trigger the action that leads to the callback being called
    const url = client.auth.getAuthCodeUrl(["user.info", "user.metrics", "user.activity"], "test_state");
    exec(`start "" "${url}"`, (error) => {
      if (error) {
        throw error;
      }
    });

    // Wait for the server to handle the callback
    const response = await serverReady;

    // Wait for the server to close

    expect(response).toEqual({ status: 0, body: tokenBody });
  }, 30000);
});
