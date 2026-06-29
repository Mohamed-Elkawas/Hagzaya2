import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../api/booking.api';
import { BookingStatusBadge } from '../components/Bookingstatusbadge';
import { BookingStatus, PAYMENT_METHOD_LABELS } from '../types/Booking.enums';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatTime(timeStr: string) {
    try {
        if (!timeStr) return '--:--';
        if (timeStr.includes('T')) {
            return new Date(timeStr).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        }
        // HH:MM:SS → 12-hour Arabic
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
            const hour = parseInt(parts[0], 10);
            const minute = parts[1];
            const ampm = hour >= 12 ? 'م' : 'ص';
            const displayHour = hour % 12 === 0 ? 12 : hour % 12;
            return `${displayHour}:${minute} ${ampm}`;
        }
        return timeStr;
    } catch {
        return timeStr || '--:--';
    }
}

function formatDisplayDate(dateStr: string) {
    if (!dateStr) return '--';
    try {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('ar-EG', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

/** Statuses a player can still cancel from within this UI. */
const CANCELLABLE_STATUSES: BookingStatus[] = [
    BookingStatus.Pending,
    BookingStatus.PendingPayment,
    BookingStatus.PaymentSubmitted,
    BookingStatus.AwaitingAdminApproval,
];

// ─────────────────────────────────────────────────────────────────────────────
// Safe payload unpack
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The API may nest data one level deep (`res.data`) or return it directly.
 * Regardless of shape, this returns an object guaranteed to have:
 *   { upcoming: any[], past: any[], cancelled: any[] }
 */
function unpackResponse(res: any): { upcoming: any[]; past: any[]; cancelled: any[] } {
    // Some HTTP clients wrap the server response: { data: <actual body> }
    const payload = res?.data != null ? res.data : res;

    const toArray = (v: unknown): any[] => (Array.isArray(v) ? v : []);

    // ── New categorised shape ─────────────────────────────────────────────────
    if (payload && typeof payload === 'object' && !Array.isArray(payload) &&
        ('upcoming' in payload || 'past' in payload || 'cancelled' in payload)) {
        return {
            upcoming: toArray(payload.upcoming),
            past: toArray(payload.past),
            cancelled: toArray(payload.cancelled),
        };
    }

    // ── Legacy flat array — treat everything as upcoming ──────────────────────
    if (Array.isArray(payload)) {
        return { upcoming: payload, past: [], cancelled: [] };
    }

    // ── Unknown shape — log and return empty ──────────────────────────────────
    console.warn('[MyBookingsPage] Unexpected API response shape:', payload);
    return { upcoming: [], past: [], cancelled: [] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MyBookingsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past_cancelled'>('upcoming');

    const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
    const [pastCancelledBookings, setPastCancelledBookings] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [cancelingId, setCancelingId] = useState<number | null>(null);
    const [cancelTarget, setCancelTarget] = useState<any | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelError, setCancelError] = useState<string | null>(null);

    const loadBookings = () => {
        setIsLoading(true);
        setLoadError(null);

        bookingApi
            .getMyBookings()
            .then((res: any) => {
                const { upcoming, past, cancelled } = unpackResponse(res);
                setUpcomingBookings(upcoming);
                // Merge past + cancelled into a single "history" tab
                setPastCancelledBookings([...past, ...cancelled]);
            })
            .catch((err) => {
                console.error('[MyBookingsPage] Failed to load bookings:', err);
                setLoadError('تعذر تحميل حجوزاتك. حاول مرة أخرى.');
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        loadBookings();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Pay Now (resume PendingPayment booking) ──────────────────────────────

    /**
     * Seeds the BookingProvider's sessionStorage so that ReceiptUploadPage
     * has bookingId, paymentMethod and totalAmount available on first render.
     * The correct route is /booking/receipt (registered in App.tsx line 66).
     */
    const handlePayNow = (booking: any) => {
        const bookingId: number = booking.id ?? booking.bookingId;
        const primarySlot = Array.isArray(booking.slots) ? booking.slots[0] : undefined;

        const flowState = {
            bookingId,
            paymentMethod: booking.paymentMethod ?? 'VodafoneCash',
            totalAmount: booking.finalPrice ?? booking.totalPrice ?? booking.totalAmount,
            slot: primarySlot,
            fieldName: primarySlot?.fieldName ?? booking.fieldName ?? '',
            fieldId: primarySlot?.fieldId ?? booking.fieldId,
            date: primarySlot?.date ?? booking.date ?? '',
        };

        // BookingProvider initialises from this key on mount (useBookingFlow.tsx:23)
        sessionStorage.setItem('hagzaya_booking_flow_state', JSON.stringify(flowState));

        // Route: /booking/receipt  ← exists in App.tsx, wrapped by BookingProvider
        navigate('/booking/receipt');
    };

    // ── Cancellation ─────────────────────────────────────────────────────────

    const handleConfirmCancel = async () => {
        if (!cancelTarget) return;
        const targetId: number = cancelTarget.id ?? cancelTarget.bookingId;
        setCancelingId(targetId);
        setCancelError(null);

        try {
            await bookingApi.cancelBooking({
                bookingId: targetId,
                reason: cancelReason.trim() || 'ألغى اللاعب الحجز',
            });

            // Optimistic local update — move booking to history tab
            setUpcomingBookings((prev) => prev.filter((b) => (b.id ?? b.bookingId) !== targetId));
            setPastCancelledBookings((prev) => [
                { ...cancelTarget, status: BookingStatus.Cancelled },
                ...prev,
            ]);

            setCancelTarget(null);
            setCancelReason('');
        } catch (err) {
            console.error('[MyBookingsPage] Cancel failed:', err);
            setCancelError('تعذر إلغاء الحجز. يرجى المحاولة مرة أخرى.');
        } finally {
            setCancelingId(null);
        }
    };

    // ── Derived state ────────────────────────────────────────────────────────

    const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastCancelledBookings;

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#f6f8f7] pb-16 font-ar" dir="rtl">
            <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 space-y-6">

                {/* ── Page header ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-black text-[#191c1c]">حجوزاتي</h1>
                    <button
                        onClick={() => navigate('/fields')}
                        className="text-xs font-bold text-[#006b20] flex items-center gap-1 bg-[#006b20]/5 px-3 py-1.5 rounded-full hover:bg-[#006b20]/10 transition-colors"
                    >
                        <span>حجز جديد</span>
                        <span className="material-symbols-outlined text-base">add_circle</span>
                    </button>
                </div>

                {/* ── Tabs ────────────────────────────────────────────────── */}
                <div className="flex border-b border-[#e1e3e1]">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all ${
                            activeTab === 'upcoming'
                                ? 'border-[#006b20] text-[#006b20]'
                                : 'border-transparent text-[#3e4a3c]/60'
                        }`}
                    >
                        الحجوزات القادمة ({upcomingBookings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('past_cancelled')}
                        className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all ${
                            activeTab === 'past_cancelled'
                                ? 'border-[#006b20] text-[#006b20]'
                                : 'border-transparent text-[#3e4a3c]/60'
                        }`}
                    >
                        المكتملة والملغية ({pastCancelledBookings.length})
                    </button>
                </div>

                {/* ── Body ────────────────────────────────────────────────── */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <span className="material-symbols-outlined animate-spin text-3xl text-[#006b20]">
                            progress_activity
                        </span>
                    </div>

                ) : loadError ? (
                    <div className="bg-white rounded-2xl border border-[#e1e3e1] p-8 text-center space-y-3">
                        <p className="text-xs font-bold text-[#c62828]">{loadError}</p>
                        <button
                            onClick={loadBookings}
                            className="text-xs font-bold text-[#006b20] underline"
                        >
                            إعادة المحاولة
                        </button>
                    </div>

                ) : currentBookings.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#e1e3e1] p-12 text-center space-y-4 shadow-sm">
                        <span className="material-symbols-outlined text-5xl text-[#3e4a3c]/20">event_busy</span>
                        <div className="space-y-1">
                            <h3 className="font-bold text-sm text-[#191c1c]">
                                {activeTab === 'upcoming' ? 'لا توجد حجوزات جارية' : 'سجل الحجوزات فارغ'}
                            </h3>
                            <p className="text-xs text-[#3e4a3c]/70">
                                {activeTab === 'upcoming'
                                    ? 'جميع ملاعبك بانتظارك، ابدأ بالحجز الآن!'
                                    : 'لم تقم بأي حجوزات سابقة بعد.'}
                            </p>
                        </div>
                        {activeTab === 'upcoming' && (
                            <button
                                onClick={() => navigate('/fields')}
                                className="bg-[#006b20] hover:bg-[#005218] text-white py-2.5 px-6 rounded-xl text-xs font-bold transition-colors"
                            >
                                تصفح الملاعب الآن
                            </button>
                        )}
                    </div>

                ) : (
                    <div className="space-y-4">
                        {currentBookings.map((booking) => {
                            const bookingId: number = booking.id ?? booking.bookingId;

                            // ── Safely unpack the first slot for display fields ──────────
                            const primarySlot = Array.isArray(booking.slots) ? booking.slots[0] : undefined;
                            const fieldName: string =
                                primarySlot?.fieldName ?? booking.fieldName ?? 'ملعب كرة قدم';
                            const fieldCity: string =
                                primarySlot?.fieldCity ?? booking.fieldCity ?? '';
                            const bookingDate: string =
                                primarySlot?.date ?? booking.date ?? '';
                            const startTime: string =
                                primarySlot?.startTime ?? booking.startTime ?? '';
                            const endTime: string =
                                primarySlot?.endTime ?? booking.endTime ?? '';
                            const displayPrice: number | undefined =
                                booking.finalPrice ?? booking.totalPrice ?? booking.totalAmount;
                            const paymentMethod = booking.paymentMethod;

                            const canCancel =
                                activeTab === 'upcoming' &&
                                CANCELLABLE_STATUSES.includes(booking.status);

                            return (
                                <div
                                    key={bookingId}
                                    className="bg-white rounded-2xl border border-[#e1e3e1] p-5 shadow-sm hover:shadow-md transition-shadow space-y-4"
                                >
                                    {/* ── Card header: field name + status badge ── */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1.5 min-w-0">
                                            <h3 className="font-extrabold text-sm text-[#191c1c] truncate">
                                                {fieldName}
                                            </h3>

                                            {/* Meta row */}
                                            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-[#3e4a3c] font-semibold">
                                                {fieldCity && (
                                                    <div className="flex items-center gap-1 bg-[#f0f2f0] px-2 py-0.5 rounded text-[11px]">
                                                        <span className="material-symbols-outlined text-xs">
                                                            location_on
                                                        </span>
                                                        <span>{fieldCity}</span>
                                                    </div>
                                                )}
                                                {bookingDate && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm text-[#006b20]">
                                                            calendar_month
                                                        </span>
                                                        <span>{formatDisplayDate(bookingDate)}</span>
                                                    </div>
                                                )}
                                                {(startTime || endTime) && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm text-[#006b20]">
                                                            schedule
                                                        </span>
                                                        <span>
                                                            {formatTime(startTime)} — {formatTime(endTime)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <BookingStatusBadge status={booking.status} />
                                    </div>

                                    {/* ── Card footer: price + cancel button ── */}
                                    <div className="flex items-center justify-between pt-3.5 border-t border-[#f0f2f0]">
                                        <div className="flex flex-col gap-0.5">
                                            {displayPrice != null && (
                                                <>
                                                    <span className="text-[10px] text-[#3e4a3c]/60 font-bold">
                                                        إجمالي المبلغ
                                                    </span>
                                                    <span className="text-sm font-black text-[#006b20]">
                                                        EGP {displayPrice}
                                                    </span>
                                                </>
                                            )}
                                            {paymentMethod && (
                                                <span className="text-[10px] text-[#3e4a3c]/50 font-semibold">
                                                    {PAYMENT_METHOD_LABELS[paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] ?? paymentMethod}
                                                </span>
                                            )}
                                        </div>

                                        {/* ── Action buttons (right side) ── */}
                                        <div className="flex items-center gap-2">
                                            {/* Confirm Payment — only for PendingPayment status */}
                                            {booking.status === BookingStatus.PendingPayment && (
                                                <button
                                                    onClick={() => handlePayNow(booking)}
                                                    className="bg-[#006b20] hover:bg-[#005218] text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                                                >
                                                    <span className="material-symbols-outlined text-base">upload_file</span>
                                                    <span>تأكيد الدفع ورفع الإيصال</span>
                                                </button>
                                            )}

                                            {/* Cancel booking */}
                                            {canCancel && (
                                                <button
                                                    onClick={() => setCancelTarget(booking)}
                                                    disabled={cancelingId === bookingId}
                                                    className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl flex items-center gap-1 disabled:opacity-50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-base">cancel</span>
                                                    <span>إلغاء الحجز</span>
                                                </button>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Cancel confirmation modal ──────────────────────────────── */}
            {cancelTarget && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50"
                    onClick={() => !cancelingId && setCancelTarget(null)}
                >
                    <div
                        className="bg-white rounded-2xl border border-[#e1e3e1] shadow-2xl p-6 max-w-sm w-full space-y-5"
                        dir="rtl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-2">
                            <h3 className="font-extrabold text-base text-[#191c1c]">تأكيد إلغاء الحجز</h3>
                            <p className="text-xs text-[#3e4a3c]/80 leading-relaxed">
                                هل أنت متأكد من إلغاء حجز ملعب{' '}
                                <span className="font-bold text-[#191c1c]">
                                    {(Array.isArray(cancelTarget.slots) && cancelTarget.slots[0]?.fieldName) ||
                                        cancelTarget.fieldName ||
                                        'الملعب'}
                                </span>
                                ؟ هذا الإجراء سيقوم بإلغاء حجز الفترة الزمنية بالكامل.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#3e4a3c]">
                                سبب الإلغاء (اختياري)
                            </label>
                            <input
                                type="text"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="مثال: تغيرت الخطط أو الموعد غير مناسب"
                                className="w-full text-xs font-semibold px-3 h-11 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20] focus:ring-1 focus:ring-[#006b20] transition-all"
                            />
                        </div>

                        {cancelError && (
                            <div className="bg-[#fdecea] rounded-xl p-3 text-xs font-bold text-[#c62828]">
                                {cancelError}
                            </div>
                        )}

                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={handleConfirmCancel}
                                disabled={cancelingId === (cancelTarget.id ?? cancelTarget.bookingId)}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
                            >
                                {cancelingId === (cancelTarget.id ?? cancelTarget.bookingId) ? (
                                    <span className="material-symbols-outlined animate-spin text-base">
                                        progress_activity
                                    </span>
                                ) : (
                                    <span>تأكيد الإلغاء</span>
                                )}
                            </button>
                            <button
                                onClick={() => { setCancelTarget(null); setCancelError(null); }}
                                disabled={cancelingId != null}
                                className="flex-1 bg-[#f0f2f0] hover:bg-[#e1e3e1] text-[#191c1c] py-2.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
                            >
                                تراجع
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}