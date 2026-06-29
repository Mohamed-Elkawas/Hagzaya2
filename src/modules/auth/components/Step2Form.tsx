'use client'

import { useLanguage } from '../../../core/context/LanguageContext'
import type { useRegisterForm } from '../hooks/useRegisterForm'
import type { PlayerPosition, SkillLevel } from '../types/auth.types'

type Step2FormProps = Pick<
  ReturnType<typeof useRegisterForm>,
  | 'step2'
  | 'step2Errors'
  | 'serverError'
  | 'isLoading'
  | 'setPosition'
  | 'setSkillLevel'
  | 'handleStep2Submit'
  | 'goBack'
>

// ─── Position Config ──────────────────────────────────────────────────────────

interface PositionItem {
  key: PlayerPosition
  icon: string
  spanFull?: boolean
}

const POSITIONS: PositionItem[] = [
  { key: 'goalkeeper', icon: 'sports_soccer' },
  { key: 'defender', icon: 'shield' },
  { key: 'midfielder', icon: 'star' },
  { key: 'winger', icon: 'speed' },
  { key: 'forward', icon: 'sports_handball', spanFull: true },
]

// ─── Skill Level Labels ───────────────────────────────────────────────────────

const SKILL_LABELS: Record<number, string> = {
  1: 'مبتدئ',
  2: 'مبتدئ متقدم',
  3: 'متوسط',
  4: 'متقدم',
  5: 'محترف',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Step2Form({
  step2,
  step2Errors,
  serverError,
  isLoading,
  setPosition,
  setSkillLevel,
  handleStep2Submit,
  goBack,
}: Step2FormProps) {
  const { dir, t } = useLanguage()

  return (
    <form onSubmit={handleStep2Submit} className="space-y-8" noValidate>

      {/* ── Position Grid ───────────────────────────────────────────────────── */}
      <section>
        <label className="block text-sm font-semibold text-[#006b20] tracking-wide mb-4">
          مركز اللعب
        </label>
        <div className="grid grid-cols-2 gap-3">
          {POSITIONS.map((pos) => {
            const isActive = step2.position === pos.key
            return (
              <button
                key={pos.key}
                type="button"
                id={`position-${pos.key}`}
                onClick={() => setPosition(pos.key)}
                aria-pressed={isActive}
                className={[
                  'flex flex-col items-center justify-center p-4 rounded-xl',
                  'transition-all duration-200 cursor-pointer',
                  pos.spanFull ? 'col-span-2' : '',
                  isActive ? 'position-card-active' : 'position-card-inactive hover:bg-[#f2f4f3]',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span
                  className="material-symbols-outlined text-2xl mb-2"
                  style={{
                    fontVariationSettings: isActive
                      ? "'FILL' 1"
                      : "'FILL' 0",
                    color: isActive ? '#006b20' : '#3e4a3c',
                  }}
                >
                  {pos.icon}
                </span>
                <span
                  className={`text-sm font-semibold ${isActive ? 'text-[#006b20]' : 'text-[#3e4a3c]'
                    }`}
                >
                  {t(pos.key)}
                </span>
              </button>
            )
          })}
        </div>
        {step2Errors.position && (
          <p className="mt-2 text-sm text-[#ba1a1a]" role="alert">
            {step2Errors.position}
          </p>
        )}
      </section>

      {/* ── Skill Level Bar ─────────────────────────────────────────────────── */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-semibold text-[#006b20] tracking-wide">
            مستوى المهارة
          </label>
          {step2.skillLevel && (
            <span className="text-xs font-semibold px-3 py-1 bg-[#e6e9e8] text-[#3e4a3c] rounded-full transition-all duration-300">
              {SKILL_LABELS[step2.skillLevel]}
            </span>
          )}
        </div>

        <div
          className="flex justify-between items-center bg-[#f2f4f3] px-4 py-3 rounded-full border border-[rgba(189,202,184,0.4)]"
          role="group"
          aria-label="اختر مستوى المهارة من 1 إلى 5"
        >
          {([1, 2, 3, 4, 5] as SkillLevel[]).map((level, i, arr) => {
            const isActive =
              step2.skillLevel !== null && level <= step2.skillLevel
            const isLast = i === arr.length - 1
            return (
              <div key={level} className="flex items-center flex-1 last:flex-none">
                <button
                  type="button"
                  id={`skill-level-${level}`}
                  onClick={() => setSkillLevel(level)}
                  aria-label={`مستوى ${level} — ${SKILL_LABELS[level]}`}
                  aria-pressed={step2.skillLevel === level}
                  className={[
                    'w-10 h-10 flex items-center justify-center rounded-full',
                    'text-sm font-semibold transition-all duration-300',
                    isActive
                      ? 'skill-pill-active shadow-md'
                      : 'skill-pill-inactive hover:bg-[#f2f4f3]',
                  ].join(' ')}
                >
                  {level}
                </button>
                {/* Connector line */}
                {!isLast && (
                  <div
                    className={`h-1 flex-1 mx-1 rounded-full transition-all duration-300 ${step2.skillLevel !== null && level < step2.skillLevel
                        ? 'bg-[#006b20]'
                        : 'bg-[rgba(189,202,184,0.5)]'
                      }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {step2Errors.skillLevel && (
          <p className="mt-2 text-sm text-[#ba1a1a]" role="alert">
            {step2Errors.skillLevel}
          </p>
        )}
      </section>

      {/* ── Server Error ────────────────────────────────────────────────────── */}
      {serverError && (
        <div
          className="p-3 bg-[#ffdad6] border border-[#93000a]/20 rounded-xl text-sm text-[#93000a] text-center"
          role="alert"
        >
          {serverError}
        </div>
      )}

      {/* ── Action Footer ───────────────────────────────────────────────────── */}
      <footer className="space-y-3 pt-2">
        <button
          type="submit"
          id="create-account-btn"
          disabled={isLoading}
          className="responsive-button"
        >
          {isLoading ? (
            <>
              <span
                className="material-symbols-outlined text-xl animate-spin"
                aria-hidden="true"
              >
                progress_activity
              </span>
              جاري إنشاء الحساب...
            </>
          ) : (
            'إنشاء حساب'
          )}
        </button>

        <button
          type="button"
          onClick={goBack}
          className="w-full flex items-center justify-center gap-2 text-[#006b20] text-sm font-semibold hover:underline py-2 transition-colors"
        >
          <span
            className="material-symbols-outlined text-base"
            style={{
              transform: dir === 'rtl' ? 'scaleX(-1)' : 'none',
            }}
          >
            arrow_forward
          </span>
          رجوع
        </button>
      </footer>
    </form>
  )
}

export default Step2Form
