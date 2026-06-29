'use client'

// ─── Skeleton Component Library ───────────────────────────────────────────────
// Provides animated shimmer placeholders for async loading states

interface SkeletonBaseProps {
  className?: string
}

// ─── Base Shimmer ─────────────────────────────────────────────────────────────

function SkeletonBase({ className = '' }: SkeletonBaseProps) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      aria-hidden="true"
      role="presentation"
    />
  )
}

// ─── Input Skeleton ───────────────────────────────────────────────────────────

function SkeletonInput({ className = '' }: SkeletonBaseProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <SkeletonBase className="h-4 w-24 rounded" />
      <SkeletonBase className="h-12 w-full rounded-xl" />
    </div>
  )
}

// ─── Button Skeleton ──────────────────────────────────────────────────────────

function SkeletonButton({ className = '' }: SkeletonBaseProps) {
  return <SkeletonBase className={`h-14 w-full rounded-full ${className}`} />
}

// ─── Tab Skeleton ─────────────────────────────────────────────────────────────

function SkeletonTab({ className = '' }: SkeletonBaseProps) {
  return (
    <div className={`flex gap-4 ${className}`}>
      <SkeletonBase className="h-20 flex-1 rounded-2xl" />
      <SkeletonBase className="h-20 flex-1 rounded-2xl" />
    </div>
  )
}

// ─── Card Skeleton (Full Auth Card) ──────────────────────────────────────────

function SkeletonCard({ className = '' }: SkeletonBaseProps) {
  return (
    <div className={`auth-card p-8 space-y-6 ${className}`} aria-busy="true">
      {/* Header */}
      <div className="flex flex-col items-center space-y-3">
        <SkeletonBase className="w-16 h-16 rounded-2xl" />
        <SkeletonBase className="h-6 w-32 rounded" />
        <SkeletonBase className="h-4 w-40 rounded" />
      </div>

      {/* Tabs */}
      <SkeletonTab />

      {/* Sub-tabs */}
      <SkeletonBase className="h-12 w-full rounded-full" />

      {/* Inputs */}
      <div className="space-y-4">
        <SkeletonInput />
        <SkeletonInput />
      </div>

      {/* Button */}
      <SkeletonButton />

      {/* Footer */}
      <div className="space-y-2 text-center">
        <SkeletonBase className="h-4 w-48 mx-auto rounded" />
        <SkeletonBase className="h-4 w-40 mx-auto rounded" />
      </div>
    </div>
  )
}

// ─── OTP Card Skeleton ────────────────────────────────────────────────────────

function SkeletonOtpCard({ className = '' }: SkeletonBaseProps) {
  return (
    <div className={`auth-card p-8 space-y-8 ${className}`} aria-busy="true">
      {/* Header */}
      <div className="flex flex-col items-center space-y-4">
        <SkeletonBase className="w-16 h-16 rounded-full" />
        <SkeletonBase className="h-7 w-48 rounded" />
        <SkeletonBase className="h-4 w-64 rounded" />
      </div>

      {/* OTP cells */}
      <div className="flex justify-between gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBase key={i} className="w-12 h-14 rounded-lg" />
        ))}
      </div>

      {/* Timer */}
      <SkeletonBase className="h-4 w-56 mx-auto rounded" />

      {/* Submit */}
      <SkeletonButton />
    </div>
  )
}

// ─── Register Card Skeleton ───────────────────────────────────────────────────

function SkeletonRegisterCard({ className = '' }: SkeletonBaseProps) {
  return (
    <div className={`auth-card p-8 space-y-6 ${className}`} aria-busy="true">
      {/* Progress bar */}
      <div className="flex gap-2">
        <SkeletonBase className="h-2 flex-1 rounded-full" />
        <SkeletonBase className="h-2 flex-1 rounded-full" />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <SkeletonBase className="h-7 w-40 rounded" />
        <SkeletonBase className="h-4 w-64 rounded" />
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3">
        <SkeletonBase className="h-14 rounded-xl" />
        <SkeletonBase className="h-14 rounded-xl" />
      </div>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <SkeletonInput />
        <SkeletonInput />
      </div>

      {/* Remaining inputs */}
      <SkeletonInput />
      <SkeletonInput />
      <SkeletonInput />

      {/* Button */}
      <SkeletonButton />
    </div>
  )
}

// ─── Named Exports ────────────────────────────────────────────────────────────

export const Skeleton = {
  Base: SkeletonBase,
  Input: SkeletonInput,
  Button: SkeletonButton,
  Tab: SkeletonTab,
  Card: SkeletonCard,
  OtpCard: SkeletonOtpCard,
  RegisterCard: SkeletonRegisterCard,
}

export default Skeleton
