import { describe, expect, it } from "vitest";
import Config from "../src/config/config.js";
import { RedisClient, UserChallenge } from "../src/repository/redis.js";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import { v4 as uuidv4 } from "uuid";

describe("Redis", () => {
  it("Connect to Redis server", async () => {
    const r = new RedisClient(Config.REDIS_URL);
  });

  it("Save and consume challenge", async () => {
    const _nonce = nacl.randomBytes(32);
    const _nonceString = naclUtil.encodeBase64(_nonce);
    const challengeId = uuidv4();

    const uc = new UserChallenge(Config.REDIS_URL);
    await expect(
      uc.saveChallenge(challengeId, _nonceString)
    ).resolves.toBeUndefined();

    await expect(uc.useChallenge(challengeId)).resolves.toBeTypeOf("string");
  });
});
