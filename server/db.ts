import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
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
  assistantNotes, InsertAssistantNote, AssistantNote,
  appSettings, InsertAppSettings, AppSettings
} from "../drizzle/schema";
import { ENV } from './_core/env';

// Normalize phone numbers - remove international format, keep local format only
function normalizePhoneNumber(rawPhone: string | undefined): string | undefined {
  if (!rawPhone) return undefined;
  let phone = rawPhone.trim();
  // Remove +972 prefix if exists
  if (phone.startsWith("+972")) {
    phone = "0" + phone.substring(4);
  } else if (phone.startsWith("972")) {
    phone = "0" + phone.substring(3);
  }
  // Ensure it starts with 0
  if (!phone.startsWith("0")) {
    phone = "0" + phone;
  }
  return phone;
}

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

function parseMysqlUrl(url?: string):
  | { host: string; port?: number; user?: string; password?: string; database?: string }
  | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    const dbName = u.pathname?.replace(/^\//, "");
    return {
      host: u.hostname,
      port: u.port ? Number(u.port) : undefined,
      user: u.username ? decodeURIComponent(u.username) : undefined,
      password: u.password ? decodeURIComponent(u.password) : undefined,
      database: dbName || undefined,
    };
  } catch {
    return undefined;
  }
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (_db) return _db;

  const connectionUrl = ENV.databaseUrl || process.env.DATABASE_URL;
  if (!connectionUrl) return null;

  try {
    if (!_pool) {
      const opts = parseMysqlUrl(connectionUrl);
      if (!opts?.host || !opts?.user || !opts?.database) {
        throw new Error("Invalid DATABASE_URL for MySQL");
      }

      _pool = mysql.createPool({
        host: opts.host,
        port: opts.port ?? 3306,
        user: opts.user,
        password: opts.password,
        database: opts.database,
        connectionLimit: 10,
        waitForConnections: true,
      });
    }

    _db = drizzle(_pool);
  } catch (error) {
    console.warn("[Database] Failed to connect:", error);
    _db = null;
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
    // Build the values object for insert
    const values: any = {
      id: user.id,
    };
    
    // Build the update set for duplicate key update
    const updateSet: Record<string, unknown> = {};

    // Handle text fields
    if (user.name !== undefined) {
      values.name = user.name;
      updateSet.name = user.name;
    }
    if (user.email !== undefined) {
      values.email = user.email;
      updateSet.email = user.email;
    }
    if (user.phone !== undefined) {
      const normalized = normalizePhoneNumber(user.phone);
      values.phone = normalized;
      updateSet.phone = normalized;
    }
    // Auto-generate username if not provided
    if (user.username !== undefined) {
      // Check if username is already taken by another user
      const existingUser = await getUserByUsername(user.username);
      if (existingUser && existingUser.id !== user.id) {
        throw new Error(`Username '${user.username}' is already taken`);
      }
      values.username = user.username;
      updateSet.username = user.username;
    } else if (!user.username && user.name) {
      // Generate unique username from name
      let attempt = 0;
      let isUnique = false;
      let generatedUsername = '';
      
      while (!isUnique && attempt < 10) {
        const baseUsername = user.name.trim().split(/\s+/)[0]; // First word only
        const randomSuffix = Math.floor(Math.random() * 1000);
        generatedUsername = baseUsername + randomSuffix;
        
        const existingUser = await getUserByUsername(generatedUsername);
        if (!existingUser || existingUser.id === user.id) {
          isUnique = true;
        } else {
          attempt++;
        }
      }
      
      values.username = generatedUsername;
    } else if (!user.username && user.phone) {
      // Generate username from phone (normalized)
      const cleanPhone = user.phone.replace(/\D/g, '');
      const normalizedPhone = cleanPhone.startsWith('972') ? '0' + cleanPhone.substring(3) : cleanPhone;
      values.username = normalizedPhone;
    }
    if (user.password !== undefined) {
      values.password = user.password;
      updateSet.password = user.password;
    }
    if (user.loginMethod !== undefined) {
      values.loginMethod = user.loginMethod;
      updateSet.loginMethod = user.loginMethod;
    }
    if (user.profileImage !== undefined) {
      values.profileImage = user.profileImage;
      updateSet.profileImage = user.profileImage;
    }
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    // Handle role - MUST be set for insert (required field)
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
      } else {
        // Default role for new users
        values.role = 'student';
        updateSet.role = 'student';
      }
    }

    // Ensure we have something to update if duplicate key
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    console.log('[Database] Upserting user with values:', { 
      id: values.id, 
      phone: values.phone, 
      role: values.role,
      hasPassword: !!values.password 
    });

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
    
    console.log('[Database] User upserted successfully');
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

  // Don't normalize phone anymore - use as-is
  const result = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
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

  // Convert undefined/empty string to null for optional fields
  const studentData = {
    ...student,
    teacherId: student.teacherId && student.teacherId.trim() !== '' ? student.teacherId : null,
    specialization: student.specialization && student.specialization.trim() !== '' ? student.specialization : null,
  };

  await db.insert(students).values(studentData);
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
  if (result.length === 0) return undefined;
  
  const student = result[0];
  
  // Get teacher name if teacherId exists
  if (student.teacherId) {
    const teacher = await getTeacher(student.teacherId);
    if (teacher) {
      const teacherUser = await getUser(teacher.userId);
      return {
        ...student,
        teacherName: teacherUser?.name || 'غير محدد'
      };
    }
  }
  
  return student;
}

export async function getAllStudents() {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: students.id,
    userId: students.userId,
    teacherId: students.teacherId,
    grade: students.grade,
    specialization: students.specialization,
    enrollmentDate: students.enrollmentDate,
    hasPaid: students.hasPaid,
    createdAt: students.createdAt,
    userName: users.name,
    userPhone: users.phone,
    userEmail: users.email,
    teacherName: sql<string>`teacher_user.name`,
  })
  .from(students)
  .leftJoin(users, eq(students.userId, users.id))
  .leftJoin(teachers, eq(students.teacherId, teachers.id))
  .leftJoin(sql`users AS teacher_user`, eq(sql`teachers.userId`, sql`teacher_user.id`))
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
    specialization: students.specialization,
    enrollmentDate: students.enrollmentDate,
    hasPaid: students.hasPaid,
    createdAt: students.createdAt,
    userName: users.name,
    userPhone: users.phone,
    userEmail: users.email,
    userProfileImage: users.profileImage,
    teacherName: sql<string>`teacher_user.name`,
  })
  .from(students)
  .leftJoin(users, eq(students.userId, users.id))
  .leftJoin(teachers, eq(students.teacherId, teachers.id))
  .leftJoin(sql`users AS teacher_user`, eq(sql`teachers.userId`, sql`teacher_user.id`))
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

export async function getAttendanceRatesByStudent(): Promise<Array<{ studentId: string; totalCount: number; presentCount: number }>> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      studentId: attendance.studentId,
      totalCount: sql<number>`count(*)`,
      presentCount: sql<number>`sum(case when ${attendance.status} = 'present' then 1 else 0 end)`,
    })
    .from(attendance)
    .groupBy(attendance.studentId);

  return rows as Array<{ studentId: string; totalCount: number; presentCount: number }>;
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
    evaluationType: evaluations.evaluationType,
    score: evaluations.score,
    feedback: evaluations.feedback,
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

  const result = await db.select().from(otpCodes)
    .where(and(
      eq(otpCodes.phone, phone),
      eq(otpCodes.code, code),
      eq(otpCodes.verified, false),
      gte(otpCodes.expiresAt, new Date())
    ) as any)
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function markOtpAsVerified(id: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(otpCodes).set({ verified: true }).where(eq(otpCodes.id, id));
}

// ============= ASSISTANT FUNCTIONS =============

export async function createAssistant(assistant: InsertAssistant) {
  const db = await getDb();
  if (!db) return;

  await db.insert(assistants).values(assistant);
}

export async function getAssistant(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(assistants).where(eq(assistants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAssistantByUserId(userId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      id: assistants.id,
      userId: assistants.userId,
      halaqaName: assistants.halaqaName,
      createdAt: assistants.createdAt,
      userName: users.name,
    })
    .from(assistants)
    .leftJoin(users, eq(assistants.userId, users.id))
    .where(eq(assistants.userId, userId))
    .limit(1);

  return result.length > 0 ? (result[0] as any) : undefined;
}

export async function getAllAssistants() {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: assistants.id,
    userId: assistants.userId,
    halaqaName: assistants.halaqaName,
    createdAt: assistants.createdAt,
    userName: users.name,
    userPhone: users.phone,
    userEmail: users.email,
  })
  .from(assistants)
  .leftJoin(users, eq(assistants.userId, users.id))
  .orderBy(desc(assistants.createdAt));
}

export async function updateAssistant(id: string, data: Partial<InsertAssistant>) {
  const db = await getDb();
  if (!db) return;

  await db.update(assistants).set(data).where(eq(assistants.id, id));
}

export async function deleteAssistant(id: string) {
  const db = await getDb();
  if (!db) return;

  await db.delete(assistants).where(eq(assistants.id, id));
}

// ============= ASSISTANT NOTE FUNCTIONS =============

export async function createAssistantNote(note: InsertAssistantNote) {
  const db = await getDb();
  if (!db) return;

  await db.insert(assistantNotes).values(note);
}

// NOTE: Deprecated legacy function removed (student-based assistant notes)

export async function getAssistantNotesByAssistant(assistantId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: assistantNotes.id,
      assistantId: assistantNotes.assistantId,
      teacherId: assistantNotes.teacherId,
      title: assistantNotes.title,
      content: assistantNotes.content,
      rating: assistantNotes.rating,
      isRead: assistantNotes.isRead,
      createdAt: assistantNotes.createdAt,
      teacherName: users.name,
    })
    .from(assistantNotes)
    .leftJoin(teachers, eq(assistantNotes.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id))
    .where(eq(assistantNotes.assistantId, assistantId))
    .orderBy(desc(assistantNotes.createdAt));
}

export async function updateAssistantNote(id: string, data: Partial<InsertAssistantNote>) {
  const db = await getDb();
  if (!db) return;

  await db.update(assistantNotes).set(data).where(eq(assistantNotes.id, id));
}

export async function deleteAssistantNote(id: string) {
  const db = await getDb();
  if (!db) return;

  await db.delete(assistantNotes).where(eq(assistantNotes.id, id));
}

// ============= ADMIN SETUP =============

export async function createDefaultAdmin() {
  const adminPhone = '0542632557'; // Use normalized phone without +972
  const adminUser = await getUserByPhone(adminPhone);
  
  if (!adminUser) {
    const { hashPassword } = await import('./_core/password');
    const hashedPassword = await hashPassword('123456');
    
    await upsertUser({
      id: `user_admin_${Date.now()}`,
      name: 'وئام كيال',
      username: 'admin',
      phone: adminPhone,
      password: hashedPassword,
      role: 'admin',
      loginMethod: 'password',
    });
    console.log('[Database] Default admin created successfully (phone: 0542632557, pass: 123456)');
  } else {
    console.log('[Database] Default admin already exists');
  }
}

export async function updateUser(userId: string, data: Partial<{
  name: string;
  email: string;
  phone: string;
  profileImage: string;
}>) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function updateUserPassword(userId: string, password: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ password }).where(eq(users.id, userId));
}


// Danger: permanently wipes data and creates a single admin account
export async function resetDatabaseForAdmin(phoneRaw: string, plainPassword: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Normalize phone to +972 format used in the system
  let phone = phoneRaw.trim();
  if (phone.startsWith('0')) {
    phone = '+972' + phone.substring(1);
  } else if (!phone.startsWith('+')) {
    phone = '+972' + phone;
  }

  // Wipe tables in safe dependency order
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

  // Create the single admin user
  const { hashPassword } = await import('./_core/password');
  const hashedPassword = await hashPassword(plainPassword);

  await upsertUser({
    id: `user_admin_${Date.now()}`,
    name: 'وئام كيال',
    phone,
    password: hashedPassword,
    role: 'admin',
    loginMethod: 'password',
  });
}



// ============= ADDITIONAL QUERY FUNCTIONS =============

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
      teacherName: teachers.halaqaName,
    })
    .from(attendance)
    .leftJoin(students, eq(attendance.studentId, students.id))
    .leftJoin(users, eq(students.userId, users.id))
    .leftJoin(teachers, eq(attendance.teacherId, teachers.id))
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
    teacherName: teachers.halaqaName,
  })
  .from(attendance)
  .leftJoin(students, eq(attendance.studentId, students.id))
  .leftJoin(users, eq(students.userId, users.id))
  .leftJoin(teachers, eq(attendance.teacherId, teachers.id))
  .orderBy(desc(attendance.date));
}

export async function getAllLessons() {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: lessons.id,
    teacherId: lessons.teacherId,
    title: lessons.title,
    description: lessons.description,
    date: lessons.date,
    createdAt: lessons.createdAt,
    teacherName: users.name,
    halaqaName: teachers.halaqaName,
  })
  .from(lessons)
  .leftJoin(teachers, eq(lessons.teacherId, teachers.id))
  .leftJoin(users, eq(teachers.userId, users.id))
  .orderBy(desc(lessons.date));
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

export async function getAssistantsByHalaqa(halaqaName: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: assistants.id,
    userId: assistants.userId,
    halaqaName: assistants.halaqaName,
    createdAt: assistants.createdAt,
    userName: users.name,
    userPhone: users.phone,
    userEmail: users.email,
  })
  .from(assistants)
  .leftJoin(users, eq(assistants.userId, users.id))
  .where(eq(assistants.halaqaName, halaqaName))
  .orderBy(desc(assistants.createdAt));
}

export async function getAssistantNotesByTeacher(teacherId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: assistantNotes.id,
    assistantId: assistantNotes.assistantId,
    teacherId: assistantNotes.teacherId,
    title: assistantNotes.title,
    content: assistantNotes.content,
    rating: assistantNotes.rating,
    isRead: assistantNotes.isRead,
    createdAt: assistantNotes.createdAt,
    assistantName: users.name,
  })
  .from(assistantNotes)
  .leftJoin(users, eq(assistantNotes.assistantId, users.id))
  .where(eq(assistantNotes.teacherId, teacherId))
  .orderBy(desc(assistantNotes.createdAt));
}

export async function getAssistantById(assistantId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select({
    id: assistants.id,
    userId: assistants.userId,
    halaqaName: assistants.halaqaName,
    createdAt: assistants.createdAt,
    userName: users.name,
    userPhone: users.phone,
    userEmail: users.email,
  })
  .from(assistants)
  .leftJoin(users, eq(assistants.userId, users.id))
  .where(eq(assistants.id, assistantId))
  .limit(1);

  return result.length > 0 ? result[0] : undefined;
}



// ============= ASSISTANT NOTES FUNCTIONS =============

export async function markAssistantNoteAsRead(noteId: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(assistantNotes)
    .set({ isRead: true })
    .where(eq(assistantNotes.id, noteId));
}

// ============= STATISTICS FUNCTIONS =============

export async function getStatistics() {
  const db = await getDb();
  if (!db) return {
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    totalLessons: 0,
    totalAttendance: 0,
    totalEvaluations: 0,
    recentActivity: []
  };

  // Get user counts
  const allUsers = await db.select().from(users);
  const totalUsers = allUsers.length;
  const totalStudents = allUsers.filter(u => u.role === 'student').length;
  const totalTeachers = allUsers.filter(u => u.role === 'teacher').length;
  const totalAdmins = allUsers.filter(u => u.role === 'admin').length;

  // Get lesson count
  const allLessons = await db.select().from(lessons);
  const totalLessons = allLessons.length;

  // Get attendance count
  const allAttendance = await db.select().from(attendance);
  const totalAttendance = allAttendance.length;

  // Get evaluation count
  const allEvaluations = await db.select().from(evaluations);
  const totalEvaluations = allEvaluations.length;

  // Get recent activity (last 10 users)
  const recentUsers = await db.select({
    id: users.id,
    name: users.name,
    role: users.role,
    createdAt: users.createdAt,
  })
  .from(users)
  .orderBy(desc(users.createdAt))
  .limit(10);

  return {
    totalUsers,
    totalStudents,
    totalTeachers,
    totalAdmins,
    totalLessons,
    totalAttendance,
    totalEvaluations,
    recentActivity: recentUsers
  };
}



export async function updateStudentPaymentStatus(studentId: string, hasPaid: boolean) {
  const db = await getDb();
  if (!db) return;

  await db.update(students).set({ hasPaid }).where(eq(students.id, studentId));
}

export async function updateStudentPaymentAmount(studentId: string, paymentAmount: number) {
  const connection = await getConnection();
  if (!connection) throw new Error('Database connection failed');

  try {
    await connection.execute(
      'UPDATE students SET paymentAmount = ? WHERE id = ?',
      [paymentAmount, studentId]
    );
  } finally {
    connection.release();
  }
}

export async function updateStudentProfileImage(studentId: string, profileImage: string) {
  const connection = await getConnection();
  if (!connection) throw new Error('Database connection failed');

  try {
    // Update the users table with the new profile image
    await connection.execute(
      'UPDATE users SET profileImage = ? WHERE id = (SELECT userId FROM students WHERE id = ?)',
      [profileImage, studentId]
    );
  } finally {
    connection.release();
  }
}

export async function updateTeacherProfileImage(teacherId: string, profileImage: string) {
  const connection = await getConnection();
  if (!connection) throw new Error('Database connection failed');

  try {
    // Update the users table with the new profile image
    await connection.execute(
      'UPDATE users SET profileImage = ? WHERE id = (SELECT userId FROM teachers WHERE id = ?)',
      [profileImage, teacherId]
    );
  } finally {
    connection.release();
  }
}

export async function getTotalPayments() {
  const connection = await getConnection();
  if (!connection) throw new Error('Database connection failed');

  try {
    const [rows]: any = await connection.execute(`
      SELECT 
        COUNT(*) as totalStudents,
        SUM(CASE WHEN hasPaid = 1 THEN 1 ELSE 0 END) as paidStudents,
        SUM(CASE WHEN hasPaid = 0 THEN 1 ELSE 0 END) as unpaidStudents,
        SUM(paymentAmount) as totalAmount,
        SUM(CASE WHEN hasPaid = 1 THEN paymentAmount ELSE 0 END) as paidAmount,
        SUM(CASE WHEN hasPaid = 0 THEN paymentAmount ELSE 0 END) as unpaidAmount
      FROM students
    `);
    
    return rows[0] || {
      totalStudents: 0,
      paidStudents: 0,
      unpaidStudents: 0,
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0
    };
  } finally {
    connection.release();
  }
}




// Create all database tables if they don't exist
export async function initializeDatabaseTables() {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection failed');
  }

  try {
    // Use raw SQL to create tables - this is a workaround since drizzle-kit can't run in production
    const pool = _pool;
    if (!pool) {
      throw new Error('Database pool not initialized');
    }

    const connection = await pool.getConnection();
    
    try {
      // Create users table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name TEXT,
          email VARCHAR(320),
          phone VARCHAR(20),
          password VARCHAR(255),
          loginMethod VARCHAR(64),
          role ENUM('admin', 'teacher', 'student', 'assistant') DEFAULT 'student' NOT NULL,
          profileImage TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create teachers table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS teachers (
          id VARCHAR(64) PRIMARY KEY,
          userId VARCHAR(64) NOT NULL UNIQUE,
          halaqaName VARCHAR(255),
          specialization ENUM('تربية', 'تحفيظ', 'تربية وتحفيظ'),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Create students table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS students (
          id VARCHAR(64) PRIMARY KEY,
          userId VARCHAR(64) NOT NULL UNIQUE,
          teacherId VARCHAR(64),
          grade VARCHAR(50),
          specialization ENUM('تربية', 'تحفيظ', 'تربية وتحفيظ'),
          enrollmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          hasPaid BOOLEAN DEFAULT FALSE NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (teacherId) REFERENCES teachers(id) ON DELETE SET NULL
        )
      `);

      // Create assistants table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS assistants (
          id VARCHAR(64) PRIMARY KEY,
          userId VARCHAR(64) NOT NULL UNIQUE,
          halaqaName VARCHAR(255),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Create attendance table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS attendance (
          id VARCHAR(64) PRIMARY KEY,
          studentId VARCHAR(64) NOT NULL,
          teacherId VARCHAR(64) NOT NULL,
          date TIMESTAMP NOT NULL,
          status ENUM('present', 'absent', 'excused') NOT NULL,
          notes TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (teacherId) REFERENCES teachers(id) ON DELETE CASCADE
        )
      `);

      // Create lessons table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS lessons (
          id VARCHAR(64) PRIMARY KEY,
          teacherId VARCHAR(64) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          date TIMESTAMP NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (teacherId) REFERENCES teachers(id) ON DELETE CASCADE
        )
      `);

      // Create evaluations table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS evaluations (
          id VARCHAR(64) PRIMARY KEY,
          studentId VARCHAR(64) NOT NULL,
          teacherId VARCHAR(64) NOT NULL,
          lessonId VARCHAR(64),
          score INT NOT NULL,
          feedback TEXT,
          evaluationType VARCHAR(100),
          date TIMESTAMP NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (teacherId) REFERENCES teachers(id) ON DELETE CASCADE,
          FOREIGN KEY (lessonId) REFERENCES lessons(id) ON DELETE SET NULL
        )
      `);

      // Create notifications table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
          id VARCHAR(64) PRIMARY KEY,
          userId VARCHAR(64) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info' NOT NULL,
          isRead BOOLEAN DEFAULT FALSE NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Create otpCodes table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS otpCodes (
          id VARCHAR(64) PRIMARY KEY,
          phone VARCHAR(20) NOT NULL,
          code VARCHAR(6) NOT NULL,
          expiresAt TIMESTAMP NOT NULL,
          verified BOOLEAN DEFAULT FALSE NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create assistantNotes table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS assistantNotes (
          id VARCHAR(64) PRIMARY KEY,
          assistantId VARCHAR(64) NOT NULL,
          studentId VARCHAR(64) NOT NULL,
          note TEXT NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (assistantId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
        )
      `);

      // Create appSettings table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS appSettings (
          id VARCHAR(64) PRIMARY KEY,
          welcomeMessage TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('[Database] All tables created successfully');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[Database] Error creating tables:', error);
    throw error;
  }
}



// ============= APP SETTINGS FUNCTIONS =============

export async function getAppSettings() {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(appSettings).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertAppSettings(settings: InsertAppSettings) {
  const db = await getDb();
  if (!db) return;

  const existing = await getAppSettings();
  
  if (existing) {
    await db.update(appSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(appSettings.id, existing.id));
  } else {
    const settingsId = `settings_${Date.now()}`;
    await db.insert(appSettings).values({
      id: settingsId,
      ...settings,
    });
  }
}




// Apply migrations to existing database
export async function applyMigrations() {
  const pool = _pool;
  if (!pool) {
    console.error('[Migrations] Database pool not initialized');
    return;
  }

  const connection = await pool.getConnection();
  
  try {
    console.log('[Migrations] Starting database migrations...');
    
    // Check if specialization column exists in teachers table
    const [teachersCols]: any = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'teachers' 
      AND COLUMN_NAME = 'specialization'
    `);
    
    if (teachersCols.length === 0) {
      console.log('[Migrations] Adding specialization column to teachers table...');
      await connection.execute(`
        ALTER TABLE teachers 
        ADD COLUMN specialization ENUM('تربية', 'تحفيظ', 'تربية وتحفيظ')
      `);
    } else {
      // Update existing column to ENUM
      console.log('[Migrations] Updating specialization column in teachers table to ENUM...');
      await connection.execute(`
        ALTER TABLE teachers 
        MODIFY COLUMN specialization ENUM('تربية', 'تحفيظ', 'تربية وتحفيظ')
      `);
    }
    
    // Check if specialization column exists in students table
    const [studentsCols]: any = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'students' 
      AND COLUMN_NAME = 'specialization'
    `);
    
    if (studentsCols.length === 0) {
      console.log('[Migrations] Adding specialization column to students table...');
      await connection.execute(`
        ALTER TABLE students 
        ADD COLUMN specialization ENUM('تربية', 'تحفيظ', 'تربية وتحفيظ')
      `);
    }
    
    // Check if hasPaid column exists in students table
    const [hasPaidCols]: any = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'students' 
      AND COLUMN_NAME = 'hasPaid'
    `);
    
    if (hasPaidCols.length === 0) {
      console.log('[Migrations] Adding hasPaid column to students table...');
      await connection.execute(`
        ALTER TABLE students 
        ADD COLUMN hasPaid BOOLEAN DEFAULT FALSE NOT NULL
      `);
    }
    
    // Check if appSettings table exists
    const [appSettingsTables]: any = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'appSettings'
    `);
    
    if (appSettingsTables.length === 0) {
      console.log('[Migrations] Creating appSettings table...');
      await connection.execute(`
        CREATE TABLE appSettings (
          id VARCHAR(64) PRIMARY KEY,
          welcomeMessage TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    
    // Check if username column exists in users table
    const [usernameCols]: any = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'username'
    `);
    
    if (usernameCols.length === 0) {
      console.log('[Migrations] Adding username column to users table...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN username VARCHAR(64) UNIQUE
      `);
    }
    
    // Update users without username
    console.log('[Migrations] Updating users without username...');
    const [usersWithoutUsername]: any = await connection.execute(`
      SELECT id, name, phone, role FROM users WHERE username IS NULL OR username = ''
    `);
    
    for (const user of usersWithoutUsername) {
      let username: string;
      let isUnique = false;
      let attempt = 0;
      
      while (!isUnique && attempt < 10) {
        if (user.phone) {
          // Use phone number as username (remove non-digits and +972 prefix)
          const cleanPhone = user.phone.replace(/\D/g, '');
          username = cleanPhone.startsWith('972') ? '0' + cleanPhone.substring(3) : cleanPhone;
        } else if (user.name) {
          // Use name (transliterate Arabic to Latin if needed, remove spaces)
          const cleanName = user.name.trim().split(/\s+/)[0]; // First word only
          const randomSuffix = Math.floor(Math.random() * 1000);
          username = cleanName + randomSuffix;
        } else {
          // Fallback: use user ID
          username = 'user_' + user.id.substring(user.id.length - 8);
        }
        
        // Check if username is unique
        const [existing]: any = await connection.execute(
          'SELECT id FROM users WHERE username = ? AND id != ?',
          [username, user.id]
        );
        
        if (existing.length === 0) {
          isUnique = true;
        } else {
          attempt++;
          // Add random suffix if not unique
          username = username + '_' + attempt;
        }
      }
      
      console.log(`[Migrations] Setting username for user ${user.id} (${user.name}): ${username}`);
      await connection.execute(
        'UPDATE users SET username = ? WHERE id = ?',
        [username, user.id]
      );
    }
    
    // Make grade column NOT NULL in students table
    console.log('[Migrations] Making grade column NOT NULL in students table...');
    await connection.execute(`
      ALTER TABLE students 
      MODIFY COLUMN grade VARCHAR(50) NOT NULL
    `);
    
    // Check if paymentAmount column exists in students table
    const [paymentAmountCols]: any = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'students' 
      AND COLUMN_NAME = 'paymentAmount'
    `);
    
    if (paymentAmountCols.length === 0) {
      console.log('[Migrations] Adding paymentAmount column to students table...');
      await connection.execute(`
        ALTER TABLE students 
        ADD COLUMN paymentAmount DECIMAL(10, 2) DEFAULT 0.00
      `);
    }
    
    console.log('[Migrations] All migrations applied successfully');
  } catch (error) {
    console.error('[Migrations] Error applying migrations:', error);
  } finally {
    connection.release();
  }
}



// ============= DATA RESET FUNCTIONS =============

/**
 * Reset all center data (attendance, evaluations, lessons, assistant notes)
 * Keeps users, teachers, students, and assistants
 */
export async function resetAllData() {
  const connection = await getConnection();
  if (!connection) throw new Error('Database connection failed');

  try {
    console.log('[Reset] Starting full data reset...');
    
    // Delete attendance records
    await connection.execute('DELETE FROM attendance');
    console.log('[Reset] Deleted all attendance records');
    
    // Delete evaluations
    await connection.execute('DELETE FROM evaluations');
    console.log('[Reset] Deleted all evaluations');
    
    // Delete lessons
    await connection.execute('DELETE FROM lessons');
    console.log('[Reset] Deleted all lessons');
    
    // Delete assistant notes
    await connection.execute('DELETE FROM assistant_notes');
    console.log('[Reset] Deleted all assistant notes');
    
    // Delete notifications
    await connection.execute('DELETE FROM notifications');
    console.log('[Reset] Deleted all notifications');
    
    console.log('[Reset] Full data reset completed successfully');
  } catch (error) {
    console.error('[Reset] Error resetting data:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Reset specific student data (attendance, evaluations)
 */
export async function resetStudentData(studentId: string) {
  const connection = await getConnection();
  if (!connection) throw new Error('Database connection failed');

  try {
    console.log(`[Reset] Resetting data for student ${studentId}...`);
    
    // Delete student's attendance records
    await connection.execute('DELETE FROM attendance WHERE studentId = ?', [studentId]);
    console.log('[Reset] Deleted student attendance records');
    
    // Delete student's evaluations
    await connection.execute('DELETE FROM evaluations WHERE studentId = ?', [studentId]);
    console.log('[Reset] Deleted student evaluations');
    
    console.log(`[Reset] Student ${studentId} data reset completed`);
  } catch (error) {
    console.error('[Reset] Error resetting student data:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Reset specific teacher data (lessons, evaluations, assistant notes)
 */
export async function resetTeacherData(teacherId: string) {
  const connection = await getConnection();
  if (!connection) throw new Error('Database connection failed');

  try {
    console.log(`[Reset] Resetting data for teacher ${teacherId}...`);
    
    // Delete teacher's lessons
    await connection.execute('DELETE FROM lessons WHERE teacherId = ?', [teacherId]);
    console.log('[Reset] Deleted teacher lessons');
    
    // Delete evaluations by this teacher
    await connection.execute('DELETE FROM evaluations WHERE teacherId = ?', [teacherId]);
    console.log('[Reset] Deleted teacher evaluations');
    
    // Delete assistant notes for this teacher
    await connection.execute('DELETE FROM assistant_notes WHERE teacherId = ?', [teacherId]);
    console.log('[Reset] Deleted teacher assistant notes');
    
    console.log(`[Reset] Teacher ${teacherId} data reset completed`);
  } catch (error) {
    console.error('[Reset] Error resetting teacher data:', error);
    throw error;
  } finally {
    connection.release();
  }
}

