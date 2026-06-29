import { useNavigate } from 'react-router-dom';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { PAYMENT_METHOD_LABELS } from '../types/Booking.enums';

interface BookingSuccessPageProps {
    onClose: () => void;
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

function formatDate(dateStr: string) {
    if (!dateStr) return '--';
    try {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

interface SummaryRowProps {
    icon: string;
    label: string;
    value: string;
    valueClass?: string;
}

function SummaryRow({ icon, label, value, valueClass = 'text-[#191c1c]' }: SummaryRowProps) {
    return (
        <div className="flex items-center justify-between gap-2 py-2.5 border-b border-[#e1e3e1] last:border-0">
            <div className="flex items-center gap-2 text-xs font-bold text-[#3e4a3c]">
                <span className="material-symbols-outlined text-sm text-[#3e4a3c]/50">{icon}</span>
                <span>{label}</span>
            </div>
            <span className={`text-xs font-black ${valueClass}`}>{value}</span>
        </div>
    );
}

export function BookingSuccessPage({ onClose }: BookingSuccessPageProps) {
    const navigate = useNavigate();
    const { state, clearState } = useBookingFlow();

    const handleGoToBookings = () => {
        clearState();
        onClose();
        navigate('/my-bookings');
    };

    const handleCloseWizard = () => {
        clearState();
        onClose();
    };

    return (
        <div className="bg-[#f6f8f7] flex flex-col items-center justify-center pt-8 px-2 pb-6" dir="rtl">
            <div className="bg-white rounded-3xl border border-[#e1e3e1] shadow-sm p-8 max-w-md w-full space-y-6">

                {/* ── Success icon ─────────────────────────────────────────────── */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-20 h-20 bg-[#e8f5e9] rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-[#006b20]">check_circle</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-[#191c1c]">تم إرسال إيصال الدفع بنجاح</h2>
                        <p className="text-xs text-[#3e4a3c] mt-1 leading-relaxed">
                            سيتم مراجعة الإيصال والتأكيد خلال دقائق.
                            <br />
                            ستتلقى إشعاراً فور تأكيد الحجز.
                        </p>
                    </div>
                </div>

                {/* ── Booking summary card ──────────────────────────────────────── */}
                <div className="bg-[#f6f8f7] rounded-2xl border border-[#e1e3e1] p-4 space-y-0">
                    <p className="text-[10px] font-black text-[#3e4a3c]/50 uppercase tracking-wider mb-2">
                        ملخص الحجز
                    </p>

                    {state.bookingId != null && (
                        <SummaryRow
                            icon="receipt_long"
                            label="رقم الحجز"
                            value={`#${state.bookingId}`}
                            valueClass="text-[#006b20]"
                        />
                    )}

                    {state.fieldName && (
                        <SummaryRow
                            icon="sports_soccer"
                            label="الملعب"
                            value={state.fieldName}
                        />
                    )}

                    {state.date && (
                        <SummaryRow
                            icon="calendar_today"
                            label="التاريخ"
                            value={formatDate(state.date)}
                        />
                    )}

                    {state.slot && (
                        <SummaryRow
                            icon="schedule"
                            label="الفترة"
                            value={`${formatTime(state.slot.startTime)} — ${formatTime(state.slot.endTime)}`}
                        />
                    )}

                    {state.paymentMethod && (
                        <SummaryRow
                            icon="payments"
                            label="وسيلة الدفع"
                            value={PAYMENT_METHOD_LABELS[state.paymentMethod]}
                        />
                    )}

                    {state.totalAmount != null && (
                        <SummaryRow
                            icon="monetization_on"
                            label="المبلغ المدفوع"
                            value={`EGP ${state.totalAmount}`}
                            valueClass="text-[#006b20] text-sm"
                        />
                    )}
                </div>

                {/* ── Action buttons ────────────────────────────────────────────── */}
                <div className="flex gap-3">
                    <button
                        onClick={handleGoToBookings}
                        className="flex-1 bg-[#006b20] hover:bg-[#005318] text-white py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-sm">event_available</span>
                        <span>حجوزاتي</span>
                    </button>
                    <button
                        onClick={handleCloseWizard}
                        className="flex-1 bg-[#f0f2f0] hover:bg-[#e1e3e1] text-[#191c1c] py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                        <span>إغلاق</span>
                    </button>
                </div>
            </div>
        </div>
    );
}