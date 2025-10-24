import { upsertUser, createTeacher, createStudent } from "./db";
import { hashPassword } from "./_core/password";

export async function createTestUsers() {
  try {
    // Create teacher user
    const teacherPassword = await hashPassword("123456");
    const teacherUser = {
      id: crypto.randomUUID(),
      phone: "+972501234567",
      password: teacherPassword,
      name: "مربي تجريبي",
      role: "teacher" as const,
      createdAt: new Date(),
      lastSignedIn: new Date(),
    };
    
    await upsertUser(teacherUser);
    console.log("✅ Teacher user created");
    
    // Create teacher profile
    await createTeacher({
      id: crypto.randomUUID(),
      userId: teacherUser.id,
      specialization: "تحفيظ",
      halaqaName: "حلقة تجريبية",
      createdAt: new Date(),
    });
    
    console.log("✅ Teacher profile created");
    
    // Create student user
    const studentPassword = await hashPassword("123456");
    const studentUser = {
      id: crypto.randomUUID(),
      phone: "+972509876543",
      password: studentPassword,
      name: "طالب تجريبي",
      role: "student" as const,
      createdAt: new Date(),
      lastSignedIn: new Date(),
    };
    
    await upsertUser(studentUser);
    console.log("✅ Student user created");
    
    // Create student profile
    await createStudent({
      id: crypto.randomUUID(),
      userId: studentUser.id,
      grade: "الصف الثالث",
      teacherId: teacherUser.id,
      createdAt: new Date(),
    });
    
    console.log("✅ Student profile created");
    
    return {
      success: true,
      teacher: { phone: "+972501234567", password: "123456" },
      student: { phone: "+972509876543", password: "123456" },
    };
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

