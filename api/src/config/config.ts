import "dotenv/config";
import z from "zod";

const ConfigSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
});

const Config = ConfigSchema.parse(process.env);

export default Config;
