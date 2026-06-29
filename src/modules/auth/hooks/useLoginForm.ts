'use client'

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { ZodIssue } from 'zod'
import { loginSchema } from '../validation/auth.schema'
import { loginRequest } from '../api/auth.api'
import type {
  LoginFormState,
  UserRole,
  LoginMethod,
} from '../types/auth.types'

interface UseLoginFormReturn {
  formState: LoginFormState
  errors: Partial<Record<keyof LoginFormState, string>>
  isLoading: boolean
  serverError: string | null
  setField: <K extends keyof LoginFormState>(
    key: K,
    value: LoginFormState[K],
  ) => void
  setRole: (role: UserRole) => void
  setLoginMethod: (method: LoginMethod) => void
  togglePasswordVisibility: () => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export function useLoginForm(): UseLoginFormReturn {
  const navigate = useNavigate()

  const [formState, setFormState] = useState<LoginFormState>({
    identifier: '',
    password: '',
    role: 'player',
    loginMethod: 'phone',
    showPassword: false,
  })

  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormState, string>>
  >({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const setField = useCallback(
    <K extends keyof LoginFormState>(key: K, value: LoginFormState[K]) => {
      setFormState((prev) => ({ ...prev, [key]: value }))
      setErrors((prev) => ({ ...prev, [key]: undefined }))
      setServerError(null)
    },
    [],
  )

  const setRole = useCallback((role: UserRole) => {
    setFormState((prev) => ({ ...prev, role }))
  }, [])

  const setLoginMethod = useCallback((method: LoginMethod) => {
    setFormState((prev) => ({
      ...prev,
      loginMethod: method,
      identifier: '',
    }))
    setErrors({})
  }, [])

  const togglePasswordVisibility = useCallback(() => {
    setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setServerError(null)

      const parseResult = loginSchema.safeParse({
        identifier: formState.identifier,
        password: formState.password,
        role: formState.role,
      })

      if (!parseResult.success) {
        const fieldErrors: Partial<Record<keyof LoginFormState, string>> = {}
        parseResult.error.issues.forEach((err: ZodIssue) => {
          const field = String(err.path[0]) as keyof LoginFormState
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
        return
      }

      setIsLoading(true)
      try {
        const response = await loginRequest(
          formState.identifier,
          formState.password,
          formState.loginMethod
        )

        // 1. تخزين التوكن في الـ localStorage
        localStorage.setItem('hagzaya_token', response.token)

        // 2. تخزين الـ role المختار للرجوع إليه عند الحاجة
        localStorage.setItem('hagzaya_role', formState.role)

        // 3. الفحص الذكي للـ Role والتوجيه للوحة التحكم الصحيحة المعتمدة بالبيزنس
        if (formState.role === 'owner') {
          toast.success('مرحباً بك في لوحة تحكم مالك الملعب')
          navigate('/owner/dashboard')
        } else {
          toast.success('تم تسجيل الدخول بنجاح')
          navigate('/dashboard')
        }

      } catch (err: any) {
        const errorData = err.response?.data
        let message = 'حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.'

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
    },
    // تم إضافة formState.role لضمان تحديث دالة الـ callback عند تغيير الـ Tabs في الـ UI
    [formState, navigate],
  )

  return {
    formState,
    errors,
    isLoading,
    serverError,
    setField,
    setRole,
    setLoginMethod,
    togglePasswordVisibility,
    handleSubmit,
  }
}