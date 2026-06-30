import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePlayerProfile } from '../hooks/usePlayerProfile';
import { ProfileForm } from '../components/ProfileForm';
import {
    POSITION_LABELS,
    SKILL_LEVEL_LABELS,
    GENDER_LABELS,
} from '../types/player.enums';
import type { Position, SkillLevel, Gender } from '../types/player.enums';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface InfoRowProps {
    icon: string;
    label: string;
    value?: string | number | null;
    ltr?: boolean;
}

function InfoRow({ icon, label, value, ltr = false }: InfoRowProps) {
    return (
        <div className="flex items-center justify-between gap-3 py-3 border-b border-[#f0f2f0] last:border-0">
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#3e4a3c]">
                <span className="material-symbols-outlined text-[#006b20] text-base">{icon}</span>
                <span>{label}</span>
            </div>
            <span
                className={`text-xs font-black text-[#191c1c] text-left max-w-[55%] truncate ${ltr ? 'dir-ltr' : ''}`}
                dir={ltr ? 'ltr' : undefined}
            >
                {value ?? <span className="text-[#3e4a3c]/40 font-semibold">—</span>}
            </span>
        </div>
    );
}

interface StatCardProps {
    icon: string;
    label: string;
    value: number | string;
    color?: string;
}

function StatCard({ icon, label, value, color = 'text-[#006b20]' }: StatCardProps) {
    return (
        <div className="flex flex-col items-center gap-1 bg-[#f6f8f7] rounded-2xl p-4 flex-1 min-w-0">
            <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
            <span className={`text-xl font-black ${color}`}>{value}</span>
            <span className="text-[10px] font-bold text-[#3e4a3c]/60 text-center leading-tight">{label}</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function PlayerProfilePage() {
    const navigate = useNavigate();
    const { profile, points, isLoading, error, updateProfile, fetchProfile } = usePlayerProfile();

    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // ── Loading ───────────────────────────────────────────────────────────────
    if (isLoading && !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7]">
                <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#006b20]">
                        progress_activity
                    </span>
                    <p className="text-xs font-bold text-[#3e4a3c]">جاري تحميل ملفك الشخصي…</p>
                </div>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error && !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f8f7] p-4 text-center gap-3">
                <span className="material-symbols-outlined text-5xl text-[#c62828]/30">error</span>
                <p className="font-bold text-sm text-[#191c1c]">تعذّر تحميل الملف الشخصي</p>
                <p className="text-xs text-[#3e4a3c]/70">{error}</p>
                <button
                    onClick={fetchProfile}
                    className="mt-2 bg-[#006b20] text-white px-6 py-2.5 rounded-xl text-xs font-bold"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    if (!profile) return null;

    // ── Derived display values ────────────────────────────────────────────────
    const displayName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || profile.displayName || '—';
    
    // Position now comes directly as text (e.g. "مهاجم") from backend
    const positionLabel = profile.position || '—';
    
    const skillLabel =
        profile.skillLevel != null
            ? SKILL_LEVEL_LABELS[profile.skillLevel as SkillLevel] ?? '—'
            : null;
            
    const genderLabel = profile.gender || '—';
    
    // Address fix: Ignore default swagger "string"
    const displayAddress = (!profile.address || profile.address === 'string') ? '—' : profile.address;

    // Points wallet derived
    const totalPoints = points?.points ?? profile.points ?? 0;
    const pointsValue = points?.pointsValue ?? (totalPoints * 0.1).toFixed(2);
    const maxDiscount = points?.maxDiscount ?? 'خصم على حجزك القادم';
    
    // Progress: assume 500 pts for next tier, cap at 100%
    const progressPct = Math.min((totalPoints / 500) * 100, 100);

    // ── Save handler ──────────────────────────────────────────────────────────
    const handleSave = async (data: any) => {
        setIsSaving(true);
        try {
            await updateProfile(data);
            setIsEditMode(false);
        } finally {
            setIsSaving(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f6f8f7] pb-20 font-ar" dir="rtl">

            {/* ── Hero banner ─────────────────────────────────────────────── */}
            <div className="bg-gradient-to-bl from-[#004d17] to-[#006b20] pt-12 pb-28 px-4 md:px-8 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/5" />
                <div className="absolute top-4 left-32 w-24 h-24 rounded-full bg-white/5" />
                <div className="absolute -bottom-8 right-8 w-36 h-36 rounded-full bg-white/5" />

                <div className="max-w-5xl mx-auto flex items-center justify-between relative">
                    <div>
                        <p className="text-white/60 text-xs font-bold mb-1">حساب اللاعب</p>
                        <h1 className="text-2xl font-black text-white">الملف الشخصي</h1>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                        aria-label="العودة للرئيسية"
                    >
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </div>

            {/* ── Main content — pulled up over the banner ─────────────────── */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-20 space-y-6">

                {/* ── Two-column layout ──────────────────────────────────────── */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ════════════════════════════════════════════════════════
                        LEFT SIDEBAR — Avatar · Points wallet · Nav links
                    ════════════════════════════════════════════════════════ */}
                    <div className="w-full lg:w-72 shrink-0 space-y-4">

                        {/* Avatar card */}
                        <div className="bg-white rounded-3xl border border-[#e1e3e1] shadow-sm p-6 flex flex-col items-center gap-3 text-center">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-[#e8f5e9] border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                                    {profile.photo || profile.avatarUrl ? (
                                        <img src={profile.photo || profile.avatarUrl || ''} alt={displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-5xl text-[#006b20]">person</span>
                                    )}
                                </div>
                                {/* Edit avatar placeholder */}
                                <button
                                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-[#e1e3e1] shadow flex items-center justify-center hover:border-[#006b20] transition-colors"
                                    title="تغيير الصورة"
                                >
                                    <span className="material-symbols-outlined text-[#3e4a3c] text-sm">photo_camera</span>
                                </button>
                            </div>

                            {/* Name + username */}
                            <div>
                                <h2 className="font-black text-lg text-[#191c1c] leading-tight">{displayName}</h2>
                                {profile.username && (
                                    <p className="text-[11px] text-[#006b20] font-black mt-0.5" dir="ltr">
                                        @{profile.username}
                                    </p>
                                )}
                                {profile.email && (
                                    <p className="text-[11px] text-[#3e4a3c]/60 font-semibold mt-0.5" dir="ltr">
                                        {profile.email}
                                    </p>
                                )}
                            </div>

                            {/* Position badge */}
                            {positionLabel && (
                                <span className="bg-[#e8f5e9] text-[#006b20] text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">sports_soccer</span>
                                    {positionLabel}
                                </span>
                            )}

                            {/* Skill badge */}
                            {skillLabel && (
                                <span className="bg-[#f0f2f0] text-[#3e4a3c] text-[11px] font-bold px-3 py-1 rounded-full">
                                    {skillLabel}
                                </span>
                            )}
                        </div>

                        {/* ── Loyalty Points Wallet ── */}
                        <div className="bg-gradient-to-br from-[#004d17] to-[#006b20] rounded-3xl shadow-lg p-5 text-white space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-yellow-300 text-xl">workspace_premium</span>
                                    <span className="text-xs font-black text-white/80 uppercase tracking-wider">محفظة النقاط</span>
                                </div>
                            </div>

                            {/* Points count */}
                            <div>
                                <p className="text-4xl font-black text-white leading-none">{totalPoints}</p>
                                <p className="text-xs text-white/60 mt-1">نقطة مكتسبة</p>
                            </div>

                            {/* Cash value */}
                            <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-white/60 font-bold">القيمة النقدية</p>
                                    <p className="text-lg font-black text-yellow-300">{pointsValue} EGP</p>
                                </div>
                                <span className="material-symbols-outlined text-yellow-300 text-2xl">payments</span>
                            </div>

                            {/* Discount reward label */}
                            <div className="flex items-start gap-2 bg-white/10 rounded-xl p-3">
                                <span className="material-symbols-outlined text-yellow-300 text-base shrink-0 mt-0.5">local_offer</span>
                                <p className="text-[11px] text-white/80 font-semibold leading-relaxed" dir="ltr">
                                    <span className="font-black text-yellow-300 ml-1">{maxDiscount.split(' ')[0]}</span>
                                    {maxDiscount.substring(maxDiscount.indexOf(' ') + 1)}
                                </p>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] text-white/50 font-bold">
                                    <span>{totalPoints} / 500 نقطة</span>
                                    <span>{Math.round(progressPct)}%</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-1.5">
                                    <div
                                        className="bg-yellow-300 h-1.5 rounded-full transition-all duration-700"
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-white/40 font-semibold text-center">
                                    {Math.max(0, 500 - totalPoints)} نقطة للمستوى التالي
                                </p>
                            </div>
                        </div>

                        {/* ── Settings nav links ── */}
                        <div className="bg-white rounded-2xl border border-[#e1e3e1] shadow-sm overflow-hidden">
                            <Link
                                to="/player/profile"
                                className="flex items-center gap-3 px-4 py-3.5 bg-[#006b20]/5 border-b border-[#e1e3e1] text-[#006b20] font-bold text-xs"
                            >
                                <span className="material-symbols-outlined text-base">person</span>
                                البيانات الأساسية
                            </Link>
                            <Link
                                to="/player/settings/notifications"
                                className="flex items-center gap-3 px-4 py-3.5 border-b border-[#e1e3e1] text-[#3e4a3c] hover:bg-[#f6f8f7] font-bold text-xs transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">notifications</span>
                                إعدادات التنبيهات
                            </Link>
                            <Link
                                to="/player/settings/security"
                                className="flex items-center gap-3 px-4 py-3.5 text-[#3e4a3c] hover:bg-[#f6f8f7] font-bold text-xs transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">lock</span>
                                الأمان وكلمة المرور
                            </Link>
                        </div>
                    </div>

                    {/* ════════════════════════════════════════════════════════
                        RIGHT MAIN PANEL — Display mode / Edit mode
                    ════════════════════════════════════════════════════════ */}
                    <div className="flex-1 min-w-0 space-y-4">

                        {/* ── Stats row ── */}
                        <div className="flex gap-3">
                            <StatCard icon="sports_soccer" label="إجمالي المباريات" value={profile.totalMatches ?? 0} />
                            <StatCard icon="military_tech" label="الأهداف" value={profile.totalScores ?? 0} color="text-[#b86a00]" />
                            <StatCard icon="assistant" label="التمريرات الحاسمة" value={profile.totalAssists ?? 0} color="text-blue-500" />
                            <StatCard icon="leaderboard" label="تصنيف ELO" value={profile.currentElo ?? 1000} color="text-purple-600" />
                        </div>

                        {/* ── Profile info card ── */}
                        <div className="bg-white rounded-3xl border border-[#e1e3e1] shadow-sm overflow-hidden">

                            {/* Card header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f2f0]">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#006b20] text-lg">
                                        {isEditMode ? 'edit' : 'badge'}
                                    </span>
                                    <h2 className="font-black text-sm text-[#191c1c]">
                                        {isEditMode ? 'تعديل الملف الشخصي' : 'البيانات الشخصية'}
                                    </h2>
                                </div>

                                {!isEditMode ? (
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        className="flex items-center gap-1.5 text-xs font-bold text-[#006b20] bg-[#e8f5e9] hover:bg-[#d4edda] px-3 py-1.5 rounded-xl transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        تعديل البيانات
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditMode(false)}
                                        disabled={isSaving}
                                        className="flex items-center gap-1.5 text-xs font-bold text-[#3e4a3c] bg-[#f0f2f0] hover:bg-[#e1e3e1] px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                        إلغاء
                                    </button>
                                )}
                            </div>

                            {/* ── Display mode ───────────────────────────────── */}
                            {!isEditMode && (
                                <div className="px-6 py-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                        <div>
                                            <p className="text-[10px] font-black text-[#3e4a3c]/40 uppercase tracking-wider pt-4 pb-1">
                                                معلومات الحساب
                                            </p>
                                            <InfoRow
                                                icon="person"
                                                label="الاسم الكامل"
                                                value={displayName}
                                            />
                                            <InfoRow
                                                icon="alternate_email"
                                                label="البريد الإلكتروني"
                                                value={profile.email}
                                                ltr
                                            />
                                            <InfoRow
                                                icon="phone"
                                                label="رقم الجوال"
                                                value={profile.phone}
                                                ltr
                                            />
                                            <InfoRow
                                                icon="wc"
                                                label="الجنس"
                                                value={genderLabel}
                                            />
                                            <InfoRow
                                                icon="cake"
                                                label="العمر"
                                                value={profile.age === 0 ? '—' : `${profile.age} سنة`}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#3e4a3c]/40 uppercase tracking-wider pt-4 pb-1">
                                                بيانات الملعب
                                            </p>
                                            <InfoRow
                                                icon="sports_soccer"
                                                label="مركز اللعب"
                                                value={positionLabel}
                                            />
                                            <InfoRow
                                                icon="groups"
                                                label="الفريق الحالي"
                                                value={profile.teamName}
                                            />
                                            <InfoRow
                                                icon="location_city"
                                                label="العنوان"
                                                value={displayAddress}
                                            />
                                            {profile.bio && (
                                                <div className="py-3 border-b border-[#f0f2f0] last:border-0">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-[#3e4a3c] mb-1.5">
                                                        <span className="material-symbols-outlined text-[#006b20] text-base">info</span>
                                                        <span>نبذة شخصية</span>
                                                    </div>
                                                    <p className="text-xs text-[#3e4a3c]/80 leading-relaxed pr-6">
                                                        {profile.bio}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Verification badge */}
                                    <div className={`mx-0 my-4 rounded-xl px-4 py-3 flex items-center gap-2.5 ${
                                        profile.isVerified
                                            ? 'bg-[#e8f5e9] border border-[#006b20]/20'
                                            : 'bg-[#fff3e0] border border-[#b86a00]/20'
                                    }`}>
                                        <span className={`material-symbols-outlined text-xl ${
                                            profile.isVerified ? 'text-[#006b20]' : 'text-[#b86a00]'
                                        }`}>
                                            {profile.isVerified ? 'verified' : 'pending'}
                                        </span>
                                        <p className={`text-xs font-bold ${
                                            profile.isVerified ? 'text-[#006b20]' : 'text-[#b86a00]'
                                        }`}>
                                            {profile.isVerified
                                                ? 'الحساب موثّق — جميع بياناتك مؤكدة'
                                                : 'الحساب قيد التوثيق — يرجى التحقق من بريدك الإلكتروني'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── Edit mode ──────────────────────────────────── */}
                            {isEditMode && (
                                <div className="p-6">
                                    <ProfileForm
                                        profile={profile}
                                        onSave={handleSave}
                                        isSaving={isSaving}
                                    />
                                </div>
                            )}
                        </div>

                        {/* ── Points history ── */}
                        {points?.history && points.history.length > 0 && (
                            <div className="bg-white rounded-3xl border border-[#e1e3e1] shadow-sm overflow-hidden">
                                <div className="flex items-center gap-2 px-6 py-4 border-b border-[#f0f2f0]">
                                    <span className="material-symbols-outlined text-[#006b20] text-lg">history</span>
                                    <h2 className="font-black text-sm text-[#191c1c]">سجل النقاط</h2>
                                </div>
                                <div className="divide-y divide-[#f0f2f0]">
                                    {points.history.slice(0, 5).map((entry) => (
                                        <div key={entry.id} className="flex items-center justify-between px-6 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-[#e8f5e9] flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-sm text-[#006b20]">
                                                        workspace_premium
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#191c1c]">{entry.reason}</p>
                                                    <p className="text-[10px] text-[#3e4a3c]/50">
                                                        {new Date(entry.createdAt).toLocaleDateString('ar-EG')}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-black ${
                                                entry.points >= 0 ? 'text-[#006b20]' : 'text-rose-600'
                                            }`}>
                                                {entry.points >= 0 ? '+' : ''}{entry.points}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
