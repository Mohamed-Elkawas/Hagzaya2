import { useEffect, useRef, useState } from 'react';
import { bookingApi } from '../api/booking.api';
import { BookingStepper } from '../components/BookingStepper';
import type { Slot } from '../types/booking.types';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { PaymentMethod } from '../types/Booking.enums';
import { useLanguage } from '../../../core/context/LanguageContext';

interface TimeSlotsPageProps {
    onNext: () => void;
    onBack: () => void;
    fieldId: number;
}

function formatTime(timeStr: string, lang: 'ar' | 'en') {
    try {
        if (!timeStr) return '--:--';
        if (timeStr.includes('T')) {
            return new Date(timeStr).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
        }
        // HH:MM:SS → HH:MM
        return timeStr.slice(0, 5);
    } catch {
        return timeStr || '--:--';
    }
}

function formatDisplayDate(dateStr: string, lang: 'ar' | 'en') {
    if (!dateStr) return '--';
    try {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

const DICT = {
    title: { ar: 'اختر الفترة', en: 'Select Slot' },
    loadError: { ar: 'تعذر تحميل الفترات المتاحة.', en: 'Failed to load available slots.' },
    noSlots: { ar: 'لا توجد فترات متاحة لهذا اليوم', en: 'No available slots for this day.' },
    booked: { ar: 'محجوز', en: 'Booked' },
    confirming: { ar: 'جاري تأكيد الحجز…', en: 'Confirming booking…' },
    confirmBtn: { ar: 'تأكيد الفترة والانتقال للدفع', en: 'Confirm slot & go to payment' },
    currency: { ar: 'ج.م', en: 'EGP' },
    genericError: {
        ar: 'تعذر تأكيد الفترة، قد تكون محجوزة بالفعل أو انتهت جلسة الدخول. يرجى إعادة المحاولة.',
        en: 'Could not confirm slot. It might be already booked or session expired. Please try again.'
    }
} as const;

export function TimeSlotsPage({ onNext, onBack, fieldId }: TimeSlotsPageProps) {
    const { state, updateState } = useBookingFlow();
    const { lang, dir } = useLanguage();
    const isAr = lang === 'ar';
    const d = (key: keyof typeof DICT) => DICT[key][lang];

    const date = state.date ?? '';

    const [slots, setSlots] = useState<Slot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [confirmError, setConfirmError] = useState<string | null>(null);

    const [advanceVersion, setAdvanceVersion] = useState(0);
    const shouldAdvanceRef = useRef(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (shouldAdvanceRef.current) {
            shouldAdvanceRef.current = false;
            onNext();
        }
    }, [advanceVersion]);

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
                setSlotsError(d('loadError'));
            })
            .finally(() => setSlotsLoading(false));
    }, [fieldId, date, onBack, lang]);

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

            const bookingId = result.id;
            const totalAmount = result.finalPrice ?? result.totalPrice ?? selectedSlot.price;

            updateState({
                slot: selectedSlot,
                bookingId,
                totalAmount,
                fieldId: Number(fieldId),
            });
            shouldAdvanceRef.current = true;
            setAdvanceVersion((v) => v + 1);
        } catch (err: any) {
            console.error('Booking creation failed:', err);
            setConfirmError(err.message || d('genericError'));
            shouldAdvanceRef.current = false;
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
        <div className={`bg-[#f6f8f7] pb-6 ${isAr ? 'font-ar' : 'font-en'}`} dir={dir}>
            <div className="max-w-2xl mx-auto px-2 pt-4 space-y-6">
                <BookingStepper current={2} />

                <div className="bg-white rounded-2xl border border-[#e1e3e1] p-6 shadow-sm space-y-6">
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
                            <p className="text-xs text-[#3e4a3c]">{formatDisplayDate(date, lang)}</p>
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
                            <p className="text-xs font-bold text-[#3e4a3c]/50">{d('noSlots')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {slots.map((slot) => {
                                const isSlotAvailable =
                                    slot.status === 'Available' ||
                                    String(slot.status).toLowerCase() === 'available';
                                
                                const formattedPrice = new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-US', {
                                    minimumFractionDigits: 0
                                }).format(slot.price);

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
                                            <span dir="ltr">{formatTime(slot.startTime, lang)}</span>
                                        </div>
                                        <div className="text-[10px] font-semibold opacity-60" dir="ltr">
                                            {formatTime(slot.endTime, lang)}
                                        </div>
                                        {isSlotAvailable ? (
                                            <div className="text-[#006b20] mt-1" dir="ltr">
                                                {formattedPrice} {d('currency')}
                                            </div>
                                        ) : (
                                            <span className="inline-block mt-1 bg-[#3e4a3c]/10 text-[#3e4a3c]/50 text-[10px] px-2 py-0.5 rounded-full">
                                                {d('booked')}
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

                    {selectedSlot && !confirming && (
                        <div className="bg-[#e8f5e9]/50 border border-[#006b20]/20 rounded-xl p-3 flex items-center justify-between text-xs font-bold text-[#3e4a3c]">
                            <span dir="ltr">
                                {formatTime(selectedSlot.startTime, lang)} — {formatTime(selectedSlot.endTime, lang)}
                            </span>
                            <span className="text-[#006b20] font-black" dir="ltr">
                                {new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-US', { minimumFractionDigits: 0 }).format(selectedSlot.price)} {d('currency')}
                            </span>
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
                                <span>{d('confirming')}</span>
                            </>
                        ) : (
                            <>
                                <span>{d('confirmBtn')}</span>
                                <span className="material-symbols-outlined text-lg">
                                    {isAr ? 'arrow_back' : 'arrow_forward'}
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}