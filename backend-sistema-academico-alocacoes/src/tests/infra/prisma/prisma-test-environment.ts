import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import type { Environment } from "vitest/environments";
import { PrismaClient } from "@prisma/client";

config({ path: resolve(process.cwd(), ".env.test"), override: true });

const prisma = new PrismaClient();

function generateDatabaseUrl(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set("schema", schema);
  return url.toString();
}

export default <Environment>{
  name: "prisma",
  transformMode: "ssr",

  async setup() {
    const schema = randomUUID();
    const databaseUrl = generateDatabaseUrl(schema);
    process.env.DATABASE_URL = databaseUrl;

    // 🟢 Cria o schema temporário e aplica as tabelas
    execSync("npx prisma db push --force-reset --accept-data-loss", {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
      stdio: "inherit",
    });

    return {
      async teardown() {
        try {
          await prisma.$executeRawUnsafe(
            `DROP SCHEMA IF EXISTS "${schema}" CASCADE`
          );
        } catch (error) {
          console.error(`Error dropping schema ${schema}:`, error);
        } finally {
          await prisma.$disconnect();
        }
      },
    };
  },
};
