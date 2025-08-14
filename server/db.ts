import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { config } from '../config.js';

neonConfig.webSocketConstructor = ws;

export const pool = new Pool({ connectionString: config.database.url });

console.log("db ts database url", config.database.url);
export const db = drizzle({ client: pool, schema });