'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { verifyOtpRequest, resendOtpRequest } from '../api/auth.api'

const OTP_LENGTH = 6
const COUNTDOWN_SECONDS = 59

interface UseOtpVerificationReturn {
  otp: string[]
  email: string
  countdown: number
  canResend: boolean
  isLoading: boolean
  isComplete: boolean
  serverError: string | null
  inputRefs: React.RefObject<(HTMLInputElement | null)[]>
  handleCellChange: (index: number, value: string) => void
  handleKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void
  handlePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleResend: () => Promise<void>
  goBack: () => void
}

export function useOtpVerification(): UseOtpVerificationReturn {
  const navigate = useNavigate()
  const location = useLocation()
  const email: string = (location.state as { email?: string })?.email ?? ''

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [canResend, setCanResend] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    Array(OTP_LENGTH).fill(null),
  )

  const isComplete = otp.every((cell) => cell.length === 1)

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true)
      return
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleCellChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1)
      const next = [...otp]
      next[index] = digit
      setOtp(next)
      setServerError(null)

      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [otp],
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (otp[index]) {
          const next = [...otp]
          next[index] = ''
          setOtp(next)
        } else if (index > 0) {
          const next = [...otp]
          next[index - 1] = ''
          setOtp(next)
          inputRefs.current[index - 1]?.focus()
        }
      } else if (e.key === 'ArrowLeft' && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus()
      } else if (e.key === 'ArrowRight' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    },
    [otp],
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasted = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, OTP_LENGTH)
      const next = Array(OTP_LENGTH).fill('')
      pasted.split('').forEach((char, i) => {
        next[i] = char
      })
      setOtp(next)
      const lastIdx = Math.min(pasted.length, OTP_LENGTH - 1)
      inputRefs.current[lastIdx]?.focus()
    },
    [],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isComplete) return
      setServerError(null)
      setIsLoading(true)

      try {
        // ✅ التعديل الصح: إرسال الـ الكي باسم otpCode ليطابق الـ Swagger تماماً
        await verifyOtpRequest({ email, otpCode: otp.join('') })
        navigate('/dashboard')
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? 'رمز التحقق غير صحيح. حاول مرة أخرى.'
        setServerError(message)
        toast.error(message)
        setOtp(Array(OTP_LENGTH).fill(''))
        inputRefs.current[0]?.focus()
      } finally {
        setIsLoading(false)
      }
    },
    [email, isComplete, otp, navigate],
  )

  const handleResend = useCallback(async () => {
    if (!canResend) return
    setServerError(null)

    try {
      await resendOtpRequest(email)
      setOtp(Array(OTP_LENGTH).fill(''))
      setCountdown(COUNTDOWN_SECONDS)
      setCanResend(false)
      inputRefs.current[0]?.focus()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'فشل إعادة الإرسال. حاول مرة أخرى.'
      setServerError(message)
      toast.error(message)
    }
  }, [canResend, email])

  const goBack = useCallback(() => navigate('/register'), [navigate])

  return {
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
  }
}