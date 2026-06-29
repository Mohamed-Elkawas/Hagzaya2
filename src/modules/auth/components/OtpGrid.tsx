'use client'

import type { useOtpVerification } from '../hooks/useOtpVerification'

type OtpGridProps = Pick<
  ReturnType<typeof useOtpVerification>,
  | 'otp'
  | 'inputRefs'
  | 'handleCellChange'
  | 'handleKeyDown'
  | 'handlePaste'
  | 'isComplete'
>

export function OtpGrid({
  otp,
  inputRefs,
  handleCellChange,
  handleKeyDown,
  handlePaste,
}: OtpGridProps) {
  return (
    <div
      className="flex justify-between gap-2 md:gap-3"
      dir="ltr"
      role="group"
      aria-label="أدخل رمز التحقق المكون من 6 أرقام"
    >
      {otp.map((cell, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          id={`otp-cell-${index}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={cell}
          autoFocus={index === 0}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`الرقم ${index + 1} من ${otp.length}`}
          className={[
            'otp-cell',
            'w-11 h-14 md:w-14 md:h-16',
            'text-center text-2xl font-semibold',
            'transition-all duration-200',
            cell ? 'filled' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onChange={(e) => handleCellChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  )
}

export default OtpGrid
