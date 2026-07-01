import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFields } from '../hooks/useFields';
import { BookingWizardModal } from '../../booking/components/BookingWizardModal';

/**
 * Field Details Page — step 0 of the booking flow.
 *
 * This page no longer owns any booking state. Its only job is to show the
 * field and hand off to the sequential flow via "احجز الآن", which
 * navigates to /fields/:id/book/date. All wizard logic that used to live
 * here (slots, payment, upload) now lives in its own page under
 * features/booking/pages.
 */
export function FieldDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentField, isLoading, fetchFieldById } = useFields();
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchFieldById(Number(id));
        }
    }, [id, fetchFieldById]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7]">
                <span className="material-symbols-outlined animate-spin text-4xl text-[#006b20]">
                    progress_activity
                </span>
            </div>
        );
    }

    if (!currentField) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f8f7] space-y-4">
                <h3 className="font-bold text-lg text-[#191c1c]">الملعب غير موجود أو تم حذفه</h3>
                <button
                    onClick={() => navigate('/fields')}
                    className="w-full max-w-xs bg-[#006b20] text-white py-2 px-4 rounded-xl text-xs font-bold"
                >
                    العودة للملاعب
                </button>
            </div>
        );
    }

    let displayImage = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=1000';
    try {
        if (currentField.photos) {
            const parsed =
                typeof currentField.photos === 'string' ? JSON.parse(currentField.photos) : currentField.photos;
            if (Array.isArray(parsed) && parsed.length > 0) {
                displayImage = parsed[0];
            }
        }
    } catch {
        /* fallback to default image */
    }

    let cleanAmenities: string[] = [];
    try {
        if (currentField.amenities) {
            cleanAmenities =
                typeof currentField.amenities === 'string' ? JSON.parse(currentField.amenities) : currentField.amenities;
        }
    } catch {
        if (typeof currentField.amenities === 'string') {
            cleanAmenities = [currentField.amenities];
        }
    }

    const slotPrice = currentField.pricePm ?? currentField.priceAm ?? 150;

    return (
        <div className="min-h-screen bg-[#f6f8f7] pb-16 font-ar" dir="rtl">
            <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* ─── Left Content: Field Details ─── */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl border border-[#e1e3e1] overflow-hidden aspect-[16/9] relative shadow-sm">
                            <img
                                src={displayImage}
                                alt={currentField.name || 'ملعب'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=1000';
                                }}
                            />
                        </div>

                        <div className="bg-white rounded-2xl border border-[#e1e3e1] p-6 shadow-sm space-y-3">
                            <h1 className="text-2xl font-black text-[#191c1c]">{currentField.name}</h1>
                            <div className="flex items-center text-sm text-[#3e4a3c]/80 space-x-1 space-x-reverse">
                                <span className="material-symbols-outlined text-lg text-[#006b20]">location_on</span>
                                <span>
                                    {currentField.address && `${currentField.address}، `}
                                    {currentField.city}، {currentField.governorate}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 pt-2 border-t border-[#f0f2f0] flex-wrap">
                                <span className="text-xs bg-[#e8f5e9] text-[#006b20] px-2.5 py-1 rounded-full font-bold">
                                    {currentField.type}
                                </span>
                                <span className="text-xs bg-[#f0f2f0] text-[#3e4a3c] px-2.5 py-1 rounded-full font-bold">
                                    {currentField.surface}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-[#e1e3e1] p-6 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-base text-[#191c1c]">المميزات والمرافق</h3>
                            <div className="flex flex-wrap gap-2.5">
                                {Array.isArray(cleanAmenities) && cleanAmenities.length > 0 ? (
                                    cleanAmenities.map((amenity, idx) => (
                                        <span
                                            key={idx}
                                            className="flex items-center space-x-1.5 space-x-reverse bg-[#f0f2f0] text-[#191c1c] px-3 py-1.5 rounded-xl text-xs font-semibold"
                                        >
                                            <span className="material-symbols-outlined text-lg text-[#006b20]">
                                                check_circle
                                            </span>
                                            <span>{amenity}</span>
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-xs text-[#3e4a3c]/60">لا توجد مرافق مُدرجة لهذا الملعب.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── Right Content: Booking CTA Card ─── */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-[#e1e3e1] p-5 shadow-sm space-y-5 sticky top-24">
                            <div>
                                <h3 className="font-extrabold text-base text-[#191c1c]">احجز ملعبك الآن</h3>
                                <p className="text-xs text-[#3e4a3c] mt-0.5">
                                    اختر التاريخ والوقت المناسبين لك في خطوات بسيطة
                                </p>
                            </div>

                            <div className="flex items-center justify-between bg-[#f0f2f0] p-3 rounded-xl">
                                <span className="text-xs text-[#3e4a3c] font-semibold">سعر الساعة</span>
                                <span className="text-sm font-black text-[#006b20]">EGP {slotPrice}</span>
                            </div>

                            <button
                                onClick={() => setIsBookingModalOpen(true)}
                                className="w-full bg-[#006b20] hover:bg-[#005318] text-white py-3.5 rounded-xl font-black text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <span>احجز الآن</span>
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {currentField && (
                <BookingWizardModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    fieldId={currentField.id}
                    fieldPrice={slotPrice}
                />
            )}
        </div>
    );
}