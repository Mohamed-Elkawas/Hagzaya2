import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../api/booking.api';
import { BookingStatusBadge } from '../components/Bookingstatusbadge';
import { BookingStatus, PAYMENT_METHOD_LABELS } from '../types/Booking.enums';
import { useLanguage } from '../../../core/context/LanguageContext';

// ── Bilingual Dictionary ───────────────────────────────────────────────────────
const DICT = {
  pageTitle:       { ar: 'حجوزاتي',                      en: 'My Bookings' },
  newBooking:      { ar: 'حجز جديد',                     en: 'New Booking' },
  tabUpcoming:     { ar: 'الحجوزات القادمة',             en: 'Upcoming' },
  tabHistory:      { ar: 'المكتملة والملغية',            en: 'Completed & Cancelled' },
  retry:           { ar: 'إعادة المحاولة',               en: 'Try Again' },
  emptyUpcoming:   { ar: 'لا توجد حجوزات جارية',        en: 'No Upcoming Bookings' },
  emptyHistory:    { ar: 'سجل الحجوزات فارغ',           en: 'Booking History Empty' },
  emptyUpcomingSub:{ ar: 'جميع ملاعبك بانتظارك، ابدأ بالحجز الآن!', en: 'All fields are waiting — book now!' },
  emptyHistorySub: { ar: 'لم تقم بأي حجوزات سابقة بعد.', en: 'No past bookings yet.' },
  browseFields:    { ar: 'تصفح الملاعب الآن',            en: 'Browse Fields Now' },
  totalAmount:     { ar: 'إجمالي المبلغ',               en: 'Total Amount' },
  confirmPay:      { ar: 'تأكيد الدفع ورفع الإيصال',   en: 'Confirm Payment & Upload Receipt' },
  cancelBooking:   { ar: 'إلغاء الحجز',                 en: 'Cancel Booking' },
  defaultField:    { ar: 'ملعب كرة قدم',                en: 'Football Field' },
  // Cancel Modal
  cancelTitle:     { ar: 'تأكيد إلغاء الحجز',          en: 'Confirm Cancellation' },
  cancelDesc1:     { ar: 'هل أنت متأكد من إلغاء حجز ملعب', en: 'Are you sure you want to cancel the booking for' },
  cancelDesc2:     { ar: '؟ هذا الإجراء سيقوم بإلغاء حجز الفترة الزمنية بالكامل.', en: '? This will cancel the entire time slot.' },
  cancelReason:    { ar: 'سبب الإلغاء (اختياري)',       en: 'Cancellation Reason (optional)' },
  cancelPlaceholder:{ ar: 'مثال: تغيرت الخطط أو الموعد غير مناسب', en: 'e.g. Plans changed or unsuitable time' },
  confirmCancel:   { ar: 'تأكيد الإلغاء',              en: 'Confirm Cancellation' },
  goBack:          { ar: 'تراجع',                        en: 'Go Back' },
  // Errors
  loadError:       { ar: 'تعذر تحميل حجوزاتك. حاول مرة أخرى.', en: 'Failed to load your bookings. Please try again.' },
  cancelError:     { ar: 'تعذر إلغاء الحجز. يرجى المحاولة مرة أخرى.', en: 'Failed to cancel booking. Please try again.' },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatTime(timeStr: string, lang: 'ar' | 'en') {
    try {
        if (!timeStr) return '--:--';
        if (timeStr.includes('T')) {
            const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
            return new Date(timeStr).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
        }
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
            const hour = parseInt(parts[0], 10);
            const minute = parts[1];
            if (lang === 'ar') {
                const ampm = hour >= 12 ? 'م' : 'ص';
                const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                return `${displayHour}:${minute} ${ampm}`;
            } else {
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                return `${displayHour}:${minute} ${ampm}`;
            }
        }
        return timeStr;
    } catch {
        return timeStr || '--:--';
    }
}

function formatDisplayDate(dateStr: string, lang: 'ar' | 'en') {
    if (!dateStr) return '--';
    try {
        const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
        return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

const CANCELLABLE_STATUSES: BookingStatus[] = [
    BookingStatus.Pending,
    BookingStatus.PendingPayment,
    BookingStatus.PaymentSubmitted,
    BookingStatus.AwaitingAdminApproval,
];

function unpackResponse(res: any): { upcoming: any[]; past: any[]; cancelled: any[] } {
    const payload = res?.data != null ? res.data : res;
    const toArray = (v: unknown): any[] => (Array.isArray(v) ? v : []);

    if (payload && typeof payload === 'object' && !Array.isArray(payload) &&
        ('upcoming' in payload || 'past' in payload || 'cancelled' in payload)) {
        return {
            upcoming: toArray(payload.upcoming),
            past: toArray(payload.past),
            cancelled: toArray(payload.cancelled),
        };
    }

    if (Array.isArray(payload)) {
        return { upcoming: payload, past: [], cancelled: [] };
    }

    console.warn('[MyBookingsPage] Unexpected API response shape:', payload);
    return { upcoming: [], past: [], cancelled: [] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MyBookingsPage() {
    const navigate = useNavigate();
    const { lang } = useLanguage();
    const isAr = lang === 'ar';
    const d = (key: keyof typeof DICT) => DICT[key][lang];

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
                setPastCancelledBookings([...past, ...cancelled]);
            })
            .catch((err) => {
                console.error('[MyBookingsPage] Failed to load bookings:', err);
                setLoadError(d('loadError'));
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        loadBookings();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        sessionStorage.setItem('hagzaya_booking_flow_state', JSON.stringify(flowState));
        navigate('/booking/receipt');
    };

    const handleConfirmCancel = async () => {
        if (!cancelTarget) return;
        const targetId: number = cancelTarget.id ?? cancelTarget.bookingId;
        setCancelingId(targetId);
        setCancelError(null);

        try {
            await bookingApi.cancelBooking({
                bookingId: targetId,
                reason: cancelReason.trim() || (isAr ? 'ألغى اللاعب الحجز' : 'Player cancelled the booking'),
            });

            setUpcomingBookings((prev) => prev.filter((b) => (b.id ?? b.bookingId) !== targetId));
            setPastCancelledBookings((prev) => [
                { ...cancelTarget, status: BookingStatus.Cancelled },
                ...prev,
            ]);

            setCancelTarget(null);
            setCancelReason('');
        } catch (err) {
            console.error('[MyBookingsPage] Cancel failed:', err);
            setCancelError(d('cancelError'));
        } finally {
            setCancelingId(null);
        }
    };

    const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastCancelledBookings;

    return (
        <div className={`min-h-screen bg-[#f6f8f7] pb-16 ${isAr ? 'font-ar' : 'font-en'}`} dir={isAr ? 'rtl' : 'ltr'}>
            <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-black text-[#191c1c]">{d('pageTitle')}</h1>
                    <button
                        onClick={() => navigate('/fields')}
                        className="text-xs font-bold text-[#006b20] flex items-center gap-1 bg-[#006b20]/5 px-3 py-1.5 rounded-full hover:bg-[#006b20]/10 transition-colors"
                    >
                        <span>{d('newBooking')}</span>
                        <span className="material-symbols-outlined text-base">add_circle</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#e1e3e1]">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all ${
                            activeTab === 'upcoming'
                                ? 'border-[#006b20] text-[#006b20]'
                                : 'border-transparent text-[#3e4a3c]/60'
                        }`}
                    >
                        {d('tabUpcoming')} ({upcomingBookings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('past_cancelled')}
                        className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all ${
                            activeTab === 'past_cancelled'
                                ? 'border-[#006b20] text-[#006b20]'
                                : 'border-transparent text-[#3e4a3c]/60'
                        }`}
                    >
                        {d('tabHistory')} ({pastCancelledBookings.length})
                    </button>
                </div>

                {/* Body */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <span className="material-symbols-outlined animate-spin text-3xl text-[#006b20]">
                            progress_activity
                        </span>
                    </div>

                ) : loadError ? (
                    <div className="bg-white rounded-2xl border border-[#e1e3e1] p-8 text-center space-y-3">
                        <p className="text-xs font-bold text-[#c62828]">{loadError}</p>
                        <button onClick={loadBookings} className="text-xs font-bold text-[#006b20] underline">
                            {d('retry')}
                        </button>
                    </div>

                ) : currentBookings.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#e1e3e1] p-12 text-center space-y-4 shadow-sm">
                        <span className="material-symbols-outlined text-5xl text-[#3e4a3c]/20">event_busy</span>
                        <div className="space-y-1">
                            <h3 className="font-bold text-sm text-[#191c1c]">
                                {activeTab === 'upcoming' ? d('emptyUpcoming') : d('emptyHistory')}
                            </h3>
                            <p className="text-xs text-[#3e4a3c]/70">
                                {activeTab === 'upcoming' ? d('emptyUpcomingSub') : d('emptyHistorySub')}
                            </p>
                        </div>
                        {activeTab === 'upcoming' && (
                            <button
                                onClick={() => navigate('/fields')}
                                className="bg-[#006b20] hover:bg-[#005218] text-white py-2.5 px-6 rounded-xl text-xs font-bold transition-colors"
                            >
                                {d('browseFields')}
                            </button>
                        )}
                    </div>

                ) : (
                    <div className="space-y-4">
                        {currentBookings.map((booking) => {
                            const bookingId: number = booking.id ?? booking.bookingId;
                            const primarySlot = Array.isArray(booking.slots) ? booking.slots[0] : undefined;
                            const fieldName: string = primarySlot?.fieldName ?? booking.fieldName ?? d('defaultField');
                            const fieldCity: string = primarySlot?.fieldCity ?? booking.fieldCity ?? '';
                            const bookingDate: string = primarySlot?.date ?? booking.date ?? '';
                            const startTime: string = primarySlot?.startTime ?? booking.startTime ?? '';
                            const endTime: string = primarySlot?.endTime ?? booking.endTime ?? '';
                            const displayPrice: number | undefined = booking.finalPrice ?? booking.totalPrice ?? booking.totalAmount;
                            const paymentMethod = booking.paymentMethod;

                            const canCancel =
                                activeTab === 'upcoming' &&
                                CANCELLABLE_STATUSES.includes(booking.status);

                            return (
                                <div
                                    key={bookingId}
                                    className="bg-white rounded-2xl border border-[#e1e3e1] p-5 shadow-sm hover:shadow-md transition-shadow space-y-4"
                                >
                                    {/* Card header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1.5 min-w-0">
                                            <h3 className="font-extrabold text-sm text-[#191c1c] truncate">{fieldName}</h3>
                                            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-[#3e4a3c] font-semibold">
                                                {fieldCity && (
                                                    <div className="flex items-center gap-1 bg-[#f0f2f0] px-2 py-0.5 rounded text-[11px]">
                                                        <span className="material-symbols-outlined text-xs">location_on</span>
                                                        <span>{fieldCity}</span>
                                                    </div>
                                                )}
                                                {bookingDate && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm text-[#006b20]">calendar_month</span>
                                                        <span>{formatDisplayDate(bookingDate, lang)}</span>
                                                    </div>
                                                )}
                                                {(startTime || endTime) && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm text-[#006b20]">schedule</span>
                                                        <span>{formatTime(startTime, lang)} — {formatTime(endTime, lang)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <BookingStatusBadge status={booking.status} />
                                    </div>

                                    {/* Card footer */}
                                    <div className="flex items-center justify-between pt-3.5 border-t border-[#f0f2f0]">
                                        <div className="flex flex-col gap-0.5">
                                            {displayPrice != null && (
                                                <>
                                                    <span className="text-[10px] text-[#3e4a3c]/60 font-bold">{d('totalAmount')}</span>
                                                    <span className="text-sm font-black text-[#006b20]">EGP {displayPrice}</span>
                                                </>
                                            )}
                                            {paymentMethod && (
                                                <span className="text-[10px] text-[#3e4a3c]/50 font-semibold">
                                                    {PAYMENT_METHOD_LABELS[paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] ?? paymentMethod}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {booking.status === BookingStatus.PendingPayment && (
                                                <button
                                                    onClick={() => handlePayNow(booking)}
                                                    className="bg-[#006b20] hover:bg-[#005218] text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                                                >
                                                    <span className="material-symbols-outlined text-base">upload_file</span>
                                                    <span>{d('confirmPay')}</span>
                                                </button>
                                            )}
                                            {canCancel && (
                                                <button
                                                    onClick={() => setCancelTarget(booking)}
                                                    disabled={cancelingId === bookingId}
                                                    className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl flex items-center gap-1 disabled:opacity-50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-base">cancel</span>
                                                    <span>{d('cancelBooking')}</span>
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

            {/* Cancel confirmation modal */}
            {cancelTarget && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50"
                    onClick={() => !cancelingId && setCancelTarget(null)}
                >
                    <div
                        className="bg-white rounded-2xl border border-[#e1e3e1] shadow-2xl p-6 max-w-sm w-full space-y-5"
                        dir={isAr ? 'rtl' : 'ltr'}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-2">
                            <h3 className="font-extrabold text-base text-[#191c1c]">{d('cancelTitle')}</h3>
                            <p className="text-xs text-[#3e4a3c]/80 leading-relaxed">
                                {d('cancelDesc1')}{' '}
                                <span className="font-bold text-[#191c1c]">
                                    {(Array.isArray(cancelTarget.slots) && cancelTarget.slots[0]?.fieldName) ||
                                        cancelTarget.fieldName ||
                                        (isAr ? 'الملعب' : 'the field')}
                                </span>
                                {d('cancelDesc2')}
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#3e4a3c]">{d('cancelReason')}</label>
                            <input
                                type="text"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder={d('cancelPlaceholder')}
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
                                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                                ) : (
                                    <span>{d('confirmCancel')}</span>
                                )}
                            </button>
                            <button
                                onClick={() => { setCancelTarget(null); setCancelError(null); }}
                                disabled={cancelingId != null}
                                className="flex-1 bg-[#f0f2f0] hover:bg-[#e1e3e1] text-[#191c1c] py-2.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
                            >
                                {d('goBack')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}