import apiClient from '../../../core/api/api-client'
import type {
  PlayerRegisterPayload,
  OwnerRegisterPayload,
  OtpPayload,
  AuthResponse,
  OtpResponse,
} from '../types/auth.types'

// ─── Login ────────────────────────────────────────────────────────────────────

// دالة تسجيل الدخول المعدلة لتقوم بالتحويل الذكي من identifier إلى email/phone للباك إند
export async function loginRequest(
  identifier: string,
  password: string,
  loginMethod: 'email' | 'phone'
): Promise<AuthResponse> {

  // بناء الـ Payload بالـ keys اللي الباك إند بيفهمها في الـ Swagger
  const payload: Record<string, any> = {
    password: password,
  }

  if (loginMethod === 'email') {
    payload.email = identifier;
  } else {
    payload.phone = identifier;
  }

  return await apiClient.post<AuthResponse>('/api/auth/login', payload)
}

// ─── Player Registration ──────────────────────────────────────────────────────

export async function registerPlayerRequest(
  payload: PlayerRegisterPayload,
): Promise<AuthResponse> {
  return await apiClient.post<AuthResponse>(
    '/api/auth/register/player',
    payload,
  )
}

// ─── Owner Registration ───────────────────────────────────────────────────────

export async function registerOwnerRequest(
  payload: OwnerRegisterPayload,
): Promise<AuthResponse> {
  return await apiClient.post<AuthResponse>(
    '/api/auth/register/owner',
    payload,
  )
}

// ─── OTP Verification ─────────────────────────────────────────────────────────

export async function verifyOtpRequest(
  payload: OtpPayload,
): Promise<OtpResponse> {
  return await apiClient.post<OtpResponse>('/api/auth/verify-otp', payload)
}

export async function resendOtpRequest(
  email: string,
): Promise<OtpResponse> {
  return await apiClient.post<OtpResponse>('/api/auth/resend-otp', { email })
}

// ─── Password Management ──────────────────────────────────────────────────────

export async function forgotPasswordRequest(email: string): Promise<{ success: boolean; message: string }> {
  return await apiClient.post<{ success: boolean; message: string }>('/api/auth/forgot-password', { email })
}

export async function resetPasswordRequest(
  payload: { email: string; otpCode: string; newPassword: string; confirmPassword: string }
): Promise<{ success: boolean; message: string }> {

  // بناء الـ JSON النظيف المتوافق تماماً مع حقول الباك إند
  const requestBody = {
    email: payload.email,
    otpCode: payload.otpCode,
    newPassword: payload.newPassword,
    confirmPassword: payload.confirmPassword // الحقل المفقود اللي حل المشكلة!
  };

  return await apiClient.post<{ success: boolean; message: string }>('/api/auth/reset-password', requestBody);
}