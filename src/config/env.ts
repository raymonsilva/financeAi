import dotenv from 'dotenv';
import {z} from 'zod';

dotenv.config();

const envSchema = z.object({
  MONGO_URI: z.string(),
  PORT: z.string().transform(Number).optional(),
});

export const env = envSchema.parse(process.env);