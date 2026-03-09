import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export interface WorkerEnv {
  DB: D1Database;
}

export const getDb = (env: WorkerEnv) => drizzle(env.DB, { schema });
