'use client'

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { ZodIssue } from 'zod/v4'
import {
  playerRegisterStep1Schema,
  playerRegisterStep2Schema,
} from '../validation/auth.schema'
import {
  registerPlayerRequest,
  registerOwnerRequest,
} from '../api/auth.api'
import type {
  RegisterStep1FormState,
  RegisterStep2FormState,
  UserRole,
  PlayerPosition,
  SkillLevel,
} from '../types/auth.types'

type Step = 1 | 2

interface UseRegisterFormReturn {
  currentStep: Step
  step1: RegisterStep1FormState
  step2: RegisterStep2FormState
  step1Errors: Partial<Record<keyof RegisterStep1FormState, string>>
  step2Errors: Partial<Record<keyof RegisterStep2FormState, string>>
  serverError: string | null
  isLoading: boolean
  setStep1Field: <K extends keyof RegisterStep1FormState>(
    key: K,
    value: RegisterStep1FormState[K],
  ) => void
  setRole: (role: UserRole) => void
  toggleStep1Password: () => void
  setPosition: (position: PlayerPosition) => void
  setSkillLevel: (level: SkillLevel) => void
  handleStep1Submit: (e: React.FormEvent) => void
  handleStep2Submit: (e: React.FormEvent) => Promise<void>
  goBack: () => void
}

export function useRegisterForm(): UseRegisterFormReturn {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const [step1, setStep1] = useState<RegisterStep1FormState>({
    role: 'player',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    password: '',
    showPassword: false,
  })

  const [step2, setStep2] = useState<RegisterStep2FormState>({
    position: null,
    skillLevel: null,
  })

  const [step1Errors, setStep1Errors] = useState<
    Partial<Record<keyof RegisterStep1FormState, string>>
  >({})

  const [step2Errors, setStep2Errors] = useState<
    Partial<Record<keyof RegisterStep2FormState, string>>
  >({})

  const setStep1Field = useCallback(
    <K extends keyof RegisterStep1FormState>(
      key: K,
      value: RegisterStep1FormState[K],
    ) => {
      setStep1((prev) => ({ ...prev, [key]: value }))
      setStep1Errors((prev) => ({ ...prev, [key]: undefined }))
      setServerError(null)
    },
    [],
  )

  const setRole = useCallback((role: UserRole) => {
    setStep1((prev) => ({ ...prev, role }))
  }, [])

  const toggleStep1Password = useCallback(() => {
    setStep1((prev) => ({ ...prev, showPassword: !prev.showPassword }))
  }, [])

  const setPosition = useCallback((position: PlayerPosition) => {
    setStep2((prev) => ({ ...prev, position }))
    setStep2Errors((prev) => ({ ...prev, position: undefined }))
  }, [])

  const setSkillLevel = useCallback((level: SkillLevel) => {
    setStep2((prev) => ({ ...prev, skillLevel: level }))
    setStep2Errors((prev) => ({ ...prev, skillLevel: undefined }))
  }, [])

  const handleOwnerRegister = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await registerOwnerRequest({
        firstName: step1.firstName,
        lastName: step1.lastName,
        username: step1.username,
        email: step1.email,
        phone: step1.phone,
        password: step1.password,
      })
      localStorage.setItem('hagzaya_token', response.token)
      // التوجيه لصفحة الـ OTP وتمرير الإيميل في الـ State
      navigate('/verify', { state: { email: step1.email } })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'حدث خطأ أثناء إنشاء الحساب.'
      setServerError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [step1, navigate])

  const handleStep1Submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setServerError(null)

      const parseResult = playerRegisterStep1Schema.safeParse({
        ...step1,
        gender: step1.gender || undefined,
      })

      if (!parseResult.success) {
        const fieldErrors: Partial<Record<keyof RegisterStep1FormState, string>> = {}
        parseResult.error.issues.forEach((err: ZodIssue) => {
          const field = String(err.path[0]) as keyof RegisterStep1FormState
          if (!fieldErrors[field]) {
            fieldErrors[field] = err.message
          }
        })
        setStep1Errors(fieldErrors)
        return
      }

      if (step1.role === 'owner') {
        handleOwnerRegister()
        return
      }

      setCurrentStep(2)
    },
    [step1, handleOwnerRegister],
  )



  const handleStep2Submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setServerError(null)

      const parseResult = playerRegisterStep2Schema.safeParse({
        position: step2.position,
        skillLevel: step2.skillLevel,
      })

      if (!parseResult.success) {
        const fieldErrors: Partial<Record<keyof RegisterStep2FormState, string>> = {}
        parseResult.error.issues.forEach((err: ZodIssue) => {
          const field = String(err.path[0]) as keyof RegisterStep2FormState
          if (!fieldErrors[field]) {
            fieldErrors[field] = err.message
          }
        })
        setStep2Errors(fieldErrors)
        return
      }

      setIsLoading(true)
      try {
        const response = await registerPlayerRequest({
          firstName: step1.firstName,
          lastName: step1.lastName,
          username: step1.username,
          email: step1.email,
          phone: step1.phone,
          password: step1.password,
          position: parseResult.data.position,
          skillLevel: parseResult.data.skillLevel as SkillLevel,
        })
        localStorage.setItem('hagzaya_token', response.token)
        navigate('/verify', { state: { email: step1.email } })
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? 'حدث خطأ أثناء إنشاء الحساب.'
        setServerError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    },
    [step1, step2, navigate],
  )

  const goBack = useCallback(() => {
    if (currentStep === 2) {
      setCurrentStep(1)
    } else {
      navigate('/')
    }
  }, [currentStep, navigate])

  return {
    currentStep,
    step1,
    step2,
    step1Errors,
    step2Errors,
    serverError,
    isLoading,
    setStep1Field,
    setRole,
    toggleStep1Password,
    setPosition,
    setSkillLevel,
    handleStep1Submit,
    handleStep2Submit,
    goBack,
  }
}