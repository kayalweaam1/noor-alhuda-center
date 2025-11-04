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
    initializeDatabase: publicProcedure.mutation(async () => {
      try {
        // Create all database tables first
        await db.initializeDatabaseTables();
        
        // Apply migrations to update existing tables
        await db.applyMigrations();
        
        // Create default admin
        await db.createDefaultAdmin();
        
        return { 
          success: true, 
          message: 'Database initialized successfully. Login with phone: 0542632557, password: 123456',
          phone: '0542632557',
          password: '123456'
        };
      } catch (error) {
        console.error('Database initialization error:', error);
        return { 
          success: false, 
          message: 'Database initialization failed: ' + (error instanceof Error ? error.message : String(error))
        };
      }
    }),

    applyMigrations: publicProcedure.mutation(async () => {
      try {
        await db.applyMigrations();
        return { 
          success: true, 
          message: 'Migrations applied successfully'
        };
      } catch (error) {
        console.error('Migration error:', error);
        return { 
          success: false, 
          message: 'Migration failed: ' + (error instanceof Error ? error.message : String(error))
        };
      }
    }),
    
    createAdmin: publicProcedure.mutation(async () => {
      await db.createDefaultAdmin();
      return { success: true, message: 'Admin created successfully' };
    }),
    
    resetAdminPassword: publicProcedure.mutation(async () => {
      const { hashPassword } = await import('./_core/password');
      const hashedPassword = await hashPassword('admin123');
      
      // Update password for default admin
      const adminUser = await db.getUserByPhone('0542632557');
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

    // Danger: wipe DB and create single admin (SUPER ADMIN ONLY)
    hardReset: protectedProcedure
      .input(z.object({ confirmPassword: z.string().min(4) }))
      .mutation(async ({ input, ctx }) => {
        // Only super admin (by phone) can execute this
        const SUPER_ADMIN_PHONE = '0542632557';

        if (!ctx.user || ctx.user.role !== 'admin' || ctx.user.phone !== SUPER_ADMIN_PHONE) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Super admin access required' });
        }

        // Verify super admin password
        const userRecord = await db.getUser(ctx.user.id);
        if (!userRecord || !userRecord.password) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'كلمة المرور غير صحيحة' });
        }

        const { comparePassword, isHashed } = await import('./_core/password');

        let passwordMatch = false;
        if (isHashed(userRecord.password)) {
          passwordMatch = await comparePassword(input.confirmPassword, userRecord.password);
        } else {
          passwordMatch = userRecord.password === input.confirmPassword;
        }

        if (!passwordMatch) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'كلمة المرور غير صحيحة' });
        }

        // Perform reset and set the new admin password to the same confirmed password
        await db.resetDatabaseForAdmin(ctx.user.phone!, input.confirmPassword);
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

    // Update profile
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        profileImage: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateUser(ctx.user.id, {
          name: input.name,
          email: input.email,
          phone: input.phone,
          profileImage: input.profileImage,
        });
        return { success: true };
      }),

    // Update username
    updateUsername: protectedProcedure
      .input(z.object({
        newUsername: z.string()
          .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
          .max(32, 'اسم المستخدم يجب ألا يتجاوز 32 حرفاً')
          .regex(
            /^[a-zA-Z0-9\u0600-\u06FF][a-zA-Z0-9\u0600-\u06FF_-]*$/,
            'اسم المستخدم يجب أن يبدأ بحرف أو رقم ويمكن أن يحتوي على أحرف وأرقام و _ و -'
          ),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if username is already taken
        const existingUser = await db.getUserByUsername(input.newUsername);
        if (existingUser && existingUser.id !== ctx.user.id) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: `اسم المستخدم '${input.newUsername}' مستخدم بالفعل` 
          });
        }
        
        // Update username using upsertUser
        await db.upsertUser({
          id: ctx.user.id,
          username: input.newUsername,
        });
        
        return { success: true, username: input.newUsername };
      }),

    // Change password
    changePassword: protectedProcedure
      .input(z.object({ 
        currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
        newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
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

    // Login with username or phone and password
    login: publicProcedure
      .input(z.object({ 
        username: z.string().min(1, 'اسم المستخدم أو رقم الهاتف مطلوب'), // Can be username or phone
        password: z.string().min(1, 'كلمة المرور مطلوبة'),
      }))
      .mutation(async ({ input, ctx }) => {
        const identifier = input.username.trim();
        
        console.log('[Login] Attempting login with identifier:', identifier);
        
        // Try to get user by username first, then by phone
        let user = await db.getUserByUsername(identifier);
        if (!user) {
          user = await db.getUserByPhone(identifier);
        }
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

        // Ensure teacher profile exists for teacher accounts
        if (user.role === 'teacher') {
          const existingTeacher = await db.getTeacherByUserId(user.id);
          if (!existingTeacher) {
            const teacherId = `teacher_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`;
            await db.createTeacher({
              id: teacherId,
              userId: user.id,
              halaqaName: null as any,
              specialization: null as any,
            });
          }
        }

        // Set session and save it explicitly
        console.log('[Login] Setting session for user:', { id: user.id, phone: user.phone, role: user.role });
        if (ctx.req.session) {
          ctx.req.session.userId = user.id;
          ctx.req.session.phone = user.phone || undefined;
          
          // Save session explicitly and wait for it
          return new Promise((resolve, reject) => {
            ctx.req.session.save((err: any) => {
              if (err) {
                console.error('[Login] Failed to save session:', err);
                reject(new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to save session' }));
              } else {
                console.log('[Login] Session saved successfully:', {
                  userId: ctx.req.session.userId,
                  phone: ctx.req.session.phone,
                  sessionID: ctx.req.sessionID
                });
                resolve({
                  success: true,
                  user: {
                    id: user.id,
                    phone: user.phone,
                    name: user.name,
                    role: user.role,
                  },
                });
              }
            });
          });
        } else {
          console.error('[Login] No session object available!');
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Session not available' });
        }
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
        console.log('[CreateUser] Creating user:', { userId, phone: input.phone, role: input.role });
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
	        grade: z.string().optional(),
	        specialization: z.enum(["تربية", "تحفيظ", "تربية وتحفيظ"]).optional(),
	        hasPaid: z.boolean().optional(),
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
	          loginMethod: 'password', // Changed to 'password' as it seems to be the main login method
	        });

        console.log('[CreateUser] User created successfully');

        // Automatic registration based on role and grade
		        if (input.role === 'teacher') {
          console.log('[CreateUser] Creating teacher profile...');
	          const teacherId = `teacher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	          await db.createTeacher({
	            id: teacherId,
	            userId: userId,
	            halaqaName: input.grade || null,
	            specialization: input.specialization || null,
	          });
        } else if (input.role === 'student') {
          if (!input.grade) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'يجب تحديد الجيل / الصف للطالب',
            });
          }
          console.log('[CreateUser] Creating student profile...');
		          const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	          await db.createStudent({
	            id: studentId,
	            userId: userId,
	            grade: input.grade,
	            specialization: input.specialization || null,
	            hasPaid: input.hasPaid || false,
            teacherId: null, // Teacher will be assigned later
		          });
          console.log('[CreateUser] Student profile created');
	        }

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
        password: z.string().min(6).optional(),
        halaqaName: z.string().optional(),
        specialization: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Create user first with a real password (hashed)
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const { hashPassword } = await import('./_core/password');
        const hashedPassword = await hashPassword(input.password || '123456');
        await db.upsertUser({
          id: userId,
          name: input.name,
          phone: input.phone,
          password: hashedPassword,
          role: 'teacher',
          loginMethod: 'password',
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
      const list = await db.getAllStudents();
      // Join with attendance rates for quick overview
      const rates = await db.getAttendanceRatesByStudent();
      const map = new Map(rates.map(r => [r.studentId, r] as const));
      return list.map((s: any) => {
        const r = map.get(s.id);
        const rate = r && r.totalCount > 0 ? Math.round((r.presentCount / r.totalCount) * 100) : 0;
        return { ...s, attendanceRate: rate };
      });
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const student = await db.getStudent(input.id);
        if (!student) return null;
        
        // Allow admin to see all students
        if (ctx.user.role === 'admin') {
          return student;
        }
        
        // Allow teacher to see only their students
        if (ctx.user.role === 'teacher') {
          const teacher = await db.getTeacherByUserId(ctx.user.id);
          if (teacher && student.teacherId === teacher.id) {
            return student;
          }
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only view your own students' });
        }
        
        // Allow student to see only their own profile
        if (ctx.user.role === 'student' && student.userId === ctx.user.id) {
          return student;
        }
        
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
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

    createWithUser: teacherProcedure
      .input(z.object({
        name: z.string(),
        phone: z.string(),
        password: z.string().min(6).optional(),
        teacherId: z.string().optional(), // Optional for teachers, they'll use their own ID
        grade: z.string().optional(),
        specialization: z.enum(["تربية", "تحفيظ", "تربية وتحفيظ"]).optional(),
        hasPaid: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // If teacher is creating student, use their own ID
        let finalTeacherId = input.teacherId;
        if (!finalTeacherId && ctx.user.role === 'teacher') {
          const teacher = await db.getTeacherByUserId(ctx.user.id);
          if (!teacher) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Teacher profile not found' });
          }
          finalTeacherId = teacher.id;
        }
        
        if (!finalTeacherId) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Teacher ID is required' });
        }
        // Create user first with a real password (hashed)
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const { hashPassword } = await import('./_core/password');
        const hashedPassword = await hashPassword(input.password || '123456');
        await db.upsertUser({
          id: userId,
          name: input.name,
          phone: input.phone,
          password: hashedPassword,
          role: 'student',
          loginMethod: 'password',
        });

        // Then create student
        const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createStudent({
          id: studentId,
          userId,
          teacherId: finalTeacherId,
          grade: input.grade,
          specialization: input.specialization || 'تربية',
          hasPaid: input.hasPaid || false,
        });
	
	        return { success: true, userId, studentId };
	      }),

    updatePaymentStatus: protectedProcedure
      .input(z.object({
        studentId: z.string(),
        hasPaid: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if the user is authorized to update this student's status
        const student = await db.getStudent(input.studentId);
        if (!student) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
        }

        // Admin can update any student
        if (ctx.user.role === 'admin') {
          await db.updateStudentPaymentStatus(input.studentId, input.hasPaid);
          return { success: true };
        }

        // Teacher can only update their own students
        const teacher = await db.getTeacherByUserId(ctx.user.id);
        if (!teacher) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Teacher profile not found' });
        }

        if (student.teacherId !== teacher.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized to update this student' });
        }

        await db.updateStudentPaymentStatus(input.studentId, input.hasPaid);
        return { success: true };
      }),

    updatePaymentAmount: adminProcedure
      .input(z.object({
        studentId: z.string(),
        paymentAmount: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateStudentPaymentAmount(input.studentId, input.paymentAmount);
        return { success: true };
      }),

    getTotalPayments: adminProcedure.query(async () => {
      return await db.getTotalPayments();
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

    createByTeacher: teacherProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.date(),
      }))
      .mutation(async ({ input, ctx }) => {
        const teacher = await db.getTeacherByUserId(ctx.user.id);
        if (!teacher) throw new TRPCError({ code: 'NOT_FOUND', message: 'Teacher profile not found' });

        const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createLesson({
          id: lessonId,
          ...input,
          teacherId: teacher.id,
        });
        
        // Create notification for admin
        const teacherUser = await db.getUser(ctx.user.id);
        const admins = await db.getAllUsers();
        const adminUsers = admins.filter(u => u.role === 'admin');
        
        for (const admin of adminUsers) {
          await db.createNotification({
            userId: admin.id,
            title: 'درس جديد',
            message: `قام المربي ${teacherUser?.name || 'غير محدد'} بإضافة درس جديد: ${input.title}`,
            type: 'lesson_added',
          });
        }
        
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

    delete: teacherProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        // Check if teacher owns this lesson or if user is admin
        const lesson = await db.getLesson(input.id);
        if (!lesson) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Lesson not found' });
        }
        
        if (ctx.user.role !== 'admin') {
          const teacher = await db.getTeacherByUserId(ctx.user.id);
          if (!teacher || lesson.teacherId !== teacher.id) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own lessons' });
          }
        }
        
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
        studentId: z.string(),
        lessonId: z.string().optional(),
        score: z.number().min(0).max(100),
        feedback: z.string().optional(),
        evaluationType: z.string().optional(),
        date: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teacher = await db.getTeacherByUserId(ctx.user.id);
        if (!teacher) throw new TRPCError({ code: 'NOT_FOUND', message: 'Teacher profile not found' });
        
        const evaluationId = `evaluation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await db.createEvaluation({
          id: evaluationId,
          ...input,
          date: new Date(input.date),
          teacherId: teacher.id,
        });
        return { success: true };
      }),

    getBehaviorScore: protectedProcedure
      .input(z.object({ studentId: z.string() }))
      .query(async ({ input }) => {
        const evaluations = await db.getEvaluationsByStudent(input.studentId);
        const behaviorEvals = evaluations.filter(e => e.evaluationType === 'تقييم سلوكي');
        
        if (behaviorEvals.length === 0) return { score: 70, count: 0 }; // Default score
        
        const totalScore = behaviorEvals.reduce((sum, e) => sum + e.score, 0);
        const avgScore = Math.round(totalScore / behaviorEvals.length);
        
        return { score: avgScore, count: behaviorEvals.length };
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
        password: z.string().min(6).optional(),
        halaqaName: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Create user first with a real password (hashed)
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const { hashPassword } = await import('./_core/password');
        const hashedPassword = await hashPassword(input.password || '123456');
        await db.upsertUser({
          id: userId,
          name: input.name,
          phone: input.phone,
          password: hashedPassword,
          role: 'assistant',
          loginMethod: 'password',
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

  // ============= APP SETTINGS =============
  appSettings: router({
    get: protectedProcedure.query(async () => {
      return await db.getAppSettings();
    }),

    update: adminProcedure
      .input(z.object({
        welcomeMessage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertAppSettings(input);
        return { success: true };
      }),
  }),

  // ============= STATISTICS (ADMIN ONLY) =============
  statistics: router({
    getOverview: adminProcedure.query(async () => {
      return await db.getStatistics();
    }),
  }),

  // ============= DATA RESET (ADMIN ONLY) =============
  dataReset: router({
    // Reset all center data
    resetAll: adminProcedure
      .mutation(async () => {
        // Delete all data except users with admin role
        await db.resetAllData();
        return { success: true, message: 'تم تصفير جميع بيانات المركز بنجاح' };
      }),

    // Reset specific student data
    resetStudent: adminProcedure
      .input(z.object({ studentId: z.string() }))
      .mutation(async ({ input }) => {
        await db.resetStudentData(input.studentId);
        return { success: true, message: 'تم تصفير بيانات الطالب بنجاح' };
      }),

    // Reset specific teacher data
    resetTeacher: adminProcedure
      .input(z.object({ teacherId: z.string() }))
      .mutation(async ({ input }) => {
        await db.resetTeacherData(input.teacherId);
        return { success: true, message: 'تم تصفير بيانات المربي بنجاح' };
      }),
  }),
});

export type AppRouter = typeof appRouter;

