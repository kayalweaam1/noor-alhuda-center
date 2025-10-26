import { z } from 'zod';

/**
 * Username validation schema
 * - Minimum 3 characters
 * - Maximum 32 characters
 * - Can contain letters (Arabic/English), numbers, underscores, and hyphens
 * - Must start with a letter or number
 */
export const usernameSchema = z.string()
  .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
  .max(32, 'اسم المستخدم يجب ألا يتجاوز 32 حرفاً')
  .regex(
    /^[a-zA-Z0-9\u0600-\u06FF][a-zA-Z0-9\u0600-\u06FF_-]*$/,
    'اسم المستخدم يجب أن يبدأ بحرف أو رقم ويمكن أن يحتوي على أحرف وأرقام و _ و -'
  );

/**
 * Password validation schema
 * - Minimum 6 characters
 * - Maximum 128 characters
 */
export const passwordSchema = z.string()
  .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
  .max(128, 'كلمة المرور يجب ألا تتجاوز 128 حرفاً');

/**
 * Phone number validation schema
 * - Can start with + or 0
 * - Must contain at least 9 digits
 */
export const phoneSchema = z.string()
  .regex(
    /^[+0]\d{9,}$/,
    'رقم الهاتف غير صحيح. يجب أن يبدأ بـ + أو 0 ويحتوي على 10 أرقام على الأقل'
  );

/**
 * Name validation schema
 * - Minimum 2 characters
 * - Maximum 100 characters
 * - Can contain Arabic/English letters and spaces
 */
export const nameSchema = z.string()
  .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
  .max(100, 'الاسم يجب ألا يتجاوز 100 حرف')
  .regex(
    /^[a-zA-Z\u0600-\u06FF\s]+$/,
    'الاسم يجب أن يحتوي على أحرف فقط'
  );

/**
 * Email validation schema
 */
export const emailSchema = z.string()
  .email('البريد الإلكتروني غير صحيح')
  .optional();

/**
 * Login input validation
 */
export const loginInputSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم أو رقم الهاتف مطلوب'),
  password: passwordSchema,
});

/**
 * Change password input validation
 */
export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

/**
 * Validate username format
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  try {
    usernameSchema.parse(username);
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.errors[0]?.message || 'اسم المستخدم غير صحيح' };
  }
}

/**
 * Validate password format
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  try {
    passwordSchema.parse(password);
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.errors[0]?.message || 'كلمة المرور غير صحيحة' };
  }
}

/**
 * Validate phone number format
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  try {
    phoneSchema.parse(phone);
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.errors[0]?.message || 'رقم الهاتف غير صحيح' };
  }
}

