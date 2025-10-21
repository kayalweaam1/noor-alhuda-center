import { getDb } from "../server/db";
import { users, teachers, students, lessons, attendance, evaluations, notifications, assistants, assistantNotes, otpCodes } from "../drizzle/schema";
import { hashPassword } from "../server/_core/password";

async function resetDatabase() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Failed to connect to database");
    return;
  }

  console.log("🗑️  Clearing database...");

  // حذف جميع البيانات
  await db.delete(evaluations);
  await db.delete(attendance);
  await db.delete(lessons);
  await db.delete(students);
  await db.delete(teachers);
  await db.delete(assistants);
  await db.delete(assistantNotes);
  await db.delete(notifications);
  await db.delete(otpCodes);
  await db.delete(users);

  console.log("✅ Database cleared successfully!");

  // إضافة المدير العام
  console.log("👤 Creating admin user...");
  const adminPassword = await hashPassword("admin123");
  
  await db.insert(users).values({
    id: "user_admin_weaam",
    name: "وئام كيال",
    phone: "0542632557",
    password: adminPassword,
    role: "admin",
    loginMethod: "password",
    createdAt: new Date(),
    lastSignedIn: new Date(),
  });

  console.log("✅ Admin user created successfully!");
  console.log("\n📋 Database Status:");
  console.log("- All tables cleared");
  console.log("- Admin user: وئام كيال");
  console.log("- Phone: 0542632557");
  console.log("- Password: admin123");
  
  process.exit(0);
}

resetDatabase().catch((error) => {
  console.error("❌ Reset failed:", error);
  process.exit(1);
});

