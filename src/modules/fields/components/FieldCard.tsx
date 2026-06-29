// src/modules/fields/components/FieldCard.tsx
import { useNavigate } from 'react-router-dom';
import type { Field } from '../types/fields.types';

interface FieldCardProps {
    field: Field;
}

export function FieldCard({ field }: FieldCardProps) {
    const navigate = useNavigate();

    // 1. فك الـ photos بأمان كامل
    let displayImage = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=500';
    if (field && field.photos) {
        try {
            const parsedPhotos = typeof field.photos === 'string' ? JSON.parse(field.photos) : field.photos;
            if (Array.isArray(parsedPhotos) && parsedPhotos.length > 0) {
                displayImage = parsedPhotos[0];
            }
        } catch (e) {
            console.error("Error parsing photos", e);
        }
    }

    // 2. فك وتجهيز الـ Amenities القادمة من علاقات قاعدة البيانات المتشابكة
    let displayAmenities: string[] = ['واي فاي', 'كشافات', 'غرف تبديل'];
    if (field && field.amenities) {
        try {
            if (typeof field.amenities === 'string') {
                const parsed = JSON.parse(field.amenities);
                if (Array.isArray(parsed)) displayAmenities = parsed;
            } else if (Array.isArray(field.amenities)) {
                // إذا جاءت كمصفوفة كائنات من الـ EF Core Bridge Table
                displayAmenities = field.amenities.map((item: any) =>
                    typeof item === 'string' ? item : (item.features || item.name || '')
                ).filter(Boolean);
            }
        } catch (e) {
            console.error("Error parsing amenities", e);
        }
    }

    // 3. تأمين الـ Type Labels
    const getFieldTypeLabel = (typeStr: unknown) => {
        if (!typeStr || typeof typeStr !== 'string') return 'ملعب خماسي';
        if (typeStr.includes('5')) return 'ملعب خماسي';
        if (typeStr.includes('7')) return 'ملعب سباعي';
        if (typeStr.includes('11')) return 'ملعب قانوني';
        return typeStr;
    };

    if (!field) return null;

    return (
        <div className="bg-white rounded-2xl border border-[#e1e3e1] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group h-full text-right" dir="rtl">
            {/* Image Block */}
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                    src={displayImage}
                    alt={field.name || 'ملعب'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=500';
                    }}
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#006b20] text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                    EGP {field.pricePm || field.priceAm || 400} / ساعة
                </span>
            </div>

            {/* Content Details */}
            <div className="p-5 flex flex-col justify-between flex-grow space-y-4">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-base text-[#191c1c] truncate">{field.name || 'ملعب كرة قدم'}</h4>
                        <span className="bg-[#e8f5e9] text-[#006b20] text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            {getFieldTypeLabel(field.type)}
                        </span>
                    </div>

                    <div className="flex items-center text-xs text-[#3e4a3c]/70 space-x-1 space-x-reverse">
                        <span className="material-symbols-outlined text-sm text-[#006b20]">location_on</span>
                        <span className="truncate">{field.governorate || 'مصر'}، {field.city || ''} {field.village ? `، ${field.village}` : ''}</span>
                    </div>
                </div>

                {/* Features Row */}
                <div className="flex items-center gap-1.5 text-[#3e4a3c]/50 border-t border-[#f0f2f0] pt-3 flex-wrap">
                    {displayAmenities.slice(0, 3).map((amenity: string, idx: number) => (
                        <span key={idx} className="bg-[#f0f2f0] text-[#191c1c] text-[10px] px-2 py-0.5 rounded-md font-semibold">
                            {amenity}
                        </span>
                    ))}
                </div>

                <button
                    onClick={() => navigate(`/fields/${field.id}`)}
                    className="w-full bg-[#006b20] hover:bg-[#005318] text-white py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm"
                >
                    عرض الفترات المتاحة
                </button>
            </div>
        </div>
    );
}