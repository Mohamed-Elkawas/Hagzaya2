export type UserRole = 'player' | 'owner'

export type LoginMethod = 'phone' | 'email'

export type PlayerPosition =
  | 'goalkeeper'
  | 'defender'
  | 'midfielder'
  | 'winger'
  | 'forward'

export type Gender = 'male' | 'female'

export type SkillLevel = 1 | 2 | 3 | 4 | 5

// ─── Request Payloads ─────────────────────────────────────────────────────────

// تم تعديلها لتطابق LoginRequest في الباك إند
export interface LoginPayload {
  email?: string | null
  phone?: string | null
  password: string
  role?: string
}

export interface PlayerRegisterStep1Payload {
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  dateOfBirth: string  // ISO date string
  gender: Gender
  address: string
  password: string
  role: 'player'
}

export interface PlayerRegisterStep2Payload {
  position: PlayerPosition
  skillLevel: SkillLevel
}

export interface PlayerRegisterPayload {
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  password: string
  position: PlayerPosition | string
  skillLevel: SkillLevel
}

// تم مطابقتها مع OwnerRegisterRequest في الـ Swagger
export interface OwnerRegisterPayload {
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  password: string
  playgroundAddress?: string | null
  photoUrl?: string | null
  businessLicenseUrl?: string | null
}

// تم تعديل الكي ليكون otpCode ليطابق الباك إند
export interface OtpPayload {
  email: string
  otpCode: string
}

export interface ResetPasswordPayload {
  email: string
  otpCode: string
  newPassword: string
}

// ─── Response Shapes ──────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  username: string
  email: string
  role: UserRole
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export interface OtpResponse {
  success: boolean;
  message: string;
}

// ─── Form State Shapes ────────────────────────────────────────────────────────

export interface LoginFormState {
  identifier: string // سنستخدم هذا في الفرونت فقط ثم نقسمه قبل الإرسال
  password: string
  role: UserRole
  loginMethod: LoginMethod
  showPassword: boolean
}

export interface RegisterStep1FormState {
  role: UserRole
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  dateOfBirth: string
  gender: Gender | ''
  address: string
  password: string
  showPassword: boolean
}

export interface RegisterStep2FormState {
  position: PlayerPosition | null
  skillLevel: SkillLevel | null
}