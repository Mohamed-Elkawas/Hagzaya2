import { useState } from 'react';
import type { PlayerProfileResponse, UpdatePlayerProfileRequest } from '../types/player.types';
import {
    Gender,
    Position,
    SkillLevel,
    GENDER_LABELS,
    POSITION_LABELS,
    SKILL_LEVEL_LABELS,
} from '../types/player.enums';

interface ProfileFormProps {
    profile: PlayerProfileResponse;
    onSave: (data: UpdatePlayerProfileRequest) => Promise<void>;
    isSaving: boolean;
}

export function ProfileForm({ profile, onSave, isSaving }: ProfileFormProps) {
    const [formData, setFormData] = useState<UpdatePlayerProfileRequest>({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        dateOfBirth: profile.dateOfBirth?.split('T')[0] || '', // YYYY-MM-DD
        gender: profile.gender ?? undefined,
        position: profile.position ?? undefined,
        skillLevel: profile.skillLevel ?? undefined,
        city: profile.city || '',
        country: profile.country || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        setFormData((prev) => {
            const updated = { ...prev };
            
            // Handle numeric enums correctly
            if (name === 'gender' || name === 'position' || name === 'skillLevel') {
                (updated as any)[name] = value ? Number(value) : undefined;
            } else {
                (updated as any)[name] = value;
            }
            
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#3e4a3c]">الاسم الأول</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#3e4a3c]">الاسم الأخير</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#3e4a3c]">اسم العرض (يظهر للآخرين)</label>
                    <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        required
                        className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#3e4a3c]">رقم الجوال</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        dir="ltr"
                        className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20] text-right"
                    />
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#3e4a3c]">تاريخ الميلاد</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#3e4a3c]">الجنس</label>
                    <select
                        name="gender"
                        value={formData.gender ?? ''}
                        onChange={handleChange}
                        className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20] bg-white"
                    >
                        <option value="">غير محدد</option>
                        {Object.values(Gender).map((val) => (
                            <option key={val} value={val}>
                                {GENDER_LABELS[val as Gender]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#3e4a3c]">المركز المفضل</label>
                    <select
                        name="position"
                        value={formData.position ?? ''}
                        onChange={handleChange}
                        className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20] bg-white"
                    >
                        <option value="">غير محدد</option>
                        {Object.values(Position).map((val) => (
                            <option key={val} value={val}>
                                {POSITION_LABELS[val as Position]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#3e4a3c]">مستوى المهارة</label>
                    <select
                        name="skillLevel"
                        value={formData.skillLevel ?? ''}
                        onChange={handleChange}
                        className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20] bg-white"
                    >
                        <option value="">غير محدد</option>
                        {Object.values(SkillLevel).map((val) => (
                            <option key={val} value={val}>
                                {SKILL_LEVEL_LABELS[val as SkillLevel]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#3e4a3c]">المدينة</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                    />
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#3e4a3c]">الدولة</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3e4a3c]">نبذة عني</label>
                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full text-xs font-semibold p-4 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20] resize-none"
                    placeholder="اكتب نبذة مختصرة عنك وعن أسلوب لعبك..."
                />
            </div>

            <div className="pt-4 border-t border-[#e1e3e1]">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto px-8 h-12 bg-[#006b20] hover:bg-[#005318] disabled:bg-gray-400 text-white font-black rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-lg">save</span>
                            حفظ التعديلات
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
