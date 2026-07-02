import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fieldsApi } from '../../fields/api/fields.api';
import type { Field } from '../../fields/types/fields.types';
import { BookingStepper } from '../components/BookingStepper';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { useLanguage } from '../../../core/context/LanguageContext';

interface DateOption {
    label: string;
    value: string;
    dayName: string;
}

const DICT = {
    notFound: { ar: 'الملعب غير موجود', en: 'Field not found' },
    backToFields: { ar: 'العودة للملاعب', en: 'Back to Fields' },
    title: { ar: 'اختر التاريخ', en: 'Select Date' },
    noDates: { ar: 'لا توجد أيام متاحة للحجز حالياً لهذا الملعب', en: 'No available days for booking at this field right now.' },
    next: { ar: 'التالي', en: 'Next' },
    days: {
        ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
        en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    today: { ar: 'اليوم', en: 'Today' },
    tomorrow: { ar: 'غداً', en: 'Tomorrow' },
} as const;

function getUpcomingDates(availableDatesFromApi: string[] | undefined, lang: 'ar' | 'en'): DateOption[] {
    const dates: DateOption[] = [];
    const dayNames = DICT.days[lang];

    for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const value = d.toISOString().split('T')[0];
        const label = d.getDate().toString();
        const dayName = i === 0 ? DICT.today[lang] : i === 1 ? DICT.tomorrow[lang] : dayNames[d.getDay()];

        if (availableDatesFromApi && availableDatesFromApi.length > 0) {
            if (availableDatesFromApi.includes(value)) {
                dates.push({ label, value, dayName });
            }
        } else {
            dates.push({ label, value, dayName });
        }
    }
    return dates;
}

interface DateSelectionPageProps {
    onNext?: () => void;
    fieldId?: number;
}

export function DateSelectionPage({ onNext, fieldId: fieldIdProp }: DateSelectionPageProps) {
    const { id: idParam } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const id = fieldIdProp !== undefined ? String(fieldIdProp) : idParam;
    const { state, updateState } = useBookingFlow();
    const { lang, dir } = useLanguage();
    const isAr = lang === 'ar';
    const d = (key: keyof typeof DICT) => DICT[key][lang];

    const [field, setField] = useState<Field | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(state.date || '');
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (!id || fetchedRef.current) return;
        fetchedRef.current = true;

        setIsLoading(true);
        fieldsApi
            .getFieldById(Number(id))
            .then(setField)
            .catch(() => setField(null))
            .finally(() => setIsLoading(false));
    }, [id]);

    const upcomingDates = getUpcomingDates(field?.availableDates, lang);

    const handleNext = () => {
        if (!selectedDate || !id || !field) return;
        updateState({
            fieldId: Number(id),
            fieldName: field.name,
            date: selectedDate,
        });
        if (onNext) {
            onNext();
        } else {
            navigate(`/booking/slots/${id}`);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7]">
                <span className="material-symbols-outlined animate-spin text-4xl text-[#006b20]">
                    progress_activity
                </span>
            </div>
        );
    }

    if (!field) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center bg-[#f6f8f7] gap-4 px-4 text-center ${isAr ? 'font-ar' : 'font-en'}`} dir={dir}>
                <span className="material-symbols-outlined text-4xl text-[#3e4a3c]/40">error_outline</span>
                <h3 className="font-bold text-base text-[#191c1c]">{d('notFound')}</h3>
                <button
                    onClick={() => navigate('/fields')}
                    className="bg-[#006b20] text-white py-2.5 px-6 rounded-xl text-xs font-bold"
                >
                    {d('backToFields')}
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-[#f6f8f7] pb-16 ${isAr ? 'font-ar' : 'font-en'}`} dir={dir}>
            <div className="max-w-2xl mx-auto px-4 md:px-8 pt-8 space-y-6">
                <BookingStepper current={1} />

                <div className="bg-white rounded-2xl border border-[#e1e3e1] p-6 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/fields/${id}`)}
                            className="w-9 h-9 rounded-lg bg-white border border-[#e1e3e1] flex items-center justify-center hover:bg-[#f0f2f0] transition-colors shrink-0"
                            aria-label="رجوع"
                        >
                            <span className="material-symbols-outlined text-[#3e4a3c] text-base">
                                {isAr ? 'arrow_forward' : 'arrow_back'}
                            </span>
                        </button>
                        <div>
                            <h1 className="font-extrabold text-lg text-[#191c1c]">{d('title')}</h1>
                            <p className="text-xs text-[#3e4a3c]">{field.name}</p>
                        </div>
                    </div>

                    {upcomingDates.length === 0 ? (
                        <div className="py-12 text-center bg-[#f0f2f0]/50 rounded-xl border border-dashed border-[#e1e3e1]">
                            <span className="material-symbols-outlined text-3xl text-[#3e4a3c]/30 mb-2">
                                event_busy
                            </span>
                            <p className="text-xs font-bold text-[#3e4a3c]/50">{d('noDates')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                            {upcomingDates.map((dItem) => (
                                <button
                                    key={dItem.value}
                                    type="button"
                                    onClick={() => setSelectedDate(dItem.value)}
                                    className={`flex flex-col items-center justify-center gap-0.5 py-3.5 rounded-xl border text-xs font-bold transition-all ${selectedDate === dItem.value
                                            ? 'bg-[#006b20] text-white border-[#006b20]'
                                            : 'bg-white text-[#3e4a3c] border-[#e1e3e1] hover:border-[#006b20]'
                                        }`}
                                >
                                    <span className="text-[10px] font-semibold opacity-80">{dItem.dayName}</span>
                                    <span className="text-lg font-black">{dItem.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleNext}
                        disabled={!selectedDate}
                        className="w-full bg-[#006b20] hover:bg-[#005318] disabled:bg-[#3e4a3c]/30 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-black text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <span>{d('next')}</span>
                        <span className="material-symbols-outlined text-lg">
                            {isAr ? 'arrow_back' : 'arrow_forward'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}