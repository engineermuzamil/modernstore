import { defineConfig } from "drizzle-kit";

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/shopsphere';

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
