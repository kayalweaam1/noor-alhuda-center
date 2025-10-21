import { getDb } from "../server/db";
import {
  users,
  teachers,
  students,
  lessons,
  attendance,
  evaluations,
  notifications,
} from "./schema";
import { hashPassword } from "../server/_core/password";

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    return;
  }

  console.log("🌱 Starting database seeding...");

  // Clear existing data
  console.log("Clearing existing data...");
  await db.delete(evaluations);
  await db.delete(attendance);
  await db.delete(lessons);
  await db.delete(students);
  await db.delete(teachers);
  await db.delete(notifications);
  await db.delete(users);

  // Create admin user
  console.log("Creating admin user...");
  const adminPassword = await hashPassword("admin123");
  await db.insert(users).values({
    id: "user_admin_main",
    name: "المدير العام",
    phone: "+972542632557",
    password: adminPassword,
    role: "admin",
    loginMethod: "password",
    createdAt: new Date(),
    lastSignedIn: new Date(),
  });

  // Create teachers
  console.log("Creating teachers...");
  const teacherPassword = await hashPassword("teacher123");

  const teacher1Id = "teacher_1";
  await db.insert(users).values({
    id: `user_${teacher1Id}`,
    name: "أحمد محمود",
    phone: "+972501111111",
    password: teacherPassword,
    role: "teacher",
    loginMethod: "password",
    createdAt: new Date(),
  });

  await db.insert(teachers).values({
    id: teacher1Id,
    userId: `user_${teacher1Id}`,
    halaqaName: "حلقة الصف الثالث",
    specialization: "تحفيظ القرآن الكريم، التجويد",
    createdAt: new Date(),
  });

  const teacher2Id = "teacher_2";
  await db.insert(users).values({
    id: `user_${teacher2Id}`,
    name: "محمد عبدالله",
    phone: "+972502222222",
    password: teacherPassword,
    role: "teacher",
    loginMethod: "password",
    createdAt: new Date(),
  });

  await db.insert(teachers).values({
    id: teacher2Id,
    userId: `user_${teacher2Id}`,
    halaqaName: "حلقة الصف الرابع",
    specialization: "تحفيظ القرآن الكريم، التفسير",
    createdAt: new Date(),
  });

  // Create students
  console.log("Creating students...");
  const studentPassword = await hashPassword("student123");

  const students_data = [
    {
      name: "عمر خالد",
      phone: "+972503333333",
      teacherId: teacher1Id,
      grade: "الصف الثالث",
    },
    {
      name: "فاطمة أحمد",
      phone: "+972504444444",
      teacherId: teacher1Id,
      grade: "الصف الثالث",
    },
    {
      name: "يوسف محمد",
      phone: "+972505555555",
      teacherId: teacher2Id,
      grade: "الصف الرابع",
    },
    {
      name: "مريم علي",
      phone: "+972506666666",
      teacherId: teacher2Id,
      grade: "الصف الرابع",
    },
    {
      name: "خالد عبدالرحمن",
      phone: "+972507777777",
      teacherId: teacher1Id,
      grade: "الصف الثالث",
    },
  ];

  for (let i = 0; i < students_data.length; i++) {
    const student = students_data[i];
    const studentId = `student_${i + 1}`;
    const userId = `user_${studentId}`;

    await db.insert(users).values({
      id: userId,
      name: student.name,
      phone: student.phone,
      password: studentPassword,
      role: "student",
      loginMethod: "password",
      createdAt: new Date(),
    });

    await db.insert(students).values({
      id: studentId,
      userId: userId,
      teacherId: student.teacherId,
      grade: student.grade,
      enrollmentDate: new Date(),
      createdAt: new Date(),
    });
  }

  // Create lessons
  console.log("Creating lessons...");
  const lesson1Id = "lesson_1";
  await db.insert(lessons).values({
    id: lesson1Id,
    teacherId: teacher1Id,
    title: "سورة البقرة - الآيات 1-10",
    description:
      "تحفيظ ومراجعة الآيات الأولى من سورة البقرة مع شرح معاني الكلمات",
    date: new Date(),
    createdAt: new Date(),
  });

  const lesson2Id = "lesson_2";
  await db.insert(lessons).values({
    id: lesson2Id,
    teacherId: teacher2Id,
    title: "سورة آل عمران - الآيات 1-20",
    description: "تحفيظ ومراجعة الآيات الأولى من سورة آل عمران",
    date: new Date(),
    createdAt: new Date(),
  });

  // Create attendance records
  console.log("Creating attendance records...");
  await db.insert(attendance).values([
    {
      id: "attendance_1",
      studentId: "student_1",
      teacherId: teacher1Id,
      date: new Date(),
      status: "present",
      notes: "حضور ممتاز",
      createdAt: new Date(),
    },
    {
      id: "attendance_2",
      studentId: "student_2",
      teacherId: teacher1Id,
      date: new Date(),
      status: "present",
      createdAt: new Date(),
    },
    {
      id: "attendance_3",
      studentId: "student_3",
      teacherId: teacher2Id,
      date: new Date(),
      status: "absent",
      notes: "غياب بعذر",
      createdAt: new Date(),
    },
  ]);

  // Create evaluations
  console.log("Creating evaluations...");
  await db.insert(evaluations).values([
    {
      id: "evaluation_1",
      studentId: "student_1",
      teacherId: teacher1Id,
      lessonId: lesson1Id,
      score: 95,
      feedback: "أداء ممتاز، حفظ متقن",
      evaluationType: "تسميع",
      date: new Date(),
      createdAt: new Date(),
    },
    {
      id: "evaluation_2",
      studentId: "student_2",
      teacherId: teacher1Id,
      lessonId: lesson1Id,
      score: 85,
      feedback: "جيد جداً، يحتاج لمزيد من المراجعة",
      evaluationType: "تسميع",
      date: new Date(),
      createdAt: new Date(),
    },
  ]);

  // Create notifications
  console.log("Creating notifications...");
  await db.insert(notifications).values([
    {
      id: "notification_1",
      userId: "user_admin_main",
      title: "مرحباً بك في نظام مركز نور الهدى",
      message:
        "تم إنشاء حسابك بنجاح. يمكنك الآن إدارة المستخدمين والطلاب والمربين.",
      type: "success",
      isRead: false,
      createdAt: new Date(),
    },
    {
      id: "notification_2",
      userId: "user_teacher_1",
      title: "تم تعيينك كمربي",
      message: "تم تعيينك كمربي في حلقة الصف الثالث",
      type: "info",
      isRead: false,
      createdAt: new Date(),
    },
  ]);

  console.log("✅ Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log("- 1 Admin user");
  console.log("- 2 Teachers");
  console.log("- 5 Students");
  console.log("- 2 Lessons");
  console.log("- 3 Attendance records");
  console.log("- 2 Evaluations");
  console.log("- 2 Notifications");
  console.log("\n🔑 Login credentials:");
  console.log("Admin: +972542632557 / admin123");
  console.log("Teacher: +972501111111 / teacher123");
  console.log("Student: +972503333333 / student123");

  process.exit(0);
}

seed().catch(error => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
