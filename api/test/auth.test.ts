import { describe, expect, it } from "vitest";
import { argon2id } from "hash-wasm";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import app from "../src/app.js";
import { v4 as uuidv4 } from "uuid";

const deriveAuthKey = async (username: string, password: string) => {
  const seedHex = await argon2id({
    password: password,
    salt: new TextEncoder().encode(username),
    parallelism: 1,
    iterations: 256,
    memorySize: 512,
    hashLength: 32,
    outputType: "hex",
  });

  const seed = new Uint8Array(Buffer.from(seedHex, "hex"));
  const keyPair = nacl.sign.keyPair.fromSeed(seed);

  return {
    publicKey: naclUtil.encodeBase64(keyPair.publicKey),
    secretKey: keyPair.secretKey,
  };
};

describe("Auth API", () => {
  it("challenge", async () => {
    const res = await app.request("/auth/challenge");
    console.log(await res.json());
  });

  it("clear challenge and register new user", async () => {
    const challengeRes = await app.request("/auth/challenge");
    const { challengeId, challenge } = await challengeRes.json();

    const username = uuidv4();
    const password = uuidv4();

    const { publicKey, secretKey } = await deriveAuthKey(username, password);
    console.log("Generated public key:", publicKey);

    const messageBytes = naclUtil.decodeBase64(challenge);
    const signatureBytes = nacl.sign.detached(messageBytes, secretKey);
    const signature = naclUtil.encodeBase64(signatureBytes);
    console.log("Generated signature:", signature);

    const res = await app.request("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicKey,
        signature,
        challengeId,
      }),
    });
    console.log(res.status, await res.json());
    expect(res.status).toBe(201);
  });
});
