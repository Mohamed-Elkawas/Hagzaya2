'use client'

import { OtpGrid } from '../components/OtpGrid'
import { useOtpVerification } from '../hooks/useOtpVerification'
import { useLanguage } from '../../../core/context/LanguageContext'

export function VerifyOtpPage() {
  const { lang } = useLanguage()
  const {
    otp,
    email,
    countdown,
    canResend,
    isLoading,
    isComplete,
    serverError,
    inputRefs,
    handleCellChange,
    handleKeyDown,
    handlePaste,
    handleSubmit,
    handleResend,
    goBack,
  } = useOtpVerification()

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#f8faf9]">
      {/* ── Atmospheric Background ───────────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none opacity-20">
        <div
          className="bg-blob"
          style={{
            top: '-25%',
            right: '-25%',
            width: '37.5rem',
            height: '37.5rem',
            background: '#6cde73',
            filter: 'blur(120px)',
          }}
        />
        <div
          className="bg-blob"
          style={{
            bottom: '-25%',
            left: '-25%',
            width: '37.5rem',
            height: '37.5rem',
            background: '#d4e5eb',
            filter: 'blur(120px)',
          }}
        />
      </div>

      {/* ── OTP Card ─────────────────────────────────────────────────────────── */}
      <div className={`relative z-10 w-full max-w-[480px] ${lang === 'ar' ? 'font-ar' : 'font-en'}`}>
        <div className="auth-card p-8 md:p-10 flex flex-col items-center">

          {/* ── Branding Header ────────────────────────────────────────────── */}
          <div className="mb-8 text-center space-y-2">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full
                             bg-[#00872a] text-white mb-5 shadow-lg shadow-[rgba(0,107,32,0.25)]"
            >
              <span className="material-symbols-outlined text-[32px]">
                shield_lock
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-[#191c1c] tracking-wide leading-relaxed mb-2">
              تأكيد رمز التحقق
            </h1>
            <p className="text-sm text-[#3e4a3c] tracking-wide leading-relaxed max-w-[300px]">
              أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك الإلكتروني
              {email && (
                <span
                  className="text-[#006b20] font-bold block mt-1"
                  dir="ltr"
                >
                  {email}
                </span>
              )}
            </p>
          </div>

          {/* ── OTP Form ───────────────────────────────────────────────────── */}
          <form
            id="otp-form"
            onSubmit={handleSubmit}
            className="w-full space-y-7"
            noValidate
          >
            {/* OTP Grid */}
            <OtpGrid
              otp={otp}
              inputRefs={inputRefs}
              handleCellChange={handleCellChange}
              handleKeyDown={handleKeyDown}
              handlePaste={handlePaste}
              isComplete={isComplete}
            />

            {/* Timer / Resend */}
            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-sm text-[#3e4a3c]"
                >
                  لم يصلك الكود؟{' '}
                  <span className="text-[#006b20] font-bold hover:underline">
                    إعادة الإرسال الآن
                  </span>
                </button>
              ) : (
                <p className="text-xs font-semibold text-[#3e4a3c] flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    schedule
                  </span>
                  يمكنك إعادة إرسال الكود بعد{' '}
                  <span
                    className="text-[#006b20] font-bold tabular-nums"
                    aria-live="polite"
                    aria-label={`${countdown} ثانية`}
                  >
                    {String(countdown).padStart(2, '0')}
                  </span>{' '}
                  ثانية
                </p>
              )}
            </div>

            {/* Server Error */}
            {serverError && (
              <div
                className="p-3 bg-[#ffdad6] border border-[#93000a]/20 rounded-xl text-sm text-[#93000a] text-center"
                role="alert"
              >
                {serverError}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="otp-submit-btn"
                disabled={!isComplete || isLoading}
                className="responsive-button"
                aria-disabled={!isComplete || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-xl animate-spin">
                      progress_activity
                    </span>
                    جاري التحقق...
                  </>
                ) : (
                  'تأكيد الرمز'
                )}
              </button>
            </div>
          </form>

          {/* ── Back Link ──────────────────────────────────────────────────── */}
          <div className="mt-7">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 text-sm text-[#3e4a3c]
                           hover:text-[#006b20] transition-colors group"
            >
              <span>رجوع</span>
              <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                arrow_back
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default VerifyOtpPage
