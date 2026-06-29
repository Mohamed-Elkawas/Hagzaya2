'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useLanguage } from '../../../core/context/LanguageContext'
import { forgotPasswordSchema } from '../validation/auth.schema'
import { forgotPasswordRequest } from '../api/auth.api'
import type { ZodIssue } from 'zod'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { lang } = useLanguage()
  
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setError('')

    const parseResult = forgotPasswordSchema.safeParse({ email })

    if (!parseResult.success) {
      const err = parseResult.error.issues[0] as ZodIssue
      setError(err.message)
      return
    }

    setIsLoading(true)
    try {
      const response = await forgotPasswordRequest(email)
      toast.success(response.message || 'تم إرسال رمز التحقق إلى بريدك الإلكتروني.')
      // Navigate to reset password and pass email in state
      navigate('/reset-password', { state: { email } })
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
      {/* ── Atmospheric Background Blobs ────────────────────────────────────── */}
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

      {/* ── Forgot Password Card ────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md">
        <div className={`responsive-card w-full max-w-md mx-auto px-8 py-10 md:px-10 ${lang === 'ar' ? 'font-ar' : 'font-en'}`}>
          <header className="flex flex-col items-center mb-8 space-y-2">
            <div className="w-16 h-16 bg-[#e8f5e9] rounded-2xl flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-3xl text-[#006b20]">
                lock_reset
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#191c1c]">نسيت كلمة المرور</h1>
            <p className="text-sm text-[#3e4a3c] text-center mt-2">
              أدخل بريدك الإلكتروني المسجل وسنرسل لك رمزاً لإعادة تعيين كلمة المرور.
            </p>
          </header>

          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-[#ffdad6] text-[#93000a] text-sm text-center font-medium border border-[#ffb4ab]">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#3e4a3c] tracking-wide">
                البريد الإلكتروني
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none material-symbols-outlined text-xl text-[#3e4a3c]/50 group-focus-within:text-[#006b20] transition-colors">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                    setServerError(null)
                  }}
                  disabled={isLoading}
                  placeholder="name@example.com"
                  className={`form-input pl-4 pr-12 text-left ${error ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/20' : ''}`}
                  dir="ltr"
                />
              </div>
              {error && <p className="text-xs text-[#ba1a1a] font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="responsive-button mt-4"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <span>إرسال رمز التحقق</span>
              )}
            </button>
            
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-[#006b20] hover:underline transition-all"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default ForgotPasswordPage
