'use client'

import type { useRegisterForm } from '../hooks/useRegisterForm'
import type { UserRole } from '../types/auth.types'

type Step1FormProps = Pick<
  ReturnType<typeof useRegisterForm>,
  | 'step1'
  | 'step1Errors'
  | 'serverError'
  | 'isLoading'
  | 'setStep1Field'
  | 'setRole'
  | 'toggleStep1Password'
  | 'handleStep1Submit'
>

interface Step1FormComponentProps extends Step1FormProps {
  onNavigateLogin: () => void
}

// ─── Role Button ──────────────────────────────────────────────────────────────

interface RoleButtonProps {
  roleKey: UserRole
  label: string
  icon: string
  isActive: boolean
  onSelect: (role: UserRole) => void
}

function RoleButton({ roleKey, label, icon, isActive, onSelect }: RoleButtonProps) {
  return (
    <button
      type="button"
      id={`role-btn-${roleKey}`}
      onClick={() => onSelect(roleKey)}
      aria-pressed={isActive}
      className={[
        'flex items-center justify-center gap-2 py-3 rounded-xl',
        'text-sm font-semibold transition-all duration-200 cursor-pointer',
        isActive
          ? 'border-2 border-[#006b20] bg-[#f7fff1] text-[#006b20]'
          : 'border border-[rgba(189,202,184,0.6)] bg-white text-[#3e4a3c] hover:bg-[#f2f4f3]',
      ].join(' ')}
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
      {label}
    </button>
  )
}

// ─── Labeled Input ────────────────────────────────────────────────────────────

interface LabeledInputProps {
  id: string
  label: string
  icon: string
  type?: string
  placeholder?: string
  value: string
  error?: string
  dir?: 'ltr' | 'rtl'
  onChange: (val: string) => void
  rightSlot?: React.ReactNode
}

function LabeledInput({
  id,
  label,
  icon,
  type = 'text',
  placeholder,
  value,
  error,
  dir,
  onChange,
  rightSlot,
}: LabeledInputProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-[#3e4a3c] tracking-wide"
      >
        {label}
      </label>
      <div className="relative flex items-center group">
        {/* Right icon (in RTL context this is the start) */}
        <span
          className="absolute right-4 text-[#3e4a3c]/60 material-symbols-outlined text-xl
                     pointer-events-none group-focus-within:text-[#006b20] transition-colors"
        >
          {icon}
        </span>
        <input
          id={id}
          type={type}
          dir={dir}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={[
            'form-input py-3 px-4 pr-12',
            rightSlot ? 'pl-12' : 'pl-4',
            error ? 'border-[#ba1a1a]' : '',
          ].join(' ')}
        />
        {rightSlot && (
          <div className="absolute left-0 flex items-center h-full pl-4">
            {rightSlot}
          </div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-[#ba1a1a] mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Step1Form({
  step1,
  step1Errors,
  serverError,
  isLoading,
  setStep1Field,
  setRole,
  toggleStep1Password,
  handleStep1Submit,
  onNavigateLogin,
}: Step1FormComponentProps) {
  // Using generic font class fallback handled by parent, or you could read context if needed.
  return (
    <form onSubmit={handleStep1Submit} className="space-y-6" noValidate>

      {/* ── Role Selection ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold text-[#3e4a3c] tracking-wide">
          نوع الحساب
        </span>
        <div className="grid grid-cols-2 gap-3">
          <RoleButton
            roleKey="owner"
            label="مدير ملعب"
            icon="stadium"
            isActive={step1.role === 'owner'}
            onSelect={setRole}
          />
          <RoleButton
            roleKey="player"
            label="لاعب"
            icon="sports_soccer"
            isActive={step1.role === 'player'}
            onSelect={setRole}
          />
        </div>
      </div>

      {/* ── Name Row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LabeledInput
          id="firstName"
          label="الاسم الأول"
          icon="person"
          placeholder="مثال: أحمد"
          value={step1.firstName}
          error={step1Errors.firstName}
          onChange={(v) => setStep1Field('firstName', v)}
        />
        <LabeledInput
          id="lastName"
          label="اسم العائلة"
          icon="person_outline"
          placeholder="مثال: محمد"
          value={step1.lastName}
          error={step1Errors.lastName}
          onChange={(v) => setStep1Field('lastName', v)}
        />
      </div>

      {/* ── Username ────────────────────────────────────────────────────────── */}
      <LabeledInput
        id="username"
        label="اسم المستخدم"
        icon="alternate_email"
        placeholder="username123"
        value={step1.username}
        error={step1Errors.username}
        dir="ltr"
        onChange={(v) => setStep1Field('username', v)}
      />

      {/* ── Email ───────────────────────────────────────────────────────────── */}
      <LabeledInput
        id="email"
        label="البريد الإلكتروني"
        icon="mail"
        type="email"
        placeholder="example@hagzaya.com"
        value={step1.email}
        error={step1Errors.email}
        dir="ltr"
        onChange={(v) => setStep1Field('email', v)}
      />

      {/* ── Phone ───────────────────────────────────────────────────────────── */}
      <LabeledInput
        id="phone"
        label="رقم الهاتف"
        icon="call"
        type="tel"
        placeholder="01XXXXXXXXX"
        value={step1.phone}
        error={step1Errors.phone}
        dir="ltr"
        onChange={(v) => setStep1Field('phone', v)}
      />

      {/* ── Age + Gender ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Date of Birth */}
        <div className="space-y-1.5">
          <label
            htmlFor="dob"
            className="block text-xs font-semibold text-[#3e4a3c] tracking-wide"
          >
            تاريخ الميلاد
          </label>
          <div className="relative flex items-center group">
            <span className="absolute right-4 material-symbols-outlined text-xl text-[#3e4a3c]/60 pointer-events-none group-focus-within:text-[#006b20] transition-colors">
              calendar_today
            </span>
            <input
              id="dob"
              type="date"
              value={step1.dateOfBirth}
              onChange={(e) => setStep1Field('dateOfBirth', e.target.value)}
              aria-invalid={!!step1Errors.dateOfBirth}
              className={`form-input py-3 px-4 pr-12 pl-4 ${step1Errors.dateOfBirth ? 'border-[#ba1a1a]' : ''
                }`}
            />
          </div>
          {step1Errors.dateOfBirth && (
            <p className="text-xs text-[#ba1a1a]" role="alert">
              {step1Errors.dateOfBirth}
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <label
            htmlFor="gender"
            className="block text-xs font-semibold text-[#3e4a3c] tracking-wide"
          >
            الجنس
          </label>
          <select
            id="gender"
            value={step1.gender}
            onChange={(e) =>
              setStep1Field('gender', e.target.value as 'male' | 'female' | '')
            }
            aria-invalid={!!step1Errors.gender}
            className={`form-input py-3 px-4 appearance-none ${step1Errors.gender ? 'border-[#ba1a1a]' : ''
              }`}
          >
            <option value="">اختر</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
          {step1Errors.gender && (
            <p className="text-xs text-[#ba1a1a]" role="alert">
              {step1Errors.gender}
            </p>
          )}
        </div>
      </div>

      {/* ── Address ─────────────────────────────────────────────────────────── */}
      <LabeledInput
        id="address"
        label="العنوان"
        icon="location_on"
        placeholder="المدينة، الحي"
        value={step1.address}
        error={step1Errors.address}
        onChange={(v) => setStep1Field('address', v)}
      />

      {/* ── Password ────────────────────────────────────────────────────────── */}
      <LabeledInput
        id="password"
        label="كلمة المرور"
        icon="lock"
        type={step1.showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={step1.password}
        error={step1Errors.password}
        dir="ltr"
        onChange={(v) => setStep1Field('password', v)}
        rightSlot={
          <button
            type="button"
            aria-label={step1.showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            onClick={toggleStep1Password}
            className="text-[#3e4a3c]/60 hover:text-[#006b20] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {step1.showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        }
      />

      {/* ── Server Error ────────────────────────────────────────────────────── */}
      {serverError && (
        <div
          className="p-3 bg-[#ffdad6] border border-[#93000a]/20 rounded-xl text-sm text-[#93000a] text-center"
          role="alert"
        >
          {serverError}
        </div>
      )}

      {/* ── Submit ──────────────────────────────────────────────────────────── */}
      <div className="pt-2">
        <button
          type="submit"
          id="step1-submit-btn"
          disabled={isLoading}
          className="responsive-button"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined text-xl animate-spin">
                progress_activity
              </span>
              جاري المعالجة...
            </>
          ) : (
            <>
              متابعة
              <span className="material-symbols-outlined text-base transform rotate-180">
                arrow_forward
              </span>
            </>
          )}
        </button>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <p className="text-center text-sm text-[#3e4a3c]">
        لديك حساب بالفعل؟{' '}
        <button
          type="button"
          onClick={onNavigateLogin}
          className="text-[#006b20] font-bold hover:underline"
        >
          تسجيل الدخول
        </button>
      </p>
    </form>
  )
}

export default Step1Form
