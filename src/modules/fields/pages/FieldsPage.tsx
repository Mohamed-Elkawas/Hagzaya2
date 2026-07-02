'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFields } from '../hooks/useFields';
import { FieldCard } from '../components/FieldCard';
import type { FieldFilterParams } from '../types/fields.types';
import { useLanguage } from '../../../core/context/LanguageContext';

// ── Bilingual Dictionary ───────────────────────────────────────────────────────
const DICT = {
  pageTitle:    { ar: 'استكشف الملاعب المتاحة',          en: 'Explore Available Fields' },
  pageSubtitle: { ar: 'تصفح الملاعب المتاحة أو استخدم الفلاتر لتضييق نطاق البحث.', en: 'Browse available fields or use filters to narrow your search.' },
  governorate:  { ar: 'المحافظة',                         en: 'Governorate' },
  allGov:       { ar: 'كل المحافظات',                    en: 'All Governorates' },
  city:         { ar: 'المدينة / المنطقة',               en: 'City / District' },
  cityPlaceholder:{ ar: 'مثال: Menouf',                  en: 'e.g. Maadi' },
  fieldSize:    { ar: 'حجم الملعب',                      en: 'Field Size' },
  allSizes:     { ar: 'كل الأحجام',                      en: 'All Sizes' },
  five:         { ar: 'خماسي',                           en: '5-a-Side' },
  seven:        { ar: 'سباعي',                            en: '7-a-Side' },
  eleven:       { ar: 'قانوني (11 ضد 11)',               en: 'Full (11-a-Side)' },
  date:         { ar: 'التاريخ',                          en: 'Date' },
  loading:      { ar: 'جاري تحميل الملاعب...',           en: 'Loading fields...' },
  noFields:     { ar: 'لا توجد ملاعب متاحة حالياً',     en: 'No Fields Available' },
  noFieldsSub:  { ar: 'تأكد من إعدادات قاعدة البيانات أو جرب تغيير الفلاتر.', en: 'Check your database settings or try changing the filters.' },
  cairo:        { ar: 'القاهرة',     en: 'Cairo' },
  giza:         { ar: 'الجيزة',      en: 'Giza' },
  monufia:      { ar: 'المنوفية',    en: 'Monufia' },
  faiyum:       { ar: 'الفيوم',      en: 'Faiyum' },
  beniSuef:     { ar: 'بني سويف',   en: 'Beni Suef' },
} as const;

export function FieldsPage() {
    const [searchParams] = useSearchParams();
    const { fields, isLoading, fetchFilteredFields, fetchApprovedFields } = useFields();
    const { lang } = useLanguage();
    const isAr = lang === 'ar';
    const d = (key: keyof typeof DICT) => DICT[key][lang];

    const [governorate, setGovernorate] = useState(searchParams.get('governorate') || '');
    const [city, setCity] = useState(searchParams.get('city') || '');
    const [fieldType, setFieldType] = useState(searchParams.get('type') || '');
    const [date, setDate] = useState(searchParams.get('date') || '');

    useEffect(() => {
        if (governorate.trim() === '' && city.trim() === '' && fieldType.trim() === '' && date.trim() === '') {
            fetchApprovedFields();
        } else {
            const filters: FieldFilterParams = { Page: 1, PageSize: 20 };
            if (governorate.trim() !== '') filters.Governorate = governorate;
            if (city.trim() !== '') filters.City = city;
            if (fieldType.trim() !== '') filters.Type = fieldType;
            if (date.trim() !== '') filters.Date = date;
            fetchFilteredFields(filters);
        }
    }, [governorate, city, fieldType, date, fetchFilteredFields, fetchApprovedFields]);

    const cleanFieldsList = Array.isArray(fields) ? fields : (fields as any)?.data || [];

    return (
        <div className={`min-h-screen bg-[#f6f8f7] pb-16 ${isAr ? 'font-ar' : 'font-en'}`} dir={isAr ? 'rtl' : 'ltr'}>
            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 space-y-8">

                <div>
                    <h1 className="text-2xl font-black text-[#191c1c]">{d('pageTitle')}</h1>
                    <p className="text-xs text-[#3e4a3c] mt-1">{d('pageSubtitle')}</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-[#e1e3e1] p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Governorate */}
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-bold text-[#3e4a3c]">{d('governorate')}</label>
                        <select
                            value={governorate}
                            onChange={(e) => setGovernorate(e.target.value)}
                            className="bg-transparent text-xs font-semibold px-3 h-10 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                        >
                            <option value="">{d('allGov')}</option>
                            <option value="Cairo">{d('cairo')}</option>
                            <option value="Giza">{d('giza')}</option>
                            <option value="Monufia">{d('monufia')}</option>
                            <option value="Faiyum">{d('faiyum')}</option>
                            <option value="Beni Suef">{d('beniSuef')}</option>
                        </select>
                    </div>

                    {/* City */}
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-bold text-[#3e4a3c]">{d('city')}</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder={d('cityPlaceholder')}
                            className="text-xs font-semibold px-3 h-10 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                        />
                    </div>

                    {/* Field Size */}
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-bold text-[#3e4a3c]">{d('fieldSize')}</label>
                        <select
                            value={fieldType}
                            onChange={(e) => setFieldType(e.target.value)}
                            className="bg-transparent text-xs font-semibold px-3 h-10 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                        >
                            <option value="">{d('allSizes')}</option>
                            <option value="5-a-side">{d('five')}</option>
                            <option value="7-a-side">{d('seven')}</option>
                            <option value="11-a-side">{d('eleven')}</option>
                        </select>
                    </div>

                    {/* Date */}
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-bold text-[#3e4a3c]">{d('date')}</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="text-xs font-semibold px-3 h-10 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                            dir="ltr"
                        />
                    </div>
                </div>

                {/* Results Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <span className="material-symbols-outlined animate-spin text-4xl text-[#006b20]">progress_activity</span>
                        <p className="text-sm font-semibold text-[#3e4a3c]">{d('loading')}</p>
                    </div>
                ) : cleanFieldsList.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#e1e3e1] p-16 flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
                        <div className="w-14 h-14 bg-[#f0f2f0] rounded-full flex items-center justify-center text-[#3e4a3c]/60">
                            <span className="material-symbols-outlined text-3xl">sports_soccer</span>
                        </div>
                        <h4 className="font-extrabold text-base text-[#191c1c]">{d('noFields')}</h4>
                        <p className="text-xs text-[#3e4a3c]/70 max-w-sm">{d('noFieldsSub')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {cleanFieldsList.map((field: any) => (
                            <FieldCard key={field.id} field={field} lang={lang} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}

export default FieldsPage;