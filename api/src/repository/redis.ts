import { Redis } from "ioredis";
import Config from "../config/config.js";

export class RedisClient {
  protected redis: Redis;

  constructor(redisUrl: string) {
    const _redisUrl = new URL(redisUrl);
    const [host, port] = [_redisUrl.hostname, Number(_redisUrl.port)];
    this.redis = new Redis({
      host: host,
      port: port,
    });
  }
}

export class UserChallenge extends RedisClient {
  private readonly PREFIX = "auth:challenge:";
  private readonly DEFAULT_TTL = 300;

  constructor(redisUrl: string) {
    super(redisUrl);
  }

  async saveChallenge(challengeId: string, nonce: string): Promise<void> {
    const key = this.getKey(challengeId);
    await this.redis.set(key, nonce, "EX", this.DEFAULT_TTL);
  }

  async useChallenge(challengeId: string): Promise<string | null> {
    const key = this.getKey(challengeId);

    const pipeline = this.redis.multi();
    pipeline.get(key);
    pipeline.del(key);

    const results = await pipeline.exec();

    if (results && !results[0][0]) {
      const nonce = results[0][1] as string | null;
      return nonce;
    }

    return null;
  }

  private getKey(id: string): string {
    return `${this.PREFIX}${id}`;
  }
}

export const userChallenge = new UserChallenge(Config.REDIS_URL);
