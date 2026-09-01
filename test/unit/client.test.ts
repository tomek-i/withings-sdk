import { WithingsClient } from "../../src/client";
import type { WithingsConfig } from "../../src/types";

describe("WithingsClient", () => {
  describe("constructor", () => {
    it("should throw an error if clientId is missing", () => {
      const config = { clientSecret: "secret", redirectUri: "redirect" };
      expect(() => new WithingsClient(config as unknown as WithingsConfig)).toThrow("clientId is required");
    });

    it("should throw an error if clientSecret is missing", () => {
      const config = { clientId: "id", redirectUri: "redirect" };
      expect(() => new WithingsClient(config as unknown as WithingsConfig)).toThrow("clientSecret is required");
    });

    it("should throw an error if redirectUri is missing", () => {
      const config = { clientId: "id", clientSecret: "secret" };
      expect(() => new WithingsClient(config as unknown as WithingsConfig)).toThrow("redirectUri is required");
    });

    it("should not throw an error if all required properties are present", () => {
      const config = {
        clientId: "id",
        clientSecret: "secret",
        redirectUri: "redirect",
      };
      expect(() => new WithingsClient(config)).not.toThrow();
    });
  });
});
