import { useState } from 'react';
import { BookingStepper } from '../components/BookingStepper';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { PaymentMethod, PAYMENT_METHOD_LABELS } from '../types/Booking.enums';

// ── fieldId removed from props — it was declared but never used ───────────────
interface PaymentMethodsPageProps {
    onNext: () => void;
    onBack: () => void;
}

function formatTime(timeStr: string) {
    try {
        if (!timeStr) return '--:--';
        if (timeStr.includes('T')) {
            return new Date(timeStr).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        }
        return timeStr.slice(0, 5); // HH:MM:SS → HH:MM
    } catch {
        return timeStr || '--:--';
    }
}

const WALLET_INFO: Record<
    PaymentMethod,
    { icon: string; iconColor: string; label: string; value: string; hint: string }
> = {
    [PaymentMethod.VodafoneCash]: {
        icon: 'phone_android',
        iconColor: 'text-red-500',
        label: 'فودافون كاش',
        value: '01012345678',
        hint: 'يرجى تحويل المبلغ إلى رقم فودافون كاش التالي',
    },
    [PaymentMethod.InstaPay]: {
        icon: 'send_money',
        iconColor: 'text-blue-500',
        label: 'إنستا باي',
        value: 'hagzaya@instapay',
        hint: 'يرجى التحويل إلى عنوان إنستا باي التالي',
    },
};

export function PaymentMethodsPage({ onNext, onBack }: PaymentMethodsPageProps) {
    const { state, updateState } = useBookingFlow();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
        state.paymentMethod ?? PaymentMethod.VodafoneCash
    );

    // ── Loading guard — shows a brief spinner instead of crashing ─────────────
    // bookingId is written by TimeSlotsPage before onNext() fires, but React
    // context flushes asynchronously. The spinner resolves on the very next tick.
    if (state.bookingId == null) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3" dir="rtl">
                <span className="material-symbols-outlined animate-spin text-3xl text-[#006b20]">
                    progress_activity
                </span>
                <p className="text-xs text-[#3e4a3c] font-semibold">جاري تحميل بيانات الحجز…</p>
            </div>
        );
    }

    const wallet = WALLET_INFO[paymentMethod];

    const handleNext = () => {
        updateState({ paymentMethod });
        onNext();
    };

    return (
        <div className="bg-[#f6f8f7] pb-6 font-ar" dir="rtl">
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
                            <span className="material-symbols-outlined text-[#3e4a3c] text-base">arrow_forward</span>
                        </button>
                        <div>
                            <h1 className="font-extrabold text-lg text-[#191c1c]">وسيلة الدفع</h1>
                            {state.slot && (
                                <p className="text-xs text-[#3e4a3c]">
                                    {formatTime(state.slot.startTime)} — {formatTime(state.slot.endTime)}
                                    {state.totalAmount != null && (
                                        <span className="font-black text-[#006b20]"> · EGP {state.totalAmount}</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Booking reference pill */}
                    <div className="flex items-center gap-1.5 bg-[#f0f2f0] rounded-lg px-3 py-2 w-fit text-[10px] font-bold text-[#3e4a3c]">
                        <span className="material-symbols-outlined text-xs">receipt_long</span>
                        <span>رقم الحجز: <span className="text-[#006b20]">#{state.bookingId}</span></span>
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
                                        {PAYMENT_METHOD_LABELS[method]}
                                    </p>
                                    {isActive && (
                                        <span className="text-[10px] bg-[#006b20] text-white px-2 py-0.5 rounded-full font-bold">
                                            محدد
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
                            <p className="mb-1">{wallet.hint}:</p>
                            <span className="bg-[#006b20] text-white px-3 py-1 rounded-lg font-black inline-block tracking-wide">
                                {wallet.value}
                            </span>
                        </div>
                    </div>

                    {/* Amount summary */}
                    {state.totalAmount != null && (
                        <div className="bg-[#f0f2f0] rounded-xl p-4 space-y-2 text-xs font-bold text-[#3e4a3c]">
                            <div className="flex justify-between">
                                <span>المبلغ المطلوب تحويله</span>
                                <span className="text-[#006b20] text-sm font-black">EGP {state.totalAmount}</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleNext}
                        className="w-full bg-[#006b20] hover:bg-[#005318] text-white py-3.5 rounded-xl font-black text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <span>الانتقال لرفع الإيصال</span>
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </button>
                </div>
            </div>
        </div>
    );
}