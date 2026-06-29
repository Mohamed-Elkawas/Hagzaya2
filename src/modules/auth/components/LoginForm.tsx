'use client'

import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../core/context/LanguageContext'
import { useLoginForm } from '../hooks/useLoginForm'
import type { UserRole, LoginMethod } from '../types/auth.types'

// ─── Role Tab ─────────────────────────────────────────────────────────────────

interface RoleTabProps {
  roleKey: UserRole
  label: string
  icon: string
  isActive: boolean
  onSelect: (role: UserRole) => void
}

function RoleTab({ roleKey, label, icon, isActive, onSelect }: RoleTabProps) {
  return (
    <button
      type="button"
      id={`login-role-tab-${roleKey}`}
      onClick={() => onSelect(roleKey)}
      aria-pressed={isActive}
      className={[
        'flex-1 py-4 px-2 rounded-2xl flex flex-col items-center gap-2',
        'transition-all duration-300 cursor-pointer group',
        isActive ? 'role-tab-active' : 'role-tab-inactive hover:bg-[#f2f4f3]',
      ].join(' ')}
    >
      <span
        className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform"
        style={{
          fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
          color: isActive ? '#006b20' : '#3e4a3c',
        }}
      >
        {icon}
      </span>
      <span
        className={`text-xs font-semibold tracking-wide ${
          isActive ? 'text-[#006b20]' : 'text-[#3e4a3c]'
        }`}
      >
        {label}
      </span>
    </button>
  )
}

// ─── Method Sub-Tab ───────────────────────────────────────────────────────────

interface MethodTabProps {
  methodKey: LoginMethod
  label: string
  isActive: boolean
  onSelect: (method: LoginMethod) => void
}

function MethodTab({ methodKey, label, isActive, onSelect }: MethodTabProps) {
  return (
    <button
      type="button"
      id={`login-method-tab-${methodKey}`}
      onClick={() => onSelect(methodKey)}
      aria-pressed={isActive}
      className={[
        'flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-200',
        isActive
          ? 'bg-white shadow-sm text-[#006b20]'
          : 'text-[#3e4a3c] hover:bg-[rgba(225,227,226,0.3)]',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LoginForm() {
  const navigate = useNavigate()
  const { t, lang, toggleLanguage } = useLanguage()
  const {
    formState,
    errors,
    isLoading,
    serverError,
    setField,
    setRole,
    setLoginMethod,
    togglePasswordVisibility,
    handleSubmit,
  } = useLoginForm()

  return (
    <div className={`responsive-card w-full max-w-md mx-auto px-8 py-10 md:px-10 ${lang === 'ar' ? 'font-ar' : 'font-en'}`}>

      {/* ── Brand Header ─────────────────────────────────────────────────────── */}
      <header className="flex flex-col items-center mb-8 space-y-2">
        <div
          className="w-16 h-16 bg-[#006b20] rounded-2xl flex items-center justify-center
                        mb-4 shadow-lg shadow-[rgba(0,107,32,0.25)] transform -rotate-3"
        >
          <span
            className="material-symbols-outlined text-white text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            stadium
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#006b20] tracking-wide leading-relaxed mb-0.5">
          HAGZAYA
        </h1>
        <p className="text-xs font-semibold text-[#3e4a3c]/70 tracking-widest leading-relaxed uppercase">
          FOOTBALL BOOKING
        </p>
      </header>

      {/* ── Welcome Text ─────────────────────────────────────────────────────── */}
      <section className="text-center mb-7 space-y-2">
        <h2 className="text-xl font-semibold text-[#191c1c] tracking-wide leading-relaxed mb-1">
          {t('auth.login.title')}
        </h2>
        <p className="text-sm text-[#3e4a3c] tracking-wide leading-relaxed">
          {t('auth.login.subtitle')}
        </p>
      </section>

      {/* ── Role Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex gap-3 mb-7" role="tablist" aria-label="نوع الحساب">
        <RoleTab
          roleKey="owner"
          label={t('auth.login.owner')}
          icon="storefront"
          isActive={formState.role === 'owner'}
          onSelect={setRole}
        />
        <RoleTab
          roleKey="player"
          label={t('auth.login.player')}
          icon="sports_soccer"
          isActive={formState.role === 'player'}
          onSelect={setRole}
        />
      </div>

      {/* ── Method Sub-tabs ──────────────────────────────────────────────────── */}
      <div
        className="bg-[#f2f4f3] p-1 rounded-full flex gap-1 mb-7"
        role="tablist"
        aria-label="طريقة تسجيل الدخول"
      >
        <MethodTab
          methodKey="phone"
          label={t('auth.login.method.phone')}
          isActive={formState.loginMethod === 'phone'}
          onSelect={setLoginMethod}
        />
        <MethodTab
          methodKey="email"
          label={t('auth.login.method.email')}
          isActive={formState.loginMethod === 'email'}
          onSelect={setLoginMethod}
        />
      </div>

      {/* ── Login Form ───────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* Identifier Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-identifier"
            className="block text-xs font-semibold text-[#3e4a3c] tracking-wide"
          >
            {formState.loginMethod === 'phone' ? t('auth.login.input.phone') : t('auth.login.input.email')}
          </label>
          <div className="relative group">
            <span
              className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none
                           material-symbols-outlined text-xl text-[#3e4a3c]/50
                           group-focus-within:text-[#006b20] transition-colors`}
            >
              {formState.loginMethod === 'phone' ? 'phone_iphone' : 'mail'}
            </span>
            <input
              id="login-identifier"
              type={formState.loginMethod === 'phone' ? 'tel' : 'email'}
              dir="ltr"
              placeholder={formState.loginMethod === 'phone' ? '05x xxx xxxx' : 'example@hagzaya.com'}
              value={formState.identifier}
              onChange={(e) => setField('identifier', e.target.value)}
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? 'login-identifier-error' : undefined}
              className={`form-input py-3 px-12 ${errors.identifier ? 'border-[#ba1a1a]' : ''}`}
              style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
            />
          </div>
          {errors.identifier && (
            <p id="login-identifier-error" className="text-xs text-[#ba1a1a]" role="alert">
              {errors.identifier}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold text-[#3e4a3c] tracking-wide"
            >
              {t('auth.login.input.password')}
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs font-semibold text-[#006b20] hover:underline transition-all"
            >
              {t('auth.login.forgotPassword')}
            </button>
          </div>
          <div className="relative group">
            <span
              className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none
                           material-symbols-outlined text-xl text-[#3e4a3c]/50
                           group-focus-within:text-[#006b20] transition-colors`}
            >
              lock
            </span>
            <input
              id="login-password"
              type={formState.showPassword ? 'text' : 'password'}
              dir="ltr"
              placeholder="••••••••"
              value={formState.password}
              onChange={(e) => setField('password', e.target.value)}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              className={`form-input py-3 px-12 ${errors.password ? 'border-[#ba1a1a]' : ''}`}
              style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={`absolute inset-y-0 ${lang === 'ar' ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center
                           text-[#3e4a3c]/50 hover:text-[#006b20] transition-colors`}
            >
              <span className="material-symbols-outlined text-xl">
                {formState.showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.password && (
            <p id="login-password-error" className="text-xs text-[#ba1a1a]" role="alert">
              {errors.password}
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
        <button
          type="submit"
          id="login-submit-btn"
          disabled={isLoading}
          className="responsive-button mt-2"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined text-xl animate-spin">
                progress_activity
              </span>
              {t('auth.login.loading')}
            </>
          ) : (
            t('auth.login.btn')
          )}
        </button>
      </form>

      {/* ── Footer Links ─────────────────────────────────────────────────────── */}
      <footer className="mt-8 space-y-4 text-center">
        <p className="text-sm text-[#3e4a3c]">
          {t('auth.login.noAccount')}{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-[#006b20] font-bold hover:underline px-1"
          >
            {t('auth.login.registerNow')}
          </button>
        </p>

        <div className="pt-5 border-t border-[rgba(189,202,184,0.3)]">
          <p className="text-sm text-[#3e4a3c] mb-2">{t('auth.login.ownerPrompt')}</p>
          <button
            type="button"
            onClick={() => {
              setRole('owner')
              navigate('/register')
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#006b20]
                         hover:bg-[rgba(0,107,32,0.05)] px-4 py-2 rounded-full transition-colors flex-row-reverse"
          >
            <span className="material-symbols-outlined text-sm">{lang === 'ar' ? 'arrow_back' : 'arrow_forward'}</span>
            {t('auth.login.registerHere')}
          </button>
        </div>
      </footer>

      {/* ── Language Switcher ────────────────────────────────────────────────── */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={toggleLanguage}
          className="lang-switcher"
          aria-label="تغيير اللغة"
        >
          <span className="material-symbols-outlined text-lg">language</span>
          {lang === 'ar' ? 'English' : 'العربية'}
        </button>
      </div>
    </div>
  )
}

export default LoginForm
