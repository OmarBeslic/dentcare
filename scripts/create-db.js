const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌  .env.local not found. Create it first.");
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = val;
    }
  }
}

async function createDatabase() {
  loadEnv();

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌  DATABASE_URL not set in .env.local");
    process.exit(1);
  }

  const parsed = new URL(url);
  const dbName = parsed.pathname.replace("/", "");
  const adminUrl = url.replace(parsed.pathname, "/postgres");

  const client = new Client({ connectionString: adminUrl });

  try {
    await client.connect();
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    if (res.rowCount > 0) {
      console.log(`✅  Database "${dbName}" already exists — skipping.`);
    } else {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅  Database "${dbName}" created successfully.`);
    }
  } catch (err) {
    console.error("❌  Failed to create database:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
