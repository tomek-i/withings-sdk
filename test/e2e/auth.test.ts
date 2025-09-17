import express from "express";
import * as http from "http";
import { WithingsClient } from "../../src";
import { env } from "../../src/env";
import { exec } from "child_process";
import { RequestTokenResponse } from "../../src/auth/types/http/responses/RequestTokenResponse";

describe("WITHINGS CLIENT AUTHORIZATION TESTS", () => {
  let client: WithingsClient;
  let server: http.Server;

  let serverReady: Promise<RequestTokenResponse>;
  let resolveServerReady: (value: RequestTokenResponse | PromiseLike<RequestTokenResponse>) => void;

  beforeAll(() => {
    const config = {
      clientId: env.WHITININGS_CLIENT_ID,
      clientSecret: env.WHITININGS_SECRET,
      redirectUri: env.WHITININGS_REDIRECT_URI!,
    };
    client = new WithingsClient(config);

    // Start up server
    serverReady = new Promise<RequestTokenResponse>((resolve) => {
      resolveServerReady = resolve;
    });

    const app = express();
    app.get("/auth/withings/callback", async (req, res) => {
      const { code } = req.query;
      if (typeof code === "string") {
        const response = await client.auth.fetchAccessToken(code);
        // Here you might want to do something with the response
        // For example, resolve a promise that your test is waiting on
        resolveServerReady(response);
        res.json(response);
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
  });

  it("should be able to refresh the access token", async () => {
    const response = await client.auth.refreshAccessToken();
    expect(response).toEqual({
      status: 0,
      body: {
        userid: expect.any(String),
        access_token: expect.any(String),
        refresh_token: expect.any(String),
        scope: expect.any(String),
        expires_in: expect.any(Number),
        token_type: expect.any(String),
      },
    });
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

    expect(response).toEqual({
      status: 0,
      body: {
        userid: expect.any(String),
        access_token: expect.any(String),
        refresh_token: expect.any(String),
        scope: expect.any(String),
        expires_in: expect.any(Number),
        token_type: expect.any(String),
      },
    });
  }, 30000);
});
