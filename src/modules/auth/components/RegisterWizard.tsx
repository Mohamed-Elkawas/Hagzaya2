'use client'

import { useNavigate } from 'react-router-dom'
import { useRegisterForm } from '../hooks/useRegisterForm'
import { useLanguage } from '../../../core/context/LanguageContext'
import { Step1Form } from './Step1Form'
import { Step2Form } from './Step2Form'

// ─── Progress Bar ─────────────────────────────────────────────────────────────

interface StepperProps {
  currentStep: 1 | 2
}

function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="flex gap-2 mb-6" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={2} aria-label="تقدم التسجيل">
      <div
        className={`h-1.5 flex-1 rounded-full transition-all duration-500 step-active`}
      />
      <div
        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${currentStep === 2 ? 'step-active' : 'step-inactive'
          }`}
      />
    </div>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export function RegisterWizard() {
  const navigate = useNavigate()
  const form = useRegisterForm()
  const { lang } = useLanguage()

  return (
    <div className={`auth-card p-6 md:p-10 w-full max-w-lg mx-auto ${lang === 'ar' ? 'font-ar' : 'font-en'}`}>
      {/* Branding */}
      <div className="text-center mb-4">
        <span className="text-2xl font-bold text-[#006b20] tracking-tight">
          Hagzaya
        </span>
      </div>

      {/* Stepper */}
      <Stepper currentStep={form.currentStep} />

      {/* Header */}
      <div className="text-center mb-6 space-y-2">
        <h1 className="text-2xl font-semibold text-[#191c1c] tracking-wide leading-relaxed mb-1">
          إنشاء حساب
        </h1>
        <p className="text-sm text-[#3e4a3c] tracking-wide leading-relaxed">
          {form.currentStep === 1
            ? 'أدخل معلوماتك الشخصية للبدء'
            : 'أخبرنا عن مهاراتك في كرة القدم'}
        </p>
      </div>

      {/* Step Views */}
      {form.currentStep === 1 ? (
        <Step1Form
          step1={form.step1}
          step1Errors={form.step1Errors}
          serverError={form.serverError}
          isLoading={form.isLoading}
          setStep1Field={form.setStep1Field}
          setRole={form.setRole}
          toggleStep1Password={form.toggleStep1Password}
          handleStep1Submit={form.handleStep1Submit}
          onNavigateLogin={() => navigate('/')}
        />
      ) : (
        <Step2Form
          step2={form.step2}
          step2Errors={form.step2Errors}
          serverError={form.serverError}
          isLoading={form.isLoading}
          setPosition={form.setPosition}
          setSkillLevel={form.setSkillLevel}
          handleStep2Submit={form.handleStep2Submit}
          goBack={form.goBack}
        />
      )}
    </div>
  )
}

export default RegisterWizard
