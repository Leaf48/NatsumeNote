import { describe, expect, it } from "vitest";
import Config from "../src/config/config.js";

describe("Config Test", () => {
  it("Load env", () => {
    expect(Config.DATABASE_URL).not.toBe(undefined);
    expect(Config.REDIS_URL).not.toBe(undefined);
  });
});
