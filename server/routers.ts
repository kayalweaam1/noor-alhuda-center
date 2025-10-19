import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

// Helper to check if user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Helper to check if user is teacher
const teacherProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'teacher' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Teacher access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============= USER MANAGEMENT =============
  users: router({
    getAll: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await db.getUser(input.id);
      }),

    updateRole: adminProcedure
      .input(z.object({
        userId: z.string(),
        role: z.enum(["admin", "teacher", "student"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteUser(input.userId);
        return { success: true };
      }),
  }),

  // ============= TEACHER MANAGEMENT =============
  teachers: router({
    getAll: adminProcedure.query(async () => {
      return await db.getAllTeachers();
    }),

    getMyProfile: teacherProcedure.query(async ({ ctx }) => {
      return await db.getTeacherByUserId(ctx.user.id);
    }),

    create: adminProcedure
      .input(z.object({
        id: z.string(),
        userId: z.string(),
        halaqaName: z.string().optional(),
        specialization: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createTeacher(input);
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.string(),
        halaqaName: z.string().optional(),
        specialization: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateTeacher(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteTeacher(input.id);
        return { success: true };
      }),
  }),

  // ============= STUDENT MANAGEMENT =============
  students: router({
    getAll: adminProcedure.query(async () => {
      return await db.getAllStudents();
    }),

    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'student') return null;
      return await db.getStudentByUserId(ctx.user.id);
    }),

    getByTeacher: teacherProcedure.query(async ({ ctx }) => {
      const teacher = await db.getTeacherByUserId(ctx.user.id);
      if (!teacher) return [];
      return await db.getStudentsByTeacher(teacher.id);
    }),

    create: adminProcedure
      .input(z.object({
        id: z.string(),
        userId: z.string(),
        teacherId: z.string().optional(),
        grade: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createStudent(input);
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.string(),
        teacherId: z.string().optional(),
        grade: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateStudent(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteStudent(input.id);
        return { success: true };
      }),
  }),

  // ============= ATTENDANCE MANAGEMENT =============
  attendance: router({
    getAll: adminProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAllAttendance(input.startDate, input.endDate);
      }),

    getByStudent: protectedProcedure
      .input(z.object({
        studentId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAttendanceByStudent(input.studentId, input.startDate, input.endDate);
      }),

    getByTeacher: teacherProcedure
      .input(z.object({ date: z.date().optional() }))
      .query(async ({ ctx, input }) => {
        const teacher = await db.getTeacherByUserId(ctx.user.id);
        if (!teacher) return [];
        return await db.getAttendanceByTeacher(teacher.id, input.date);
      }),

    create: teacherProcedure
      .input(z.object({
        id: z.string(),
        studentId: z.string(),
        date: z.date(),
        status: z.enum(["present", "absent", "excused"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teacher = await db.getTeacherByUserId(ctx.user.id);
        if (!teacher) throw new TRPCError({ code: 'NOT_FOUND', message: 'Teacher profile not found' });
        
        await db.createAttendance({
          ...input,
          teacherId: teacher.id,
        });
        return { success: true };
      }),

    update: teacherProcedure
      .input(z.object({
        id: z.string(),
        status: z.enum(["present", "absent", "excused"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAttendance(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteAttendance(input.id);
        return { success: true };
      }),
  }),

  // ============= LESSON MANAGEMENT =============
  lessons: router({
    getAll: adminProcedure.query(async () => {
      return await db.getAllLessons();
    }),

    getByTeacher: teacherProcedure.query(async ({ ctx }) => {
      const teacher = await db.getTeacherByUserId(ctx.user.id);
      if (!teacher) return [];
      return await db.getLessonsByTeacher(teacher.id);
    }),

    create: teacherProcedure
      .input(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        date: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teacher = await db.getTeacherByUserId(ctx.user.id);
        if (!teacher) throw new TRPCError({ code: 'NOT_FOUND', message: 'Teacher profile not found' });
        
        await db.createLesson({
          ...input,
          teacherId: teacher.id,
        });
        return { success: true };
      }),

    update: teacherProcedure
      .input(z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateLesson(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteLesson(input.id);
        return { success: true };
      }),
  }),

  // ============= EVALUATION MANAGEMENT =============
  evaluations: router({
    getAll: adminProcedure.query(async () => {
      return await db.getAllEvaluations();
    }),

    getByStudent: protectedProcedure
      .input(z.object({ studentId: z.string() }))
      .query(async ({ input }) => {
        return await db.getEvaluationsByStudent(input.studentId);
      }),

    getByTeacher: teacherProcedure.query(async ({ ctx }) => {
      const teacher = await db.getTeacherByUserId(ctx.user.id);
      if (!teacher) return [];
      return await db.getEvaluationsByTeacher(teacher.id);
    }),

    create: teacherProcedure
      .input(z.object({
        id: z.string(),
        studentId: z.string(),
        lessonId: z.string().optional(),
        score: z.number().min(0).max(100),
        feedback: z.string().optional(),
        evaluationType: z.string().optional(),
        date: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teacher = await db.getTeacherByUserId(ctx.user.id);
        if (!teacher) throw new TRPCError({ code: 'NOT_FOUND', message: 'Teacher profile not found' });
        
        await db.createEvaluation({
          ...input,
          teacherId: teacher.id,
        });
        return { success: true };
      }),

    update: teacherProcedure
      .input(z.object({
        id: z.string(),
        score: z.number().min(0).max(100).optional(),
        feedback: z.string().optional(),
        evaluationType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateEvaluation(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteEvaluation(input.id);
        return { success: true };
      }),
  }),

  // ============= NOTIFICATIONS =============
  notifications: router({
    getMy: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNotificationsByUser(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteNotification(input.id);
        return { success: true };
      }),
  }),

  // ============= STATISTICS (ADMIN ONLY) =============
  statistics: router({
    getOverview: adminProcedure.query(async () => {
      return await db.getStatistics();
    }),
  }),
});

export type AppRouter = typeof appRouter;

