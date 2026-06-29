'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFields } from '../hooks/useFields';
import { FieldCard } from '../components/FieldCard';
import type { FieldFilterParams } from '../types/fields.types';

export function FieldsPage() {
    const [searchParams] = useSearchParams();
    const { fields, isLoading, fetchFilteredFields, fetchApprovedFields } = useFields();

    const [governorate, setGovernorate] = useState(searchParams.get('governorate') || '');
    const [city, setCity] = useState(searchParams.get('city') || '');
    const [fieldType, setFieldType] = useState(searchParams.get('type') || '');
    const [date, setDate] = useState(searchParams.get('date') || '');

    useEffect(() => {
        if (governorate.trim() === '' && city.trim() === '' && fieldType.trim() === '' && date.trim() === '') {
            fetchApprovedFields();
        } else {
            const filters: FieldFilterParams = {
                Page: 1,
                PageSize: 20
            };

            if (governorate.trim() !== '') filters.Governorate = governorate;
            if (city.trim() !== '') filters.City = city;
            if (fieldType.trim() !== '') filters.Type = fieldType;
            if (date.trim() !== '') filters.Date = date;

            fetchFilteredFields(filters);
        }
    }, [governorate, city, fieldType, date, fetchFilteredFields, fetchApprovedFields]);

    const cleanFieldsList = Array.isArray(fields) ? fields : (fields as any)?.data || [];

    return (
        <div className="min-h-screen bg-[#f6f8f7] pb-16" dir="rtl">
            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 space-y-8">

                <div>
                    <h1 className="text-2xl font-black text-[#191c1c]">استكشف الملاعب المتاحة</h1>
                    <p className="text-xs text-[#3e4a3c] mt-1">تصفح الملاعب المتاحة أو استخدم الفلاتر لتضييق نطاق البحث.</p>
                </div>

                {/* قسم الفلاتر */}
                <div className="bg-white rounded-2xl border border-[#e1e3e1] p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-bold text-[#3e4a3c]">المحافظة</label>
                        <select
                            value={governorate}
                            onChange={(e) => setGovernorate(e.target.value)}
                            className="bg-transparent text-xs font-semibold px-3 h-10 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                        >
                            <option value="">كل المحافظات</option>
                            <option value="Cairo">القاهرة</option>
                            <option value="Giza">الجيزة</option>
                            <option value="Monufia">المنوفية</option>
                            <option value="Faiyum">الفيوم</option>
                            <option value="Beni Suef">بني سويف</option>
                        </select>
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-bold text-[#3e4a3c]">المدينة / المنطقة</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="مثال: Menouf"
                            className="text-xs font-semibold px-3 h-10 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                        />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-bold text-[#3e4a3c]">حجم الملعب</label>
                        <select
                            value={fieldType}
                            onChange={(e) => setFieldType(e.target.value)}
                            className="bg-transparent text-xs font-semibold px-3 h-10 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                        >
                            <option value="">كل الأحجام</option>
                            <option value="5-a-side">خماسي</option>
                            <option value="7-a-side">سباعي</option>
                            <option value="11-a-side">قانوني (11 ضد 11)</option>
                        </select>
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-bold text-[#3e4a3c]">التاريخ</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="text-xs font-semibold px-3 h-10 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20] text-right"
                        />
                    </div>
                </div>

                {/* شبكة النتائج */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <span className="material-symbols-outlined animate-spin text-4xl text-[#006b20]">progress_activity</span>
                        <p className="text-sm font-semibold text-[#3e4a3c]">جاري تحميل الملاعب...</p>
                    </div>
                ) : cleanFieldsList.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#e1e3e1] p-16 flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
                        <div className="w-14 h-14 bg-[#f0f2f0] rounded-full flex items-center justify-center text-[#3e4a3c]/60">
                            <span className="material-symbols-outlined text-3xl">sports_soccer</span>
                        </div>
                        <h4 className="font-extrabold text-base text-[#191c1c]">لا توجد ملاعب متاحة حالياً</h4>
                        <p className="text-xs text-[#3e4a3c]/70 max-w-sm">تأكد من إعدادات قاعدة البيانات أو جرب تغيير الفلاتر.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {cleanFieldsList.map((field: any) => (
                            <FieldCard key={field.id} field={field} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}

export default FieldsPage;