import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }), // Phone number for OTP login
  password: varchar("password", { length: 255 }), // Password for login
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "teacher", "student", "assistant"]).default("student").notNull(),
  profileImage: text("profileImage"), // URL to profile image
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Teacher-specific information
 */
export const teachers = mysqlTable("teachers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  halaqaName: varchar("halaqaName", { length: 255 }), // e.g., "حلقة الصف الثالث"
  specialization: mysqlEnum("specialization", ["تربية", "تحفيظ", "تربية وتحفيظ"]), // التخصص
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = typeof teachers.$inferInsert;

/**
 * Student-specific information
 */
export const students = mysqlTable("students", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  teacherId: varchar("teacherId", { length: 64 }).references(() => teachers.id, { onDelete: "set null" }),
  grade: varchar("grade", { length: 50 }), // e.g., "الصف الثالث"
  specialization: mysqlEnum("specialization", ["تربية", "تحفيظ", "تربية وتحفيظ"]), // التخصص
  enrollmentDate: timestamp("enrollmentDate").defaultNow(),
  hasPaid: boolean("hasPaid").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * Assistant-specific information
 */
export const assistants = mysqlTable("assistants", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  halaqaName: varchar("halaqaName", { length: 255 }), // e.g., "حلقة الصف الثالث"
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Assistant = typeof assistants.$inferSelect;
export type InsertAssistant = typeof assistants.$inferInsert;

/**
 * Attendance records
 */
export const attendance = mysqlTable("attendance", {
  id: varchar("id", { length: 64 }).primaryKey(),
  studentId: varchar("studentId", { length: 64 }).notNull().references(() => students.id, { onDelete: "cascade" }),
  teacherId: varchar("teacherId", { length: 64 }).notNull().references(() => teachers.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  status: mysqlEnum("status", ["present", "absent", "excused"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

/**
 * Lessons/Sessions
 */
export const lessons = mysqlTable("lessons", {
  id: varchar("id", { length: 64 }).primaryKey(),
  teacherId: varchar("teacherId", { length: 64 }).notNull().references(() => teachers.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(), // e.g., "سورة البقرة - الآيات 1-10"
  description: text("description"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

/**
 * Student evaluations/grades
 */
export const evaluations = mysqlTable("evaluations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  studentId: varchar("studentId", { length: 64 }).notNull().references(() => students.id, { onDelete: "cascade" }),
  teacherId: varchar("teacherId", { length: 64 }).notNull().references(() => teachers.id, { onDelete: "cascade" }),
  lessonId: varchar("lessonId", { length: 64 }).references(() => lessons.id, { onDelete: "set null" }),
  score: int("score").notNull(), // Score out of 100
  feedback: text("feedback"),
  evaluationType: varchar("evaluationType", { length: 100 }), // e.g., "تسميع", "اختبار", "تقييم شفهي"
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = typeof evaluations.$inferInsert;

/**
 * Notifications
 */
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "warning", "success", "error"]).default("info").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * OTP codes for phone authentication
 */
export const otpCodes = mysqlTable("otpCodes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertOtpCode = typeof otpCodes.$inferInsert;

/**
 * Assistant notes from teachers
 */
export const assistantNotes = mysqlTable("assistantNotes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  assistantId: varchar("assistantId", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  teacherId: varchar("teacherId", { length: 64 }).notNull().references(() => teachers.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  rating: int("rating"), // Rating from 1-5
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AssistantNote = typeof assistantNotes.$inferSelect;
export type InsertAssistantNote = typeof assistantNotes.$inferInsert;


/**
 * App settings
 */
export const appSettings = mysqlTable("appSettings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  welcomeMessage: text("welcomeMessage"), // رسالة الترحيب أو آية تظهر لجميع المستخدمين
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type AppSettings = typeof appSettings.$inferSelect;
export type InsertAppSettings = typeof appSettings.$inferInsert;

