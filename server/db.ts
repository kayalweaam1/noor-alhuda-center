import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  teachers, InsertTeacher, Teacher,
  students, InsertStudent, Student,
  assistants, InsertAssistant, Assistant,
  attendance, InsertAttendance, Attendance,
  lessons, InsertLesson, Lesson,
  evaluations, InsertEvaluation, Evaluation,
  notifications, InsertNotification, Notification,
  otpCodes, InsertOtpCode, OtpCode,
  assistantNotes, InsertAssistantNote, AssistantNote
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER FUNCTIONS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "profileImage", "phone"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.id === ENV.ownerId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    } else {
      // Make first user admin automatically
      const userCount = await db.select({ count: sql`count(*)` }).from(users);
      if (userCount[0]?.count === 0) {
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: string, role: "admin" | "teacher" | "student") {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function updateUserLastSignedIn(userId: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function deleteUser(userId: string) {
  const db = await getDb();
  if (!db) return;

  await db.delete(users).where(eq(users.id, userId));
}

// ============= TEACHER FUNCTIONS =============

export async function createTeacher(teacher: InsertTeacher) {
  const db = await getDb();
  if (!db) return;

  await db.insert(teachers).values(teacher);
}

export async function getTeacher(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTeacherByUserId(userId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllTeachers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: teachers.id,
    userId: teachers.userId,
    halaqaName: teachers.halaqaName,
    specialization: teachers.specialization,
    createdAt: teachers.createdAt,
    userName: users.name,
    userPhone: users.phone,
    userEmail: users.email,
  })
  .from(teachers)
  .leftJoin(users, eq(teachers.userId, users.id))
  .orderBy(desc(teachers.createdAt));
}

export async function updateTeacher(id: string, data: Partial<InsertTeacher>) {
  const db = await getDb();
  if (!db) return;

  await db.update(teachers).set(data).where(eq(teachers.id, id));
}

export async function deleteTeacher(id: string) {
  const db = await getDb();
  if (!db) return;

  await db.delete(teachers).where(eq(teachers.id, id));
}

// ============= STUDENT FUNCTIONS =============

export async function createStudent(student: InsertStudent) {
  const db = await getDb();
  if (!db) return;

  await db.insert(students).values(student);
}

export async function getStudent(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(students).where(eq(students.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentByUserId(userId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(students).where(eq(students.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllStudents() {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: students.id,
    userId: students.userId,
    teacherId: students.teacherId,
    grade: students.grade,
    enrollmentDate: students.enrollmentDate,
    createdAt: students.createdAt,
    userName: users.name,
    userPhone: users.phone,
    userEmail: users.email,
  })
  .from(students)
  .leftJoin(users, eq(students.userId, users.id))
  .orderBy(desc(students.createdAt));
}

export async function getStudentsByTeacher(teacherId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: students.id,
    userId: students.userId,
    teacherId: students.teacherId,
    grade: students.grade,
    enrollmentDate: students.enrollmentDate,
    createdAt: students.createdAt,
    userName: users.name,
    userPhone: users.phone,
    userEmail: users.email,
    userProfileImage: users.profileImage,
  })
  .from(students)
  .leftJoin(users, eq(students.userId, users.id))
  .where(eq(students.teacherId, teacherId))
  .orderBy(desc(students.createdAt));
}

export async function updateStudent(id: string, data: Partial<InsertStudent>) {
  const db = await getDb();
  if (!db) return;

  await db.update(students).set(data).where(eq(students.id, id));
}

export async function deleteStudent(id: string) {
  const db = await getDb();
  if (!db) return;

  await db.delete(students).where(eq(students.id, id));
}

// ============= ATTENDANCE FUNCTIONS =============

export async function createAttendance(record: InsertAttendance) {
  const db = await getDb();
  if (!db) return;

  await db.insert(attendance).values(record);
}

export async function getAttendanceByStudent(studentId: string, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];

  if (startDate && endDate) {
    return await db.select().from(attendance)
      .where(and(
        eq(attendance.studentId, studentId),
        gte(attendance.date, startDate),
        lte(attendance.date, endDate)
      ) as any)
      .orderBy(desc(attendance.date));
  }

  return await db.select().from(attendance)
    .where(eq(attendance.studentId, studentId))
    .orderBy(desc(attendance.date));
}

export async function getAttendanceByTeacher(teacherId: string, date?: Date) {
  const db = await getDb();
  if (!db) return [];

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await db.select({
      id: attendance.id,
      studentId: attendance.studentId,
      teacherId: attendance.teacherId,
      date: attendance.date,
      status: attendance.status,
      notes: attendance.notes,
      createdAt: attendance.createdAt,
      studentName: users.name,
    })
    .from(attendance)
    .leftJoin(students, eq(attendance.studentId, students.id))
    .leftJoin(users, eq(students.userId, users.id))
    .where(and(
      eq(attendance.teacherId, teacherId),
      gte(attendance.date, startOfDay),
      lte(attendance.date, endOfDay)
    ) as any)
    .orderBy(desc(attendance.date));
  }

  return await db.select({
    id: attendance.id,
    studentId: attendance.studentId,
    teacherId: attendance.teacherId,
    date: attendance.date,
    status: attendance.status,
    notes: attendance.notes,
    createdAt: attendance.createdAt,
    studentName: users.name,
  })
  .from(attendance)
  .leftJoin(students, eq(attendance.studentId, students.id))
  .leftJoin(users, eq(students.userId, users.id))
  .where(eq(attendance.teacherId, teacherId))
  .orderBy(desc(attendance.date));
}

export async function getAllAttendance(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];

  if (startDate && endDate) {
    return await db.select({
      id: attendance.id,
      studentId: attendance.studentId,
      teacherId: attendance.teacherId,
      date: attendance.date,
      status: attendance.status,
      notes: attendance.notes,
      createdAt: attendance.createdAt,
      studentName: users.name,
    })
    .from(attendance)
    .leftJoin(students, eq(attendance.studentId, students.id))
    .leftJoin(users, eq(students.userId, users.id))
    .where(and(
      gte(attendance.date, startDate),
      lte(attendance.date, endDate)
    ) as any)
    .orderBy(desc(attendance.date));
  }

  return await db.select({
    id: attendance.id,
    studentId: attendance.studentId,
    teacherId: attendance.teacherId,
    date: attendance.date,
    status: attendance.status,
    notes: attendance.notes,
    createdAt: attendance.createdAt,
    studentName: users.name,
  })
  .from(attendance)
  .leftJoin(students, eq(attendance.studentId, students.id))
  .leftJoin(users, eq(students.userId, users.id))
  .orderBy(desc(attendance.date));
}

export async function updateAttendance(id: string, data: Partial<InsertAttendance>) {
  const db = await getDb();
  if (!db) return;

  await db.update(attendance).set(data).where(eq(attendance.id, id));
}

export async function deleteAttendance(id: string) {
  const db = await getDb();
  if (!db) return;

  await db.delete(attendance).where(eq(attendance.id, id));
}

// ============= LESSON FUNCTIONS =============

export async function createLesson(lesson: InsertLesson) {
  const db = await getDb();
  if (!db) return;

  await db.insert(lessons).values(lesson);
}

export async function getLesson(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLessonsByTeacher(teacherId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(lessons)
    .where(eq(lessons.teacherId, teacherId))
    .orderBy(desc(lessons.date));
}

export async function getAllLessons() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(lessons).orderBy(desc(lessons.date));
}

export async function updateLesson(id: string, data: Partial<InsertLesson>) {
  const db = await getDb();
  if (!db) return;

  await db.update(lessons).set(data).where(eq(lessons.id, id));
}

export async function deleteLesson(id: string) {
  const db = await getDb();
  if (!db) return;

  await db.delete(lessons).where(eq(lessons.id, id));
}

// ============= EVALUATION FUNCTIONS =============

export async function createEvaluation(evaluation: InsertEvaluation) {
  const db = await getDb();
  if (!db) return;

  await db.insert(evaluations).values(evaluation);
}

export async function getEvaluation(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(evaluations).where(eq(evaluations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEvaluationsByStudent(studentId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(evaluations)
    .where(eq(evaluations.studentId, studentId))
    .orderBy(desc(evaluations.date));
}

export async function getEvaluationsByTeacher(teacherId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: evaluations.id,
    studentId: evaluations.studentId,
    teacherId: evaluations.teacherId,
    lessonId: evaluations.lessonId,
    score: evaluations.score,
    feedback: evaluations.feedback,
    evaluationType: evaluations.evaluationType,
    date: evaluations.date,
    createdAt: evaluations.createdAt,
    studentName: users.name,
  })
  .from(evaluations)
  .leftJoin(students, eq(evaluations.studentId, students.id))
  .leftJoin(users, eq(students.userId, users.id))
  .where(eq(evaluations.teacherId, teacherId))
  .orderBy(desc(evaluations.date));
}

export async function getAllEvaluations() {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: evaluations.id,
    studentId: evaluations.studentId,
    teacherId: evaluations.teacherId,
    lessonId: evaluations.lessonId,
    score: evaluations.score,
    feedback: evaluations.feedback,
    evaluationType: evaluations.evaluationType,
    date: evaluations.date,
    createdAt: evaluations.createdAt,
    studentName: users.name,
  })
  .from(evaluations)
  .leftJoin(students, eq(evaluations.studentId, students.id))
  .leftJoin(users, eq(students.userId, users.id))
  .orderBy(desc(evaluations.date));
}

export async function updateEvaluation(id: string, data: Partial<InsertEvaluation>) {
  const db = await getDb();
  if (!db) return;

  await db.update(evaluations).set(data).where(eq(evaluations.id, id));
}

export async function deleteEvaluation(id: string) {
  const db = await getDb();
  if (!db) return;

  await db.delete(evaluations).where(eq(evaluations.id, id));
}

// ============= NOTIFICATION FUNCTIONS =============

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) return;

  await db.insert(notifications).values(notification);
}

export async function getNotificationsByUser(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function deleteNotification(id: string) {
  const db = await getDb();
  if (!db) return;

  await db.delete(notifications).where(eq(notifications.id, id));
}

// ============= OTP FUNCTIONS =============

export async function createOtpCode(otp: InsertOtpCode) {
  const db = await getDb();
  if (!db) return;

  await db.insert(otpCodes).values(otp);
}

export async function getValidOtpCode(phone: string, code: string) {
  const db = await getDb();
  if (!db) return undefined;

  const now = new Date();
  const result = await db.select().from(otpCodes)
    .where(and(
      eq(otpCodes.phone, phone),
      eq(otpCodes.code, code),
      eq(otpCodes.verified, false),
      gte(otpCodes.expiresAt, now)
    ) as any)
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function markOtpAsVerified(id: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(otpCodes).set({ verified: true }).where(eq(otpCodes.id, id));
}

// ============= STATISTICS FUNCTIONS =============

export async function getStatistics() {
  const db = await getDb();
  if (!db) return null;

  const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [totalTeachers] = await db.select({ count: sql<number>`count(*)` }).from(teachers);
  const [totalStudents] = await db.select({ count: sql<number>`count(*)` }).from(students);
  const [totalLessons] = await db.select({ count: sql<number>`count(*)` }).from(lessons);

  return {
    totalUsers: totalUsers.count,
    totalTeachers: totalTeachers.count,
    totalStudents: totalStudents.count,
    totalLessons: totalLessons.count,
  };
}


// ============= ASSISTANT NOTES FUNCTIONS =============

export async function createAssistantNote(note: InsertAssistantNote): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(assistantNotes).values(note);
}

export async function getAssistantNotesByAssistant(assistantId: string) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: assistantNotes.id,
      assistantId: assistantNotes.assistantId,
      teacherId: assistantNotes.teacherId,
      teacherName: users.name,
      teacherPhone: users.phone,
      title: assistantNotes.title,
      content: assistantNotes.content,
      rating: assistantNotes.rating,
      isRead: assistantNotes.isRead,
      createdAt: assistantNotes.createdAt,
    })
    .from(assistantNotes)
    .leftJoin(teachers, eq(assistantNotes.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id))
    .where(eq(assistantNotes.assistantId, assistantId))
    .orderBy(desc(assistantNotes.createdAt));

  return result;
}

export async function getAssistantNotesByTeacher(teacherId: string) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(assistantNotes)
    .where(eq(assistantNotes.teacherId, teacherId))
    .orderBy(desc(assistantNotes.createdAt));

  return result;
}

export async function markAssistantNoteAsRead(noteId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(assistantNotes).set({ isRead: true }).where(eq(assistantNotes.id, noteId));
}

export async function deleteAssistantNote(noteId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(assistantNotes).where(eq(assistantNotes.id, noteId));
}

// ============= ASSISTANT MANAGEMENT FUNCTIONS =============

export async function createAssistant(assistant: InsertAssistant): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(assistants).values(assistant);
}

export async function getAssistantById(assistantId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      id: assistants.id,
      userId: assistants.userId,
      userName: users.name,
      userPhone: users.phone,
      userEmail: users.email,
      halaqaName: assistants.halaqaName,
      createdAt: assistants.createdAt,
    })
    .from(assistants)
    .leftJoin(users, eq(assistants.userId, users.id))
    .where(eq(assistants.id, assistantId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAssistantByUserId(userId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      id: assistants.id,
      userId: assistants.userId,
      userName: users.name,
      userPhone: users.phone,
      userEmail: users.email,
      halaqaName: assistants.halaqaName,
      createdAt: assistants.createdAt,
    })
    .from(assistants)
    .leftJoin(users, eq(assistants.userId, users.id))
    .where(eq(assistants.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllAssistants() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: assistants.id,
      userId: assistants.userId,
      userName: users.name,
      userPhone: users.phone,
      userEmail: users.email,
      halaqaName: assistants.halaqaName,
      createdAt: assistants.createdAt,
    })
    .from(assistants)
    .leftJoin(users, eq(assistants.userId, users.id))
    .orderBy(desc(assistants.createdAt));
}

export async function getAssistantsByHalaqa(halaqaName: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: assistants.id,
      userId: assistants.userId,
      userName: users.name,
      userPhone: users.phone,
      halaqaName: assistants.halaqaName,
    })
    .from(assistants)
    .leftJoin(users, eq(assistants.userId, users.id))
    .where(eq(assistants.halaqaName, halaqaName))
    .orderBy(desc(assistants.createdAt));
}

export async function updateAssistant(id: string, data: Partial<InsertAssistant>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(assistants).set(data).where(eq(assistants.id, id));
}

export async function deleteAssistant(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(assistants).where(eq(assistants.id, id));
}



// ============= INITIALIZATION =============

export async function createDefaultAdmin(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create default admin: database not available");
    return;
  }

  try {
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.phone, '+972542632557'))
      .limit(1);

    if (existingAdmin.length > 0) {
      // Check if admin has password
      if (existingAdmin[0].password) {
        console.log("[Database] Default admin already exists with password");
        return;
      }
      // Delete old admin without password
      console.log("[Database] Deleting old admin without password...");
      await db.delete(users).where(eq(users.phone, '+972542632557'));
    }

    // Hash the password
    const { hashPassword } = await import('./_core/password');
    const hashedPassword = await hashPassword('123456');

    // Create default admin
    await db.insert(users).values({
      id: 'admin_1',
      phone: '+972542632557',
      password: hashedPassword,
      name: 'المدير العام',
      role: 'admin',
      loginMethod: 'password',
    });

    console.log("✅ Default admin created successfully!");
    console.log("Phone: +972542632557 or 0542632557");
    console.log("Password: 123456");
  } catch (error) {
    console.error("[Database] Error creating default admin:", error);
  }
}



export async function updateUserPassword(userId: string, password: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ password }).where(eq(users.id, userId));
}

