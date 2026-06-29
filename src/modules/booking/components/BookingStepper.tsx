interface BookingStepperProps {
    current: 1 | 2 | 3 | 4 | 5;
}

const STEPS = [
    { n: 1, label: 'التاريخ' },
    { n: 2, label: 'الفترة' },
    { n: 3, label: 'وسيلة الدفع' },
    { n: 4, label: 'الإيصال' },
] as const;

/**
 * Step 5 (My Bookings) is a destination, not part of the linear flow, so it
 * isn't represented in the stepper — only the 4 steps that lead to a
 * submitted booking are shown.
 */
export function BookingStepper({ current }: BookingStepperProps) {
    return (
        <div className="bg-white rounded-2xl border border-[#e1e3e1] p-4 shadow-sm">
            <div className="flex items-center justify-center gap-2 md:gap-4 overflow-x-auto">
                {STEPS.map((s, idx) => (
                    <div key={s.n} className="flex items-center gap-2 md:gap-4">
                        <div
                            className={`flex items-center gap-2 shrink-0 ${current >= s.n ? 'text-[#006b20]' : 'text-[#3e4a3c]/50'
                                }`}
                        >
                            <div
                                className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${current > s.n
                                        ? 'bg-[#006b20] text-white'
                                        : current === s.n
                                            ? 'bg-[#006b20] text-white'
                                            : 'bg-[#f0f2f0]'
                                    }`}
                            >
                                {current > s.n ? (
                                    <span className="material-symbols-outlined text-sm">check</span>
                                ) : (
                                    s.n
                                )}
                            </div>
                            <span className="text-xs md:text-sm font-bold hidden sm:inline">{s.label}</span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div className="w-8 md:w-16 h-1 bg-[#f0f2f0] rounded-full overflow-hidden shrink-0">
                                <div
                                    className={`h-full bg-[#006b20] transition-all duration-500 ${current > s.n ? 'w-full' : 'w-0'
                                        }`}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}