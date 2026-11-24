import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(1),
  HUGGINGFACE_API_KEY: z.string().optional(),
  GEMMA_MODEL: z.string().default('google/gemma-3-4b-it'),
  HUGGINGFACE_BASE_URL: z.string().default('https://router.huggingface.co/v1'),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),
  ELEVENLABS_TTS_MODEL: z.string().default('eleven_multilingual_v2'),
  ELEVENLABS_STT_MODEL: z.string().default('scribe_v2'),
  LEGAL_ASSISTANT_ENABLED: z.enum(['true', 'false']).default('true').transform((value) => value === 'true'),
  LEGAL_ASSISTANT_MAX_MESSAGE_LENGTH: z.coerce.number().int().min(100).max(10_000).default(3000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Print only the failing keys/messages — never environment values.
  const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);
  console.error('Invalid environment configuration:\n' + issues.join('\n'));
  process.exit(1);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGINS.split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

export const isProduction = env.NODE_ENV === 'production';
