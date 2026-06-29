'use client'

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fieldsApi } from '../api/fields.api';
import { FieldType, FieldSurface } from '../types/fields.types';
import { toast } from 'sonner';

export function CreateFieldPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        city: '',
        governorate: '',
        pricePerHour: 150,
        type: FieldType.FiveASide,
        surface: FieldSurface.ArtificialTurf,
        hasLight: true,
        hasChangingRooms: false,
        hasShowers: false,
        hasParking: false,
        hasCafeteria: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await fieldsApi.createField(formData);
            toast.success('تم إنشاء الملعب بنجاح، بانتظار موافقة الإدارة المعلقة للـ Admin.');
            navigate('/owner/fields');
        } catch (err: any) {
            toast.error(err.message || 'فشلت عملية إضافة الملعب');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f8f7] font-ar py-12" dir="rtl">
            <div className="max-w-2xl mx-auto px-4">
                <div className="responsive-card p-8 md:p-10 space-y-6">
                    <div>
                        <h1 className="text-2xl font-black text-[#191c1c]">إضافة ملعب جديد</h1>
                        <p className="text-xs text-[#3e4a3c] mt-1">أدخل مواصفات ملعبك بدقة لجذب اللاعبين وعمل الحجوزات.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* الاسم */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#3e4a3c]">اسم الملعب</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="مثال: ملعب سانتياغو الخماسي"
                                className="form-input text-xs font-semibold px-3 h-10 border-[#e1e3e1] rounded-xl focus:border-[#006b20]"
                            />
                        </div>

                        {/* تفاصيل الموقع جغرافياً بالتطابق مع SQL Server */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#3e4a3c]">المحافظة</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.governorate}
                                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                                    placeholder="المنوفية"
                                    className="form-input text-xs font-semibold px-3 h-10 border-[#e1e3e1] rounded-xl focus:border-[#006b20]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#3e4a3c]">المدينة</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="مدينة السادات"
                                    className="form-input text-xs font-semibold px-3 h-10 border-[#e1e3e1] rounded-xl focus:border-[#006b20]"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#3e4a3c]">العنوان بالتفصيل</label>
                            <input
                                type="text"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="شارع الجامعة، بجوار المنطقة الرابعة"
                                className="form-input text-xs font-semibold px-3 h-10 border-[#e1e3e1] rounded-xl focus:border-[#006b20]"
                            />
                        </div>

                        {/* الحجم والسعر والنوع */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#3e4a3c]">السعر / ساعة</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.pricePerHour}
                                    onChange={(e) => setFormData({ ...formData, pricePerHour: Number(e.target.value) })}
                                    className="form-input text-xs font-semibold px-3 h-10 border-[#e1e3e1] rounded-xl focus:border-[#006b20]"
                                />
                            </div>
                            {/* ⚽ حجم الملعب (Field Type) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#3e4a3c]">حجم الملعب</label>
                                <select
                                    value={formData.type} // ✅ استخدام المفتاح المتوافق مع الـ Schema الجديدة
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })} // ✅ تحديث الـ type كـ string مباشرة بدون Number()
                                    className="form-input bg-transparent text-xs font-semibold px-3 h-10 border-[#e1e3e1] rounded-xl focus:border-[#006b20]"
                                >
                                    <option value={FieldType.FiveASide}>خماسي</option>
                                    <option value={FieldType.SevenASide}>سباعي</option>
                                    <option value={FieldType.ElevenASide}>قانوني 11 ضد 11</option>
                                </select>
                            </div>

                            {/* 🌱 نوع الأرضية (Surface Type) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#3e4a3c]">نوع الأرضية</label>
                                <select
                                    value={formData.surface} // ✅ متوافق مع اسم الحقل بالسيرفر (surface)
                                    onChange={(e) => setFormData({ ...formData, surface: e.target.value })} // ✅ تمريرها كـ string متوافق مع الموديل الجديد
                                    className="form-input bg-transparent text-xs font-semibold px-3 h-10 border-[#e1e3e1] rounded-xl focus:border-[#006b20]"
                                >
                                    <option value={FieldSurface.ArtificialTurf}>نجيل صناعي</option>
                                    <option value={FieldSurface.NaturalGrass}>نجيل طبيعي</option>
                                    <option value={FieldSurface.HybridTurf}>هجين</option>
                                </select>
                            </div>
                        </div>

                        {/* المرافق (Checkboxes لـ Amenities) */}
                        <div className="space-y-2 pt-3 border-t border-[#f0f2f0]">
                            <label className="text-xs font-bold text-[#3e4a3c]">المرافق والخدمات المتاحة بالملعب</label>
                            <div className="grid grid-cols-2 gap-3 text-xs font-bold text-[#191c1c]">
                                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                                    <input type="checkbox" checked={formData.hasLight} onChange={(e) => setFormData({ ...formData, hasLight: e.target.checked })} className="accent-[#006b20] w-4 h-4" />
                                    <span>إضاءة كاشفة (كشافات ليلية)</span>
                                </label>
                                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                                    <input type="checkbox" checked={formData.hasParking} onChange={(e) => setFormData({ ...formData, hasParking: e.target.checked })} className="accent-[#006b20] w-4 h-4" />
                                    <span>موقف سيارات آمن</span>
                                </label>
                                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                                    <input type="checkbox" checked={formData.hasShowers} onChange={(e) => setFormData({ ...formData, hasShowers: e.target.checked })} className="accent-[#006b20] w-4 h-4" />
                                    <span>حمامات ودش واستحمام</span>
                                </label>
                                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                                    <input type="checkbox" checked={formData.hasCafeteria} onChange={(e) => setFormData({ ...formData, hasCafeteria: e.target.checked })} className="accent-[#006b20] w-4 h-4" />
                                    <span>بوفيه / كافتيريا مشروبات</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="responsive-button mt-4"
                        >
                            {isLoading ? 'جاري حفظ الملعب الجديد...' : 'تقديم طلب إدراج الملعب'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}