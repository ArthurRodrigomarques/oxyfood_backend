import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  PORT: z.coerce.number().default(3333),

  JWT_SECRET: z.string(),

  MP_ACCESS_TOKEN: z.string().optional(),

  FRONTEND_URL: z.string().url(),
  API_URL: z.string().url(),

  ASAAS_API_URL: z.string().optional(),
  ASAAS_API_KEY: z.string().optional(),

  CRON_SECRET: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  UPLOADTHING_TOKEN: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  DATABASE_URL: z.string(),
  DIRECT_URL: z.string().optional(),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASS: z.string().optional(),
  REDIS_URL: z.string(),

  EVOLUTION_API_URL: z.string().url(),
  EVOLUTION_API_KEY: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error("❌ Invalid environment variables", _env.error.format());
  throw new Error("Invalid environment variables.");
}

export const env = _env.data;
