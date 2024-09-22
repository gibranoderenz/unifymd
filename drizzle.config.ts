import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "src/app/drizzle/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
