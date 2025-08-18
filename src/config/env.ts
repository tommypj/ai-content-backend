// config/env.ts
import { z } from "zod";

const Env = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.string().default("8080"),
  MONGO_URI: z.string().url(),
  JWT_SECRET: z.string().min(24),
  JWT_REFRESH_SECRET: z.string().min(24),
  GEMINI_API_KEY: z.string(),
  CORS_ORIGINS: z.string().optional(),
});

export const env = Env.parse(process.env);
