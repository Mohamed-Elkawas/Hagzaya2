import { z } from 'zod'

// ─── Login Schema ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'هذا الحقل مطلوب')
    .refine(
      (val) =>
        /^\+?[\d\s\-()]{8,}$/.test(val) ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: 'أدخل رقم هاتف أو بريد إلكتروني صحيح' },
    ),
  password: z
    .string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  role: z.enum(['player', 'owner']),
})

export type LoginSchemaType = z.infer<typeof loginSchema>

// ─── Register Step 1 (Combined Secure Schema) ─────────────────────────────────

export const playerRegisterStep1Schema = z.object({
  role: z.enum(['player', 'owner']),
  firstName: z
    .string()
    .min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل')
    .max(50, 'الاسم طويل جداً'),
  lastName: z
    .string()
    .min(2, 'اسم العائلة يجب أن يكون حرفين على الأقل')
    .max(50, 'الاسم طويل جداً'),
  username: z
    .string()
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .max(30, 'اسم المستخدم طويل جداً')
    .regex(/^[a-zA-Z0-9_]+$/, 'يُسمح فقط بالأحرف والأرقام والشرطة السفلية'),
  email: z
    .string()
    .email('أدخل بريداً إلكترونياً صحيحاً'),
  phone: z
    .string()
    .regex(/^01\d{9}$/, 'أدخل رقم هاتف صحيح (مثال: 01XXXXXXXXX)'),

  // ✅ جعلنا هذه الحقول اختيارية ومريحة لكي لا تسبب أي تعارض عند تسجيل المالك (Owner)
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),

  password: z
    .string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
})

export type PlayerRegisterStep1SchemaType = z.infer<
  typeof playerRegisterStep1Schema
>

// ─── Register Step 2 (Player Profile) ────────────────────────────────────────
// ─── Register Step 2 (Player Profile) ────────────────────────────────────────

// ─── Register Step 2 (Player Profile) ────────────────────────────────────────

export const playerRegisterStep2Schema = z.object({
  position: z.string().refine(
    (val) => ['goalkeeper', 'defender', 'midfielder', 'winger', 'forward'].includes(val),
    { message: 'الرجاء اختيار مركز صحيح' }
  ),
  skillLevel: z
    .any()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && Number.isInteger(val), {
      message: 'يجب أن يكون مستوى المهارة رقماً صحيحاً',
    })
    .pipe(
      z.number().min(1, 'اختر مستوى المهارة').max(5, 'الحد الأقصى 5')
    ),
})

export type PlayerRegisterStep2SchemaType = z.infer<
  typeof playerRegisterStep2Schema
>

// ─── Owner Registration Schema ────────────────────────────────────────────────

export const ownerRegisterSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل'),
  lastName: z.string().min(2, 'اسم العائلة يجب أن يكون حرفين على الأقل'),
  username: z
    .string()
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .regex(/^[a-zA-Z0-9_]+$/, 'يُسمح فقط بالأحرف والأرقام والشرطة السفلية'),
  email: z.string().email('أدخل بريداً إلكترونياً صحيحاً'),
  phone: z
    .string()
    .regex(/^01\d{9}$/, 'أدخل رقم هاتف صحيح (مثال: 01XXXXXXXXX)'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

export type OwnerRegisterSchemaType = z.infer<typeof ownerRegisterSchema>

// ─── OTP Schema ───────────────────────────────────────────────────────────────

export const otpSchema = z.object({
  email: z.string().email(),
  otpCode: z // تم تحديث الكي ليتطابق مع otpCode الخاص بالباك إند
    .string()
    .length(6, 'رمز التحقق يجب أن يكون 6 أرقام')
    .regex(/^\d{6}$/, 'رمز التحقق يجب أن يحتوي على أرقام فقط'),
})

export type OtpSchemaType = z.infer<typeof otpSchema>

// ─── Forgot / Reset Password Schemas ──────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.string().email('أدخل بريداً إلكترونياً صحيحاً'),
})

export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  email: z.string().email('أدخل بريداً إلكترونياً صحيحاً'),
  otpCode: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام'),
  newPassword: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string().min(6, 'تأكيد كلمة المرور مطلوب'), // الحقل الإجباري للباك إند
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"], // هيطلع الخطأ تحت حقل التأكيد في الـ UI
});

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;