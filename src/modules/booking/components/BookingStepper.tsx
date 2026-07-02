import { useLanguage } from '../../../core/context/LanguageContext';

interface BookingStepperProps {
    current: 1 | 2 | 3 | 4 | 5;
}

const DICT = {
    step1: { ar: 'التاريخ', en: 'Date' },
    step2: { ar: 'الفترة', en: 'Slot' },
    step3: { ar: 'وسيلة الدفع', en: 'Payment' },
    step4: { ar: 'الإيصال', en: 'Receipt' },
} as const;

export function BookingStepper({ current }: BookingStepperProps) {
    const { lang, dir } = useLanguage();
    const isAr = lang === 'ar';
    const d = (key: keyof typeof DICT) => DICT[key][lang];

    const STEPS = [
        { n: 1, label: d('step1') },
        { n: 2, label: d('step2') },
        { n: 3, label: d('step3') },
        { n: 4, label: d('step4') },
    ];

    return (
        <div className="bg-white rounded-2xl border border-[#e1e3e1] p-4 shadow-sm" dir={dir}>
            <div className={`flex items-center justify-center gap-2 md:gap-4 overflow-x-auto ${isAr ? 'flex-row' : 'flex-row'}`}>
                {STEPS.map((s, idx) => (
                    <div key={s.n} className={`flex items-center gap-2 md:gap-4 ${isAr ? 'flex-row' : 'flex-row'}`}>
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
                            <div className="w-8 md:w-16 h-1 bg-[#f0f2f0] rounded-full overflow-hidden shrink-0 mx-1">
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