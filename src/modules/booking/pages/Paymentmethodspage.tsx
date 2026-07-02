import { useState } from 'react';
import { BookingStepper } from '../components/BookingStepper';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { PaymentMethod } from '../types/Booking.enums';
import { useLanguage } from '../../../core/context/LanguageContext';

interface PaymentMethodsPageProps {
    onNext: () => void;
    onBack: () => void;
}

function formatTime(timeStr: string, lang: 'ar' | 'en') {
    try {
        if (!timeStr) return '--:--';
        if (timeStr.includes('T')) {
            return new Date(timeStr).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return timeStr.slice(0, 5); // HH:MM:SS → HH:MM
    } catch {
        return timeStr || '--:--';
    }
}

const DICT = {
    loadingText: { ar: 'جاري تحميل بيانات الحجز…', en: 'Loading booking details…' },
    title: { ar: 'وسيلة الدفع', en: 'Payment Method' },
    bookingNum: { ar: 'رقم الحجز:', en: 'Booking #:' },
    selected: { ar: 'محدد', en: 'Selected' },
    totalRequired: { ar: 'المبلغ المطلوب تحويله', en: 'Amount Required to Transfer' },
    nextStep: { ar: 'الانتقال لرفع الإيصال', en: 'Proceed to Upload Receipt' },
    currency: { ar: 'ج.م', en: 'EGP' },
    methods: {
        [PaymentMethod.VodafoneCash]: { ar: 'فودافون كاش', en: 'Vodafone Cash' },
        [PaymentMethod.InstaPay]: { ar: 'إنستا باي', en: 'InstaPay' }
    },
    hints: {
        [PaymentMethod.VodafoneCash]: { ar: 'يرجى تحويل المبلغ إلى رقم فودافون كاش التالي', en: 'Please transfer the amount to the following Vodafone Cash number' },
        [PaymentMethod.InstaPay]: { ar: 'يرجى التحويل إلى عنوان إنستا باي التالي', en: 'Please transfer to the following InstaPay address' }
    }
} as const;

const WALLET_INFO: Record<
    PaymentMethod,
    { icon: string; iconColor: string; value: string }
> = {
    [PaymentMethod.VodafoneCash]: {
        icon: 'phone_android',
        iconColor: 'text-red-500',
        value: '01012345678',
    },
    [PaymentMethod.InstaPay]: {
        icon: 'send_money',
        iconColor: 'text-blue-500',
        value: 'hagzaya@instapay',
    },
};

export function PaymentMethodsPage({ onNext, onBack }: PaymentMethodsPageProps) {
    const { state, updateState } = useBookingFlow();
    const { lang, dir } = useLanguage();
    const isAr = lang === 'ar';
    const d = (key: keyof typeof DICT) => DICT[key][lang];

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
        state.paymentMethod ?? PaymentMethod.VodafoneCash
    );

    if (state.bookingId == null) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3" dir={dir}>
                <span className="material-symbols-outlined animate-spin text-3xl text-[#006b20]">
                    progress_activity
                </span>
                <p className="text-xs text-[#3e4a3c] font-semibold">{d('loadingText')}</p>
            </div>
        );
    }

    const wallet = WALLET_INFO[paymentMethod];

    const handleNext = () => {
        updateState({ paymentMethod });
        onNext();
    };

    const formattedAmount = new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-US', {
        minimumFractionDigits: 0
    }).format(state.totalAmount || 0);

    return (
        <div className={`bg-[#f6f8f7] pb-6 ${isAr ? 'font-ar' : 'font-en'}`} dir={dir}>
            <div className="max-w-2xl mx-auto px-2 pt-4 space-y-6">
                <BookingStepper current={3} />

                <div className="bg-white rounded-2xl border border-[#e1e3e1] p-6 shadow-sm space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="w-9 h-9 rounded-lg bg-white border border-[#e1e3e1] flex items-center justify-center hover:bg-[#f0f2f0] transition-colors shrink-0"
                            aria-label="رجوع"
                        >
                            <span className="material-symbols-outlined text-[#3e4a3c] text-base">
                                {isAr ? 'arrow_forward' : 'arrow_back'}
                            </span>
                        </button>
                        <div>
                            <h1 className="font-extrabold text-lg text-[#191c1c]">{d('title')}</h1>
                            {state.slot && (
                                <p className="text-xs text-[#3e4a3c]">
                                    {formatTime(state.slot.startTime, lang)} — {formatTime(state.slot.endTime, lang)}
                                    {state.totalAmount != null && (
                                        <span className="font-black text-[#006b20]" dir="ltr"> · {formattedAmount} {d('currency')}</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Booking reference pill */}
                    <div className="flex items-center gap-1.5 bg-[#f0f2f0] rounded-lg px-3 py-2 w-fit text-[10px] font-bold text-[#3e4a3c]">
                        <span className="material-symbols-outlined text-xs">receipt_long</span>
                        <span>{d('bookingNum')} <span className="text-[#006b20]">#{state.bookingId}</span></span>
                    </div>

                    {/* Payment method picker */}
                    <div className="grid grid-cols-2 gap-3">
                        {(Object.keys(WALLET_INFO) as PaymentMethod[]).map((method) => {
                            const info = WALLET_INFO[method];
                            const isActive = paymentMethod === method;
                            return (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                                        isActive
                                            ? 'border-[#006b20] bg-[#e8f5e9]/30'
                                            : 'border-[#e1e3e1] bg-white hover:border-[#3e4a3c]/30'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-2xl ${info.iconColor}`}>
                                        {info.icon}
                                    </span>
                                    <p className="text-xs font-black text-[#191c1c]">
                                        {DICT.methods[method][lang]}
                                    </p>
                                    {isActive && (
                                        <span className="text-[10px] bg-[#006b20] text-white px-2 py-0.5 rounded-full font-bold">
                                            {d('selected')}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Transfer instructions */}
                    <div className="bg-[#e8f5e9]/50 border border-[#006b20]/20 rounded-xl p-4 flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[#006b20] text-base shrink-0 mt-0.5">info</span>
                        <div className="text-xs font-bold text-[#006b20] leading-relaxed">
                            <p className="mb-1">{DICT.hints[paymentMethod][lang]}:</p>
                            <span className="bg-[#006b20] text-white px-3 py-1 rounded-lg font-black inline-block tracking-wide" dir="ltr">
                                {wallet.value}
                            </span>
                        </div>
                    </div>

                    {/* Amount summary */}
                    {state.totalAmount != null && (
                        <div className="bg-[#f0f2f0] rounded-xl p-4 space-y-2 text-xs font-bold text-[#3e4a3c]">
                            <div className="flex justify-between items-center">
                                <span>{d('totalRequired')}</span>
                                <span className="text-[#006b20] text-sm font-black" dir="ltr">{formattedAmount} {d('currency')}</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleNext}
                        className="w-full bg-[#006b20] hover:bg-[#005318] text-white py-3.5 rounded-xl font-black text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <span>{d('nextStep')}</span>
                        <span className="material-symbols-outlined text-lg">
                            {isAr ? 'arrow_back' : 'arrow_forward'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}