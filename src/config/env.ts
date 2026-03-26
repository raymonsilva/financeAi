import dotenv from 'dotenv';
import {z} from 'zod';

dotenv.config();

const envSchema = z.object({
  MONGO_URI: z.string().min(1),
  PORT: z.coerce.number().optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter no minimo 32 caracteres.'),
  ADMIN_EMAIL: z.string().email().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().optional(),
});

export const env = envSchema.parse(process.env);