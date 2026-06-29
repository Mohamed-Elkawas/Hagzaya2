import { useEffect, useRef, useState } from 'react';
import { bookingApi } from '../api/booking.api';
import { BookingStepper } from '../components/BookingStepper';
import type { Slot } from '../types/booking.types';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { PaymentMethod } from '../types/Booking.enums';

interface TimeSlotsPageProps {
    onNext: () => void;
    onBack: () => void;
    fieldId: number;
}

function formatTime(timeStr: string) {
    try {
        if (!timeStr) return '--:--';
        if (timeStr.includes('T')) {
            return new Date(timeStr).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        }
        // HH:MM:SS → HH:MM
        return timeStr.slice(0, 5);
    } catch {
        return timeStr || '--:--';
    }
}

function formatDisplayDate(dateStr: string) {
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

export function TimeSlotsPage({ onNext, onBack, fieldId }: TimeSlotsPageProps) {
    const { state, updateState } = useBookingFlow();
    const date = state.date ?? '';

    const [slots, setSlots] = useState<Slot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [confirmError, setConfirmError] = useState<string | null>(null);

    // ── Safety net: advance the wizard AFTER context confirms the write ───────
    // Using a version counter guarantees the useEffect always fires even if
    // the bookingId didn't change (e.g. same slot rebooked after cancellation).
    const [advanceVersion, setAdvanceVersion] = useState(0);
    const shouldAdvanceRef = useRef(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (shouldAdvanceRef.current) {
            shouldAdvanceRef.current = false;
            onNext();
        }
    }, [advanceVersion]); // onNext intentionally omitted — stable callback from parent

    const lastFetchedKey = useRef<string>('');

    useEffect(() => {
        if (!fieldId || !date) {
            if (fieldId) onBack();
            return;
        }

        const currentKey = `${fieldId}-${date}`;
        if (lastFetchedKey.current === currentKey) return;
        lastFetchedKey.current = currentKey;

        setSlotsLoading(true);
        setSlotsError(null);
        bookingApi
            .getAvailableSlots(Number(fieldId), date)
            .then(setSlots)
            .catch((err) => {
                console.error(err);
                setSlotsError('تعذر تحميل الفترات المتاحة.');
            })
            .finally(() => setSlotsLoading(false));
    }, [fieldId, date, onBack]);

    const handleConfirmSlot = async () => {
        if (!selectedSlot || !fieldId) return;
        setConfirming(true);
        setConfirmError(null);

        try {
            const result = await bookingApi.createBooking({
                slotIds: [selectedSlot.id],
                paymentMethod: PaymentMethod.VodafoneCash,
                usePoints: false,
            });

            // ✅ PRIMARY FIX: API returns "id" and "finalPrice", NOT "bookingId"/"totalAmount"
            const bookingId = result.id;
            const totalAmount = result.finalPrice ?? result.totalPrice ?? selectedSlot.price;

            // Write to context first, then signal the advance via version bump.
            // React 18 batches both setState calls together, so PaymentMethodsPage
            // will receive the populated context on its very first render.
            updateState({
                slot: selectedSlot,
                bookingId,
                totalAmount,
                fieldId: Number(fieldId),
            });
            shouldAdvanceRef.current = true;
            setAdvanceVersion((v) => v + 1); // triggers the useEffect safety net above
        } catch (err: any) {
            console.error('Booking creation failed:', err);
            setConfirmError(
                err.message ||
                'تعذر تأكيد الفترة، قد تكون محجوزة بالفعل أو انتهت جلسة الدخول. يرجى إعادة المحاولة.'
            );
            shouldAdvanceRef.current = false;
            // Refresh slots so the user sees updated availability
            lastFetchedKey.current = '';
            bookingApi
                .getAvailableSlots(Number(fieldId), date)
                .then(setSlots)
                .catch(() => {});
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div className="bg-[#f6f8f7] pb-6 font-ar" dir="rtl">
            <div className="max-w-2xl mx-auto px-2 pt-4 space-y-6">
                <BookingStepper current={2} />

                <div className="bg-white rounded-2xl border border-[#e1e3e1] p-6 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="w-9 h-9 rounded-lg bg-white border border-[#e1e3e1] flex items-center justify-center hover:bg-[#f0f2f0] transition-colors shrink-0"
                            aria-label="رجوع"
                        >
                            <span className="material-symbols-outlined text-[#3e4a3c] text-base">arrow_forward</span>
                        </button>
                        <div>
                            <h1 className="font-extrabold text-lg text-[#191c1c]">اختر الفترة</h1>
                            <p className="text-xs text-[#3e4a3c]">{formatDisplayDate(date)}</p>
                        </div>
                    </div>

                    {slotsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <span className="material-symbols-outlined animate-spin text-3xl text-[#006b20]">
                                progress_activity
                            </span>
                        </div>
                    ) : slotsError ? (
                        <div className="py-8 text-center bg-[#fdecea] rounded-xl">
                            <p className="text-xs font-bold text-[#c62828]">{slotsError}</p>
                        </div>
                    ) : slots.length === 0 ? (
                        <div className="py-12 text-center bg-[#f0f2f0]/50 rounded-xl border border-dashed border-[#e1e3e1]">
                            <span className="material-symbols-outlined text-3xl text-[#3e4a3c]/30 mb-2">
                                event_busy
                            </span>
                            <p className="text-xs font-bold text-[#3e4a3c]/50">لا توجد فترات متاحة لهذا اليوم</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {slots.map((slot) => {
                                const isSlotAvailable =
                                    slot.status === 'Available' ||
                                    String(slot.status).toLowerCase() === 'available';
                                return (
                                    <button
                                        key={slot.id}
                                        disabled={!isSlotAvailable}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`relative p-3 rounded-xl border-2 text-center text-xs font-bold transition-all ${
                                            !isSlotAvailable
                                                ? 'border-transparent bg-[#f0f2f0] text-[#3e4a3c]/40 cursor-not-allowed'
                                                : selectedSlot?.id === slot.id
                                                ? 'border-[#006b20] bg-[#e8f5e9]/40 text-[#191c1c]'
                                                : 'border-[#e1e3e1] hover:border-[#006b20] text-[#191c1c] bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            <span>{formatTime(slot.startTime)}</span>
                                        </div>
                                        <div className="text-[10px] font-semibold opacity-60">
                                            {formatTime(slot.endTime)}
                                        </div>
                                        {isSlotAvailable ? (
                                            <div className="text-[#006b20] mt-1">EGP {slot.price}</div>
                                        ) : (
                                            <span className="inline-block mt-1 bg-[#3e4a3c]/10 text-[#3e4a3c]/50 text-[10px] px-2 py-0.5 rounded-full">
                                                محجوز
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {confirmError && (
                        <div className="bg-[#fdecea] rounded-xl p-3 text-xs font-bold text-[#c62828] whitespace-pre-line">
                            {confirmError}
                        </div>
                    )}

                    {/* Selected slot summary */}
                    {selectedSlot && !confirming && (
                        <div className="bg-[#e8f5e9]/50 border border-[#006b20]/20 rounded-xl p-3 flex items-center justify-between text-xs font-bold text-[#3e4a3c]">
                            <span>
                                {formatTime(selectedSlot.startTime)} — {formatTime(selectedSlot.endTime)}
                            </span>
                            <span className="text-[#006b20] font-black">EGP {selectedSlot.price}</span>
                        </div>
                    )}

                    <button
                        onClick={handleConfirmSlot}
                        disabled={!selectedSlot || confirming}
                        className="w-full bg-[#006b20] hover:bg-[#005318] disabled:bg-[#3e4a3c]/30 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-black text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        {confirming ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-lg">
                                    progress_activity
                                </span>
                                <span>جاري تأكيد الحجز…</span>
                            </>
                        ) : (
                            <>
                                <span>تأكيد الفترة والانتقال للدفع</span>
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}