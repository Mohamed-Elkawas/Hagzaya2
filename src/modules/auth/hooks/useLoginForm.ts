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
    setFormState((prev) => {
      // الـ Admin يفضل دائماً أن يسجل بالبريد الإلكتروني تلقائياً لتسهيل التجربة
      const defaultMethod = role.toLowerCase() === 'admin' ? 'email' : prev.loginMethod;
      return {
        ...prev,
        role,
        loginMethod: defaultMethod
      };
    })
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
          formState.loginMethod,
          formState.role
        )

        const responseData = (response as any).data || response;
        const token = responseData?.token;
        const returnedRole = responseData?.role || formState.role;

        if (!token) {
          throw new Error('لم يتم استلام رمز الدخول (Token) من السيرفر بشكل صحيح.');
        }

        // 1. تخزين البيانات بشكل سليم
        localStorage.setItem('hagzaya_token', token)
        localStorage.setItem('hagzaya_role', returnedRole)

        // 2. الفحص الذكي والآمن بتحويل النص لحروف صغيرة لحل أزمة (Admin vs admin)
        const normalizedRole = String(returnedRole).toLowerCase();

        if (normalizedRole === 'admin') {
          toast.success('مرحباً بك في لوحة تحكم المسؤول (Admin)')
          navigate('/admin/dashboard')
        } else if (normalizedRole === 'owner') {
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
        } else if (err.message) {
          message = err.message
        }

        setServerError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    },
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