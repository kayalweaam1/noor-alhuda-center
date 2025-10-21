import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { sql } from "drizzle-orm";

const { Pool } = pg;

async function runMigration() {
  console.log("🔧 Starting database migration...");

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
    console.log("📊 Creating tables...");

    // Create all tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        password TEXT,
        "loginMethod" TEXT,
        role TEXT DEFAULT 'student' NOT NULL,
        "profileImage" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "lastSignedIn" TIMESTAMP DEFAULT NOW(),
        "isActive" BOOLEAN DEFAULT true
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        "halaqaName" TEXT,
        specialization TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        "teacherId" TEXT REFERENCES teachers(id) ON DELETE SET NULL,
        grade TEXT,
        "enrollmentDate" TIMESTAMP DEFAULT NOW(),
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS assistants (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        "halaqaName" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        "studentId" TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        "teacherId" TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
        date TIMESTAMP NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        "teacherId" TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS evaluations (
        id TEXT PRIMARY KEY,
        "studentId" TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        "teacherId" TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
        "lessonId" TEXT REFERENCES lessons(id) ON DELETE SET NULL,
        score INTEGER NOT NULL,
        feedback TEXT,
        "evaluationType" TEXT,
        date TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info' NOT NULL,
        "isRead" BOOLEAN DEFAULT false NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "otpCodes" (
        id TEXT PRIMARY KEY,
        phone TEXT NOT NULL,
        code TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT false NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "assistantNotes" (
        id TEXT PRIMARY KEY,
        "assistantId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "teacherId" TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        rating INTEGER,
        "isRead" BOOLEAN DEFAULT false NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Tables created successfully!");

    await pool.end();
    console.log("🎉 Migration completed!");
  } catch (error: any) {
    if (error.code === "42P07") {
      console.log("ℹ️  Tables already exist, skipping creation");
    } else {
      console.error("❌ Migration failed:", error);
      throw error;
    }
    await pool.end();
  }
}

runMigration().catch(console.error);
