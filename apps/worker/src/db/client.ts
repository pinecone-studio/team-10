import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export interface WorkerEnv {
  DB: D1Database;
  CLERK_ISSUER?: string;
  CLERK_JWKS_URL?: string;
  SYSTEM_ADMIN_EMAILS?: string;
  ORG_EMAIL_DOMAIN?: string;
  ENABLE_DEV_AUTH_HEADERS?: string;
}

export const getDb = (env: WorkerEnv) => drizzle(env.DB, { schema });
