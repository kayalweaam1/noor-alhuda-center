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

  // Setup endpoints
  setup: router({
    createAdmin: publicProcedure.mutation(async () => {
      await db.createDefaultAdmin();
      return { success: true, message: 'Admin created successfully' };
    }),
    
    resetAdminPassword: publicProcedure.mutation(async () => {
      const { hashPassword } = await import('./_core/password');
      const hashedPassword = await hashPassword('admin123');
      
      // Update password for default admin
      const adminUser = await db.getUserByPhone('+972542632557');
      if (adminUser) {
        await db.updateUserPassword(adminUser.id, hashedPassword);
        return { success: true, message: 'Admin password reset successfully', phone: '+972542632557', password: 'admin123' };
      }
      return { success: false, message: 'Admin user not found' };
    }),
    
    resetAllPasswords: publicProcedure.mutation(async () => {
      const { hashPassword } = await import('./_core/password');
      const users = await db.getAllUsers();
      const defaultPassword = '1234567';
      const hashedPassword = await hashPassword(defaultPassword);
      
      for (const user of users) {
        await db.updateUserPassword(user.id, hashedPassword);
      }
      
      return { 
        success: true, 
        message: `Reset passwords for ${users.length} users`,
        defaultPassword: defaultPassword
      };
    }),
    
    checkDatabase: publicProcedure.query(async () => {
      const users = await db.getAllUsers();
      return { 
        success: true, 
        userCount: users.length,
        users: users.map(u => ({ 
          id: u.id, 
          name: u.name, 
          phone: u.phone, 
          role: u.role,
          hasPassword: !!u.password,
          passwordLength: u.password ? u.password.length : 0
        }))
      };
    }),

    // Danger: wipe DB and create single admin
    hardReset: publicProcedure
      .input(z.object({ phone: z.string().default('0542632557'), password: z.string().default('123456') }))
      .mutation(async ({ input }) => {
        await db.resetDatabaseForAdmin(input.phone, input.password);
        return { success: true };
      }),
    
    checkUser: publicProcedure
      .input(z.object({ phone: z.string() }))
      .query(async ({ input }) => {
        const user = await db.getUserByPhone(input.phone);
        if (!user) {
          return { success: false, message: 'User not found' };
        }
        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            hasPassword: !!user.password,
            passwordLength: user.password ? user.password.length : 0,
            passwordPreview: user.password ? user.password.substring(0, 10) + '...' : 'NO PASSWORD'
          }
        };
      }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    // Change password
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUser(ctx.user.id);
        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        // Check current password
        const { comparePassword, hashPassword, isHashed } = await import('./_core/password');
        
        const passwordMatch = user.password && isHashed(user.password)
          ? await comparePassword(input.currentPassword, user.password)
          : user.password === input.currentPassword;
        
        if (!passwordMatch) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Current password is incorrect' });
        }

        // Hash and update password
        const hashedPassword = await hashPassword(input.newPassword);
        await db.updateUserPassword(ctx.user.id, hashedPassword);
        return { success: true };
      }),

    // Login with phone and password
    login: publicProcedure
      .input(z.object({ 
        phone: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Normalize phone number (add +972 if missing)
        let phone = input.phone.trim();
        if (phone.startsWith('0')) {
          phone = '+972' + phone.substring(1);
        } else if (!phone.startsWith('+')) {
          phone = '+972' + phone;
        }
        
        console.log('[Login] Attempting login with phone:', phone);
        
        // Get user by phone
        const user = await db.getUserByPhone(phone);
        console.log('[Login] User found:', user ? { id: user.id, phone: user.phone, role: user.role, hasPassword: !!user.password } : 'NOT FOUND');
        
        if (!user) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid phone or password' });
        }

        // Check if user has a password
        if (!user.password) {
          console.log('[Login] User has no password set');
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid phone or password' });
        }

        // Check password using bcrypt
        const { comparePassword, isHashed } = await import('./_core/password');
        
        console.log('[Login] Password check:', {
          hasPassword: !!user.password,
          isHashed: isHashed(user.password),
          passwordLength: user.password.length
        });
        
        // If password is not hashed yet (old data), do simple comparison
        // Otherwise use bcrypt compare
        let passwordMatch = false;
        if (isHashed(user.password)) {
          passwordMatch = await comparePassword(input.password, user.password);
          console.log('[Login] Bcrypt comparison result:', passwordMatch);
        } else {
          passwordMatch = user.password === input.password;
          console.log('[Login] Plain text comparison result:', passwordMatch);
        }
        
        if (!passwordMatch) {
          console.log('[Login] Password mismatch');
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid phone or password' });
        }

        // Update last signed in
        await db.updateUserLastSignedIn(user.id);

        // Set session
        if (ctx.req.session) {
          ctx.req.session.userId = user.id;
          ctx.req.session.phone = user.phone || undefined;
        }

        return {
          success: true,
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            role: user.role,
          },
        };
      }),

    // Create default admin (for debugging)
    createAdmin: publicProcedure
      .mutation(async () => {
        const { createDefaultAdmin } = await import('./db');
        await createDefaultAdmin();
        return { success: true, message: 'Admin created successfully' };
      }),

    // Send OTP code
    sendOTP: publicProcedure
      .input(z.object({ phone: z.string() }))
      .mutation(async ({ input }) => {
        const { generateOTP, sendOTPCode, isValidPhoneNumber } = await import('./_core/sms');
        
        if (!isValidPhoneNumber(input.phone)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid phone number format' });
        }

        // Generate OTP (fixed 123456 for super admin)
        const code = generateOTP(input.phone);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save OTP to database
        const otpId = `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createOtpCode({
          id: otpId,
          phone: input.phone,
          code,
          expiresAt,
          verified: false,
        });

        // Send SMS
        await sendOTPCode(input.phone, code);

        return { success: true, message: 'OTP sent successfully' };
      }),

    // Verify OTP and login
    verifyOTP: publicProcedure
      .input(z.object({ 
        phone: z.string(),
        code: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check OTP
        const otpRecord = await db.getValidOtpCode(input.phone, input.code);
        
        if (!otpRecord) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired OTP' });
        }

        // Mark OTP as verified
        await db.markOtpAsVerified(otpRecord.id);

        // Get or create user
        let user = await db.getUserByPhone(input.phone);
        
        if (!user) {
          // Create new user
          const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await db.upsertUser({
            id: userId,
            phone: input.phone,
            role: 'student', // Default role
            loginMethod: 'otp',
          });
          user = await db.getUserByPhone(input.phone);
        }

        if (!user) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create user' });
        }

        // Update last signed in
        await db.updateUserLastSignedIn(user.id);

        // Save session
        if (ctx.req.session) {
          ctx.req.session.phone = input.phone;
          ctx.req.session.userId = user.id;
        }

        return { 
          success: true, 
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
          }
        };
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

    update: adminProcedure
      .input(z.object({
        userId: z.string(),
        name: z.string(),
        phone: z.string(),
        email: z.string().optional(),
        role: z.enum(["admin", "teacher", "student", "assistant"]),
      }))
      .mutation(async ({ input }) => {
        await db.upsertUser({
          id: input.userId,
          name: input.name,
          phone: input.phone,
          email: input.email,
          role: input.role,
          loginMethod: 'firebase',
        });
        return { success: true };
      }),

    create: adminProcedure
      .input(z.object({
        name: z.string(),
        phone: z.string(),
        email: z.string().optional(),
        password: z.string(),
        role: z.enum(["admin", "teacher", "student"]),
      }))
      .mutation(async ({ input }) => {
        // Hash password before saving
        const { hashPassword } = await import('./_core/password');
        const hashedPassword = await hashPassword(input.password);
        
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.upsertUser({
          id: userId,
          name: input.name,
          phone: input.phone,
          email: input.email,
          password: hashedPassword,
          role: input.role,
          loginMethod: 'firebase',
        });
        return { success: true, userId };
      }),

    delete: adminProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        // Prevent deleting current user
        if (input.userId === ctx.user.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'لا يمكنك حذف حسابك الخاص',
          });
        }
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

    createWithUser: adminProcedure
      .input(z.object({
        name: z.string(),
        phone: z.string(),
        halaqaName: z.string().optional(),
        specialization: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Create user first
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.upsertUser({
          id: userId,
          name: input.name,
          phone: input.phone,
          role: 'teacher',
          loginMethod: 'firebase',
        });

        // Then create teacher
        const teacherId = `teacher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createTeacher({
          id: teacherId,
          userId,
          halaqaName: input.halaqaName,
          specialization: input.specialization,
        });

        return { success: true, userId, teacherId };
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

    createWithUser: adminProcedure
      .input(z.object({
        name: z.string(),
        phone: z.string(),
        password: z.string().optional(),
        teacherId: z.string(),
        grade: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Create user first
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.upsertUser({
          id: userId,
          name: input.name,
          phone: input.phone,
          password: input.password || '123456',
          role: 'student',
          loginMethod: 'firebase',
        });

        // Then create student
        const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createStudent({
          id: studentId,
          userId,
          teacherId: input.teacherId,
          grade: input.grade,
        });

        return { success: true, userId, studentId };
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

    mark: teacherProcedure
      .input(z.object({
        studentId: z.string(),
        date: z.string(),
        status: z.enum(["present", "absent", "late"]),
        teacherId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const id = `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createAttendance({
          id,
          studentId: input.studentId,
          date: new Date(input.date),
          status: input.status as any,
          teacherId: input.teacherId,
        });
        return { success: true };
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

    create: adminProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.date(),
        teacherId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createLesson({
          id: lessonId,
          ...input,
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

  // ============= ASSISTANT MANAGEMENT =============
  assistants: router({
    getAll: adminProcedure.query(async () => {
      return await db.getAllAssistants();
    }),

    getByHalaqa: teacherProcedure
      .input(z.object({ halaqaName: z.string() }))
      .query(async ({ input }) => {
        return await db.getAssistantsByHalaqa(input.halaqaName);
      }),

    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'assistant') return null;
      return await db.getAssistantByUserId(ctx.user.id);
    }),

    createWithUser: adminProcedure
      .input(z.object({
        name: z.string(),
        phone: z.string(),
        halaqaName: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Create user first
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.upsertUser({
          id: userId,
          name: input.name,
          phone: input.phone,
          role: 'assistant',
          loginMethod: 'firebase',
        });

        // Then create assistant
        const assistantId = `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createAssistant({
          id: assistantId,
          userId,
          halaqaName: input.halaqaName,
        });

        return { success: true, userId, assistantId };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.string(),
        halaqaName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAssistant(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteAssistant(input.id);
        return { success: true };
      }),
  }),

  // ============= ASSISTANT NOTES =============
  assistantNotes: router({
    getMyNotes: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'assistant') return [];
      return await db.getAssistantNotesByAssistant(ctx.user.id);
    }),

    getByTeacher: teacherProcedure.query(async ({ ctx }) => {
      const teacher = await db.getTeacherByUserId(ctx.user.id);
      if (!teacher) return [];
      return await db.getAssistantNotesByTeacher(teacher.id);
    }),

    create: teacherProcedure
      .input(z.object({
        assistantId: z.string(),
        title: z.string(),
        content: z.string(),
        rating: z.number().min(1).max(5).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teacher = await db.getTeacherByUserId(ctx.user.id);
        if (!teacher) throw new TRPCError({ code: 'NOT_FOUND', message: 'Teacher profile not found' });

        // Check if assistant is in the same halaqa
        const assistant = await db.getAssistantById(input.assistantId);
        if (!assistant) throw new TRPCError({ code: 'NOT_FOUND', message: 'Assistant not found' });
        
        const teacherProfile = await db.getTeacher(teacher.id);
        if (teacherProfile?.halaqaName !== assistant.halaqaName) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Can only write notes for assistants in your halaqa' });
        }

        const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createAssistantNote({
          id: noteId,
          assistantId: input.assistantId,
          teacherId: teacher.id,
          title: input.title,
          content: input.content,
          rating: input.rating,
        });

        return { success: true, noteId };
      }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.markAssistantNoteAsRead(input.id);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteAssistantNote(input.id);
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

