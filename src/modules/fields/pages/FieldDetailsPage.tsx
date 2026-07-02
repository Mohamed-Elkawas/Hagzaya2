import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFields } from '../hooks/useFields';
import { BookingWizardModal } from '../../booking/components/BookingWizardModal';
import { useLanguage } from '../../../core/context/LanguageContext';

// ── Bilingual Dictionary ───────────────────────────────────────────────────────
const DICT = {
  notFound:      { ar: 'الملعب غير موجود أو تم حذفه',   en: 'Field not found or deleted' },
  backToFields:  { ar: 'العودة للملاعب',                en: 'Back to Fields' },
  fieldDetails:  { ar: 'تفاصيل الملعب',                en: 'Field Details' },
  bookFieldTitle:{ ar: 'حجز ملعب',                      en: 'Book Field' },
  bookFieldSub:  { ar: 'اختر التاريخ والوقت المناسبين لك في خطوات بسيطة', en: 'Select the suitable date and time in simple steps' },
  pricingTitle:  { ar: 'السعر والمواعيد',              en: 'Pricing & Schedules' },
  selectDate:    { ar: 'اختار التاريخ',                en: 'Select Date' },
  availableTimes:{ ar: 'المواعيد المتاحة',             en: 'Available Times' },
  surfaceType:   { ar: 'نوع الأرضية',                  en: 'Grass Type / Surface' },
  locationAddr:  { ar: 'العنوان والموقع',              en: 'Location & Address' },
  amenities:     { ar: 'الخدمات والمميزات',            en: 'Amenities & Features' },
  noAmenities:   { ar: 'لا توجد مرافق مُدرجة لهذا الملعب.', en: 'No amenities listed for this field.' },
  confirmBook:   { ar: 'تأكيد الحجز',                  en: 'Confirm Booking' },
  egpHour:       { ar: 'ج.م / ساعة',                   en: 'EGP / Hour' },
  bookNowBtn:    { ar: 'احجز الآن',                    en: 'Book Now' },
  pricePerHour:  { ar: 'سعر الساعة',                   en: 'Price per hour' },
} as const;

// Helper to translate field type
function translateFieldType(type: unknown, lang: 'ar' | 'en'): string {
    if (typeof type !== 'string') return '';
    if (type.includes('5') || type === 'خماسي') return lang === 'ar' ? 'خماسي' : '5-A-Side';
    if (type.includes('7') || type === 'سباعي') return lang === 'ar' ? 'سباعي' : '7-A-Side';
    if (type.includes('11') || type.includes('قانوني')) return lang === 'ar' ? 'قانوني (11)' : 'Legal Size (11-A-Side)';
    return type;
}

// Helper to translate surface
function translateSurface(surface: unknown, lang: 'ar' | 'en'): string {
    if (typeof surface !== 'string') return '';
    if (surface.includes('صناعي') || surface.toLowerCase().includes('artificial')) {
        return lang === 'ar' ? 'نجيل صناعي' : 'Artificial Grass';
    }
    if (surface.includes('طبيعي') || surface.toLowerCase().includes('natural')) {
        return lang === 'ar' ? 'نجيل طبيعي' : 'Natural Grass';
    }
    return surface;
}

// Helper to translate common amenities
function translateAmenity(amenity: string, lang: 'ar' | 'en'): string {
    const mapArToEn: Record<string, string> = {
        'غرف ملابس': 'Locker Rooms',
        'إضاءة ليلية': 'Night Lighting',
        'موقف سيارات': 'Parking',
        'واي فاي': 'Wi-Fi',
        'كافيتيريا': 'Cafeteria',
        'حمام': 'Restrooms',
        'كشافات': 'Floodlights',
        'غرف تبديل': 'Changing Rooms',
    };
    const mapEnToAr: Record<string, string> = Object.entries(mapArToEn).reduce(
        (acc, [ar, en]) => ({ ...acc, [en]: ar }),
        {}
    );

    if (lang === 'en') {
        return mapArToEn[amenity] || amenity;
    } else {
        return mapEnToAr[amenity] || amenity;
    }
}

export function FieldDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentField, isLoading, fetchFieldById } = useFields();
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    
    const { lang } = useLanguage();
    const isAr = lang === 'ar';
    const d = (key: keyof typeof DICT) => DICT[key][lang];

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
            <div className={`min-h-screen flex flex-col items-center justify-center bg-[#f6f8f7] space-y-4 ${isAr ? 'font-ar' : 'font-en'}`} dir={isAr ? 'rtl' : 'ltr'}>
                <h3 className="font-bold text-lg text-[#191c1c]">{d('notFound')}</h3>
                <button
                    onClick={() => navigate('/fields')}
                    className="w-full max-w-xs bg-[#006b20] text-white py-2 px-4 rounded-xl text-xs font-bold"
                >
                    {d('backToFields')}
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
        <div className={`min-h-screen bg-[#f6f8f7] pb-16 ${isAr ? 'font-ar' : 'font-en'}`} dir={isAr ? 'rtl' : 'ltr'}>
            <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* ─── Left Content: Field Details ─── */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl border border-[#e1e3e1] overflow-hidden aspect-[16/9] relative shadow-sm">
                            <img
                                src={displayImage}
                                alt={currentField.name || d('fieldDetails')}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=1000';
                                }}
                            />
                        </div>

                        <div className="bg-white rounded-2xl border border-[#e1e3e1] p-6 shadow-sm space-y-3">
                            <h1 className="text-2xl font-black text-[#191c1c]">{currentField.name}</h1>
                            <div className="flex items-center text-sm text-[#3e4a3c]/80 gap-1">
                                <span className="material-symbols-outlined text-lg text-[#006b20]">location_on</span>
                                <span>
                                    {currentField.address && `${currentField.address}، `}
                                    {currentField.city}، {currentField.governorate}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 pt-2 border-t border-[#f0f2f0] flex-wrap">
                                <span className="text-xs bg-[#e8f5e9] text-[#006b20] px-2.5 py-1 rounded-full font-bold">
                                    {translateFieldType(currentField.type, lang)}
                                </span>
                                <span className="text-xs bg-[#f0f2f0] text-[#3e4a3c] px-2.5 py-1 rounded-full font-bold">
                                    {translateSurface(currentField.surface, lang)}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-[#e1e3e1] p-6 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-base text-[#191c1c]">{d('amenities')}</h3>
                            <div className="flex flex-wrap gap-2.5">
                                {Array.isArray(cleanAmenities) && cleanAmenities.length > 0 ? (
                                    cleanAmenities.map((amenity, idx) => (
                                        <span
                                            key={idx}
                                            className="flex items-center gap-1.5 bg-[#f0f2f0] text-[#191c1c] px-3 py-1.5 rounded-xl text-xs font-semibold"
                                        >
                                            <span className="material-symbols-outlined text-lg text-[#006b20]">
                                                check_circle
                                            </span>
                                            <span>{translateAmenity(amenity, lang)}</span>
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-xs text-[#3e4a3c]/60">{d('noAmenities')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── Right Content: Booking CTA Card ─── */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-[#e1e3e1] p-5 shadow-sm space-y-5 sticky top-24">
                            <div>
                                <h3 className="font-extrabold text-base text-[#191c1c]">{d('bookFieldTitle')}</h3>
                                <p className="text-xs text-[#3e4a3c] mt-0.5">
                                    {d('bookFieldSub')}
                                </p>
                            </div>

                            <div className="flex items-center justify-between bg-[#f0f2f0] p-3 rounded-xl">
                                <span className="text-xs text-[#3e4a3c] font-semibold">{d('pricePerHour')}</span>
                                <span className="text-sm font-black text-[#006b20]">
                                    {slotPrice} {d('egpHour')}
                                </span>
                            </div>

                            <button
                                onClick={() => setIsBookingModalOpen(true)}
                                className="w-full bg-[#006b20] hover:bg-[#005318] text-white py-3.5 rounded-xl font-black text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <span>{d('bookNowBtn')}</span>
                                <span className="material-symbols-outlined text-lg">
                                    {isAr ? 'arrow_back' : 'arrow_forward'}
                                </span>
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