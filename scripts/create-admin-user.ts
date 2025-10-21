import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "../drizzle/schema";
import * as bcrypt from "bcryptjs";

async function createAdminUser() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("🔗 Connecting to database...");

  const connection = await mysql.createConnection(connectionString);
  const db = drizzle(connection);

  console.log("🔐 Hashing password...");
  const hashedPassword = await bcrypt.hash("123456", 10);

  console.log("👤 Creating admin user...");

  try {
    await db.insert(users).values({
      name: "المدير العام",
      phone: "0542632557",
      password: hashedPassword,
      loginMethod: "password",
      role: "admin",
      createdAt: new Date(),
      lastSignedIn: new Date(),
    });

    console.log("✅ Admin user created successfully!");
    console.log("📱 Phone: 0542632557");
    console.log("🔑 Password: 123456");
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      console.log("ℹ️  Admin user already exists");
    } else {
      console.error("❌ Error creating admin user:", error);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

createAdminUser().catch(console.error);
