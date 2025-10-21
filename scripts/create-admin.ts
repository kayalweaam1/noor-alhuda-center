import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { users } from "../drizzle/schema";
import { nanoid } from "nanoid";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";

const { Pool } = pg;

async function createAdmin() {
  console.log("👤 Creating admin user...");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const db = drizzle(pool);

  try {
    // Check if admin exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.phone, "+972542632557"))
      .limit(1);

    if (existing.length > 0) {
      console.log("ℹ️  Admin user already exists");
      await pool.end();
      return;
    }

    // Hash password
    const hashedPassword = await hash("123456", {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Create admin user
    await db.insert(users).values({
      id: nanoid(),
      phone: "+972542632557",
      password: hashedPassword,
      name: "المدير العام",
      role: "admin",
      isActive: true,
    });

    console.log("✅ Super admin created successfully!");
    console.log("Phone: +972542632557");
    console.log("Password: 123456");

    await pool.end();
  } catch (error) {
    console.error("❌ Failed to create admin:", error);
    await pool.end();
    throw error;
  }
}

createAdmin();
