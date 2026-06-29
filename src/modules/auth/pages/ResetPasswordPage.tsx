'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useLanguage } from '../../../core/context/LanguageContext'
import { resetPasswordSchema } from '../validation/auth.schema'
import { resetPasswordRequest } from '../api/auth.api'
import type { ZodIssue } from 'zod'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, lang } = useLanguage()

  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('') // ✅ إضافة الـ State لحقل التأكيد
  const [showPassword, setShowPassword] = useState(false)

  // ✅ تحديث الـ Type الخاص بالأخطاء ليشمل الحقل الجديد
  const [errors, setErrors] = useState<Partial<Record<'email' | 'otpCode' | 'newPassword' | 'confirmPassword', string>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    }
  }, [location.state])

  const setField = (field: 'email' | 'otpCode' | 'newPassword' | 'confirmPassword', value: string) => {
    if (field === 'email') setEmail(value)
    if (field === 'otpCode') setOtpCode(value)
    if (field === 'newPassword') setNewPassword(value)
    if (field === 'confirmPassword') setConfirmPassword(value) // ✅ تحديث القيمة ديناميكياً

    setErrors(prev => ({ ...prev, [field]: undefined }))
    setServerError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setErrors({})

    // ─── 1. الـ Validation باستخدام الـ Schema المحدثة ───
    const parseResult = resetPasswordSchema.safeParse({
      email,
      otpCode,
      newPassword,
      confirmPassword
    })

    if (!parseResult.success) {
      const fieldErrors: Partial<Record<'email' | 'otpCode' | 'newPassword' | 'confirmPassword', string>> = {}
      parseResult.error.issues.forEach((err: ZodIssue) => {
        const field = String(err.path[0]) as 'email' | 'otpCode' | 'newPassword' | 'confirmPassword'
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)
    try {
      // ─── 2. إرسال الطلب بكافة الحقول المطلوبة للباك إند ───
      const response = await resetPasswordRequest({
        email,
        otpCode,
        newPassword,
        confirmPassword
      })

      toast.success(response.message || 'تم إعادة تعيين كلمة المرور بنجاح.')
      navigate('/')
    } catch (err: any) {
      const errorData = err.response?.data
      let message = 'حدث خطأ أثناء معالجة الطلب. حاول مرة أخرى.'

      if (errorData) {
        if (typeof errorData === 'string') message = errorData
        else if (errorData.message) message = errorData.message
        else if (errorData.title) message = errorData.title
        else if (errorData.errors) message = JSON.stringify(errorData.errors)
      }

      setServerError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#f6f8f7]">
      {/* ── Atmospheric Background Blobs ── */}
      <div aria-hidden="true" className="pointer-events-none">
        <div
          className="bg-blob"
          style={{
            top: '-10%',
            left: '-5%',
            width: '24rem',
            height: '24rem',
            background: 'rgba(0, 107, 32, 0.05)',
          }}
        />
        <div
          className="bg-blob"
          style={{
            bottom: '10%',
            right: '0%',
            width: '31rem',
            height: '31rem',
            background: 'rgba(212, 229, 235, 0.2)',
          }}
        />
      </div>

      {/* ── Reset Password Card ── */}
      <div className="relative z-10 w-full max-w-md">
        <div className={`responsive-card w-full max-w-md mx-auto px-8 py-10 md:px-10 ${lang === 'ar' ? 'font-ar' : 'font-en'}`}>
          <header className="flex flex-col items-center mb-8 space-y-2">
            <div className="w-16 h-16 bg-[#e8f5e9] rounded-2xl flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-3xl text-[#006b20]">
                password
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#191c1c]">{t('auth.reset.title')}</h1>
            <p className="text-sm text-[#3e4a3c] text-center mt-2">
              {t('auth.reset.subtitle')}
            </p>
          </header>

          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-[#ffdad6] text-[#93000a] text-sm text-center font-medium border border-[#ffb4ab]">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#3e4a3c] tracking-wide">
                {t('auth.login.input.email')}
              </label>
              <div className="relative group">
                <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none material-symbols-outlined text-xl text-[#3e4a3c]/50 group-focus-within:text-[#006b20] transition-colors`}>
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setField('email', e.target.value)}
                  disabled={isLoading}
                  placeholder="name@example.com"
                  className={`form-input px-12 ${errors.email ? 'border-[#ba1a1a] focus:border-[#ba1a1a]' : ''}`}
                  style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
                  dir="ltr"
                />
              </div>
              {errors.email && <p className="text-xs text-[#ba1a1a] font-medium">{errors.email}</p>}
            </div>

            {/* OTP Field */}
            <div className="space-y-1.5">
              <label htmlFor="otpCode" className="text-xs font-semibold text-[#3e4a3c] tracking-wide">
                {t('auth.reset.otpCode')}
              </label>
              <div className="relative group">
                <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none material-symbols-outlined text-xl text-[#3e4a3c]/50 group-focus-within:text-[#006b20] transition-colors`}>
                  pin
                </span>
                <input
                  id="otpCode"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setField('otpCode', e.target.value.replace(/\D/g, ''))}
                  disabled={isLoading}
                  maxLength={6}
                  placeholder="123456"
                  className={`form-input px-12 text-center tracking-[0.5em] font-mono text-lg ${errors.otpCode ? 'border-[#ba1a1a] focus:border-[#ba1a1a]' : ''}`}
                  dir="ltr"
                />
              </div>
              {errors.otpCode && <p className="text-xs text-[#ba1a1a] font-medium">{errors.otpCode}</p>}
            </div>

            {/* New Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="text-xs font-semibold text-[#3e4a3c] tracking-wide">
                {t('auth.reset.newPassword')}
              </label>
              <div className="relative group">
                <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none material-symbols-outlined text-xl text-[#3e4a3c]/50 group-focus-within:text-[#006b20] transition-colors`}>
                  lock
                </span>
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setField('newPassword', e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className={`form-input px-12 ${errors.newPassword ? 'border-[#ba1a1a] focus:border-[#ba1a1a]' : ''}`}
                  style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 ${lang === 'ar' ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center text-[#3e4a3c]/50 hover:text-[#006b20] transition-colors`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-[#ba1a1a] font-medium">{errors.newPassword}</p>}
            </div>

            {/* ✅ حقل تأكيد كلمة المرور الجديدة (المضاف لحل المشكلة) */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-[#3e4a3c] tracking-wide">
                {t('auth.reset.confirmPassword')}
              </label>
              <div className="relative group">
                <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none material-symbols-outlined text-xl text-[#3e4a3c]/50 group-focus-within:text-[#006b20] transition-colors`}>
                  lock_open
                </span>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setField('confirmPassword', e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className={`form-input px-12 ${errors.confirmPassword ? 'border-[#ba1a1a] focus:border-[#ba1a1a]' : ''}`}
                  style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
                  dir="ltr"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-[#ba1a1a] font-medium">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !otpCode || !newPassword || !confirmPassword}
              className="responsive-button mt-6"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                  <span>{t('auth.reset.loading')}</span>
                </>
              ) : (
                <span>{t('auth.reset.btn')}</span>
              )}
            </button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm font-semibold text-[#006b20] hover:underline transition-all"
              >
                {t('auth.reset.backToLogin')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default ResetPasswordPage