import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(1).default('change-me-in-production-please'),
  ATTOM_API_KEY: z.string().default(''),
  MAPBOX_TOKEN: z.string().default(''),
  TWILIO_ACCOUNT_SID: z.string().default(''),
  TWILIO_AUTH_TOKEN: z.string().default(''),
  TWILIO_PHONE_NUMBER: z.string().default(''),
  TRACERFY_API_KEY: z.string().default(''),
  BATCHDATA_API_KEY: z.string().default(''),
  PORT: z.string().default('3001').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  USE_MOCK: z.string().default('true').transform(v => v === 'true'),
});

export const env = envSchema.parse(process.env);
