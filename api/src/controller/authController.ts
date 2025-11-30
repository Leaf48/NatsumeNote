import type { Context } from "hono";
import { prisma } from "../repository/db.js";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { userChallenge } from "../repository/redis.js";

export const challenge = async (c: Context) => {
  const challengeId = uuidv4();

  const nonceBytes = nacl.randomBytes(32);
  const nonceString = naclUtil.encodeBase64(nonceBytes);

  await userChallenge.saveChallenge(challengeId, nonceString);

  return c.json({ challengeId: challengeId, challenge: nonceString }, 200);
};

export const register = async (c: Context) => {
  try {
    const { publicKey, signature, challengeId } = await c.req.json();

    if (!publicKey || !signature || !challengeId) {
      return c.json(
        {
          error: "PublicKey, signature and challengeId are required",
        },
        400
      );
    }

    const challenge = await userChallenge.useChallenge(challengeId);
    if (!challenge) {
      return c.json(
        {
          error: "Challenge not found",
        },
        400
      );
    }

    // validate signature
    try {
      const publicKeyBytes = naclUtil.decodeBase64(publicKey);
      if (publicKeyBytes.length !== 32) {
        return c.json({ error: "Invalid public key format" }, 400);
      }

      const messageBytes = naclUtil.decodeBase64(challenge);
      const signatureBytes = naclUtil.decodeBase64(signature);
      const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      );

      if (!isValid) {
        return c.json({ error: "Invalid signature" }, 401);
      }
    } catch (error) {
      return c.json({ error: "Malformed format" }, 400);
    }

    const user = await prisma.user.create({
      data: {
        id: publicKey,
      },
    });

    return c.json({ message: "User registered", userId: user.id }, 201);
  } catch (e) {
    console.log(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return c.json({ error: "User already exists" }, 400);
      }
    }

    return c.json({ error: "Internal Server Error" }, 500);
  }
};
