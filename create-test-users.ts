import { db } from "./server/db";
import { users, teachers, students } from "./drizzle/schema";
import { hashPassword } from "./server/_core/password";

async function createTestUsers() {
  try {
    // Create teacher user
    const teacherPassword = await hashPassword("123456");
    const [teacherUser] = await db.insert(users).values({
      phone: "+972501234567",
      password: teacherPassword,
      name: "مربي تجريبي",
      role: "teacher",
    }).returning();
    
    console.log("✅ Teacher user created:", teacherUser);
    
    // Create teacher profile
    await db.insert(teachers).values({
      userId: teacherUser.id,
      specialization: "تحفيظ",
    });
    
    console.log("✅ Teacher profile created");
    
    // Create student user
    const studentPassword = await hashPassword("123456");
    const [studentUser] = await db.insert(users).values({
      phone: "+972509876543",
      password: studentPassword,
      name: "طالب تجريبي",
      role: "student",
    }).returning();
    
    console.log("✅ Student user created:", studentUser);
    
    // Create student profile
    await db.insert(students).values({
      userId: studentUser.id,
      grade: "الصف الثالث",
      teacherId: teacherUser.id,
    });
    
    console.log("✅ Student profile created");
    
    console.log("\n📋 Test Users:");
    console.log("Teacher: +972501234567 / 123456");
    console.log("Student: +972509876543 / 123456");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createTestUsers();
