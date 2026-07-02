import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePlayerProfile } from '../hooks/usePlayerProfile';
import { ProfileForm } from '../components/ProfileForm';
import {
    POSITION_LABELS,
    SKILL_LEVEL_LABELS,
    GENDER_LABELS,
} from '../types/player.enums';
import type { Position, SkillLevel, Gender } from '../types/player.enums';
import { useLanguage } from '../../../core/context/LanguageContext';
import { playerApi } from '../api/player.api';

// ── Bilingual Dictionary ───────────────────────────────────────────────────────
const DICT = {
  heroTitle:     { ar: 'الملف الشخصي',                      en: 'My Profile' },
  heroSub:       { ar: 'إدارة حسابك الشخصي والبيانات',      en: 'Manage your personal account and data' },
  playerAccount: { ar: 'حساب اللاعب',                       en: 'Player Account' },
  changePhoto:   { ar: 'تغيير الصورة',                      en: 'Change Photo' },
  uploading:     { ar: 'جار الرفع...',                      en: 'Uploading...' },
  walletTitle:   { ar: 'محفظة النقاط',                      en: 'Points Wallet' },
  pointsUnit:    { ar: 'نقطة',                              en: 'pts' },
  cashValue:     { ar: 'القيمة النقدية المتوفرة',           en: 'Available Cash Value' },
  progress:      { ar: 'التقدم للمستوى التالي',             en: 'Progress to Next Level' },
  remaining:     { ar: 'تبقى',                              en: '' },
  remainingSuf:  { ar: 'نقطة للحصول على قسيمة خصم إضافية', en: 'pts left for a bonus discount' },
  basicData:     { ar: 'البيانات الأساسية',                 en: 'Basic Data' },
  notifications: { ar: 'إعدادات التنبيهات',                en: 'Notification Settings' },
  security:      { ar: 'الأمان وكلمة المرور',              en: 'Security & Password' },
  personalInfo:  { ar: 'البيانات الشخصية',                  en: 'Personal Information' },
  editData:      { ar: 'تعديل البيانات',                    en: 'Edit Data' },
  editProfile:   { ar: 'تعديل الملف الشخصي',               en: 'Edit Profile' },
  cancel:        { ar: 'إلغاء',                             en: 'Cancel' },
  // Info Row labels
  fullName:      { ar: 'الاسم الكامل',       en: 'Full Name' },
  email:         { ar: 'البريد الإلكتروني',  en: 'Email Address' },
  phone:         { ar: 'رقم الجوال',         en: 'Phone Number' },
  gender:        { ar: 'الجنس',              en: 'Gender' },
  age:           { ar: 'العمر',              en: 'Age' },
  ageSuffix:     { ar: 'سنة',               en: 'yrs' },
  position:      { ar: 'مركز اللعب',        en: 'Position' },
  team:          { ar: 'الفريق الحالي',     en: 'Current Team' },
  skill:         { ar: 'مستوى المهارة',     en: 'Skill Level' },
  address:       { ar: 'العنوان',           en: 'Address' },
  joinDate:      { ar: 'تاريخ الانضمام',    en: 'Join Date' },
  // Section headers
  accountInfo:   { ar: 'معلومات الحساب الأساسية', en: 'Account Information' },
  sportsData:    { ar: 'البيانات الرياضية',        en: 'Sports Data' },
  // Verification
  verified:      { ar: 'الحساب موثّق — جميع بياناتك مؤكدة', en: 'Account Verified — All data confirmed' },
  unverified:    { ar: 'الحساب قيد التوثيق — يرجى التحقق من بريدك الإلكتروني', en: 'Pending Verification — Please check your email' },
  // Stats
  totalMatches:  { ar: 'إجمالي المباريات',    en: 'Total Matches' },
  goals:         { ar: 'الأهداف',             en: 'Goals' },
  assists:       { ar: 'التمريرات الحاسمة',  en: 'Key Assists' },
  eloRating:     { ar: 'تصنيف ELO',           en: 'ELO Rating' },
  // Points history
  pointsHistory: { ar: 'سجل النقاط',          en: 'Points History' },
  // Loading / Error
  loadingProfile:{ ar: 'جاري تحميل ملفك الشخصي…', en: 'Loading your profile...' },
  loadError:     { ar: 'تعذّر تحميل الملف الشخصي', en: 'Failed to load profile' },
  retryBtn:      { ar: 'إعادة المحاولة',           en: 'Retry' },
} as const;

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
    const { lang } = useLanguage();
    const isAr = lang === 'ar';
    const d = (key: keyof typeof DICT) => DICT[key][lang];

    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // ── Photo Upload Handler ──────────────────────────────────────────────────
    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        // Upload to backend
        setIsUploadingPhoto(true);
        try {
            await playerApi.uploadPhoto(file);
            await fetchProfile();
        } catch (err) {
            console.error('[PlayerProfile] Photo upload failed:', err);
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (isLoading && !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7]">
                <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#006b20]">progress_activity</span>
                    <p className="text-xs font-bold text-[#3e4a3c]">{d('loadingProfile')}</p>
                </div>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error && !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f8f7] p-4 text-center gap-3">
                <span className="material-symbols-outlined text-5xl text-[#c62828]/30">error</span>
                <p className="font-bold text-sm text-[#191c1c]">{d('loadError')}</p>
                <p className="text-xs text-[#3e4a3c]/70">{error}</p>
                <button onClick={fetchProfile} className="mt-2 bg-[#006b20] text-white px-6 py-2.5 rounded-xl text-xs font-bold">
                    {d('retryBtn')}
                </button>
            </div>
        );
    }

    if (!profile) return null;

    // ── Derived display values ────────────────────────────────────────────────
    const displayName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || profile.displayName || '—';
    const positionLabel = profile.position || '—';
    const skillLabel = profile.skillLevel != null ? SKILL_LEVEL_LABELS[profile.skillLevel as SkillLevel] ?? '—' : null;
    const genderLabel = profile.gender || '—';
    const displayAddress = (!profile.address || profile.address === 'string') ? '—' : profile.address;

    // Points wallet derived
    const totalPoints = points?.points ?? profile.points ?? 0;
    const pointsValue = points?.pointsValue ?? (totalPoints * 0.1).toFixed(2);
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
        <div className={`min-h-screen bg-[#f6f8f7] pb-20 ${isAr ? 'font-ar' : 'font-en'}`} dir={isAr ? 'rtl' : 'ltr'}>

            {/* ── Hero banner ─────────────────────────────────────────────── */}
            <div className="bg-emerald-800 h-64 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#004d17] to-emerald-800 opacity-90" />
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-emerald-900/40 blur-2xl pointer-events-none" />
                <div className="relative z-10 text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-md">{d('heroTitle')}</h1>
                    <p className="text-white/80 text-sm md:text-base mt-2 font-medium">{d('heroSub')}</p>
                </div>
            </div>

            {/* ── Main content — pulled up over the banner ─────────────────── */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 relative -mt-24 space-y-6">

                {/* ── Grid layout ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* ════════════════════════════════════════════════════════
                        LEFT SIDEBAR — Avatar · Points wallet · Nav links
                    ════════════════════════════════════════════════════════ */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Avatar card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6 flex flex-col items-center text-center relative overflow-visible mt-6 lg:mt-0">
                            {/* Avatar */}
                            <div className="relative -mt-20 mb-4">
                                <div className="w-32 h-32 rounded-full bg-[#e8f5e9] border-[6px] border-white shadow-lg flex items-center justify-center overflow-hidden">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt={displayName} className="w-full h-full object-cover" />
                                    ) : profile.photo || profile.avatarUrl ? (
                                        <img src={profile.photo || profile.avatarUrl || ''} alt={displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-6xl text-[#006b20]">person</span>
                                    )}
                                    {isUploadingPhoto && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                                            <span className="material-symbols-outlined animate-spin text-white text-2xl">progress_activity</span>
                                        </div>
                                    )}
                                </div>
                                {/* Hidden file input */}
                                <input
                                    ref={photoInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                                <button
                                    className="absolute bottom-1 end-1 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    title={d('changePhoto')}
                                    onClick={() => photoInputRef.current?.click()}
                                    disabled={isUploadingPhoto}
                                >
                                    {isUploadingPhoto
                                        ? <span className="material-symbols-outlined animate-spin text-gray-600 text-sm">progress_activity</span>
                                        : <span className="material-symbols-outlined text-gray-600 text-sm">photo_camera</span>
                                    }
                                </button>
                            </div>

                            {/* Name + username */}
                            <div className="space-y-1">
                                <h2 className="font-black text-2xl text-gray-900 leading-tight">{displayName}</h2>
                                {profile.username && (
                                    <p className="text-sm text-emerald-600 font-bold" dir="ltr">
                                        @{profile.username}
                                    </p>
                                )}
                                {profile.email && (
                                    <p className="text-xs text-gray-500 font-semibold mt-1" dir="ltr">
                                        {profile.email}
                                    </p>
                                )}
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 justify-center mt-5">
                                {positionLabel && (
                                    <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100">
                                        <span className="material-symbols-outlined text-sm">sports_soccer</span>
                                        {positionLabel}
                                    </span>
                                )}
                                {skillLabel && (
                                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-4 py-1.5 rounded-full border border-gray-200">
                                        {skillLabel}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ── Loyalty Points Wallet ── */}
                        <div className="bg-gradient-to-br from-[#004d17] to-[#006b20] rounded-3xl shadow-lg p-6 text-white space-y-5">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-yellow-300">
                                    <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white/70 uppercase tracking-wider">{d('walletTitle')}</p>
                                    <p className="text-2xl font-black">{totalPoints} <span className="text-sm font-medium text-white/80">{d('pointsUnit')}</span></p>
                                </div>
                            </div>

                            {/* Cash value */}
                            <div className="bg-white/10 rounded-2xl p-4 flex items-center justify-between border border-white/10">
                                <div>
                                    <p className="text-[11px] text-white/60 font-bold mb-1">{d('cashValue')}</p>
                                    <p className="text-xl font-black text-yellow-300">{pointsValue} EGP</p>
                                </div>
                                <span className="material-symbols-outlined text-yellow-300 opacity-80 text-4xl">account_balance_wallet</span>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between text-xs text-white/80 font-bold">
                                    <span>{d('progress')}</span>
                                    <span>{Math.round(progressPct)}%</span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden shadow-inner">
                                    <div
                                        className="bg-yellow-400 h-full rounded-full transition-all duration-700 relative"
                                        style={{ width: `${progressPct}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-white/60 font-medium text-center mt-2">
                                    {d('remaining')} {Math.max(0, 500 - totalPoints)} {d('remainingSuf')}
                                </p>
                            </div>
                        </div>

                        {/* ── Settings nav links ── */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <Link to="/player/profile" className="flex items-center gap-3 px-5 py-4 bg-emerald-50 border-b border-gray-100 text-emerald-700 font-bold text-sm">
                                <span className="material-symbols-outlined">person</span>
                                {d('basicData')}
                            </Link>
                            <Link to="/player/settings/notifications" className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 text-gray-700 hover:bg-gray-50 font-bold text-sm transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                                {d('notifications')}
                            </Link>
                            <Link to="/player/settings/security" className="flex items-center gap-3 px-5 py-4 text-gray-700 hover:bg-gray-50 font-bold text-sm transition-colors">
                                <span className="material-symbols-outlined">lock</span>
                                {d('security')}
                            </Link>
                        </div>
                    </div>

                    {/* ════════════════════════════════════════════════════════
                        RIGHT MAIN PANEL — Display mode / Edit mode
                    ════════════════════════════════════════════════════════ */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* ── Content Card ── */}
                        <div className="bg-white rounded-3xl border border-[#e1e3e1] shadow-sm overflow-hidden">

                            {/* ── Card Header ── */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
                                <h2 className="font-black text-lg text-gray-900">
                                    {isEditMode ? d('editProfile') : d('personalInfo')}
                                </h2>
                                {!isEditMode && (
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        className="text-emerald-700 font-bold text-xs flex items-center gap-1 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        {d('editData')}
                                    </button>
                                )}
                                {isEditMode && (
                                    <button
                                        onClick={() => setIsEditMode(false)}
                                        disabled={isSaving}
                                        className="text-gray-600 font-bold text-xs flex items-center gap-1 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                        {d('cancel')}
                                    </button>
                                )}
                            </div>

                                    {/* ── Display mode ───────────────────────────────── */}
                                    {!isEditMode && (
                                        <div className="p-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                                {/* Group 1 */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                                                        <span className="material-symbols-outlined text-gray-400 text-sm">account_circle</span>
                                                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">{d('accountInfo')}</h3>
                                                    </div>
                                                    <InfoRow icon="badge"           label={d('fullName')}  value={displayName} />
                                                    <InfoRow icon="mail"            label={d('email')}     value={profile.email}  ltr />
                                                    <InfoRow icon="call"            label={d('phone')}     value={profile.phone}  ltr />
                                                    <InfoRow icon="wc"              label={d('gender')}    value={genderLabel} />
                                                    <InfoRow icon="calendar_month" label={d('age')}       value={profile.age === 0 ? '—' : `${profile.age} ${d('ageSuffix')}`} />
                                                </div>
                                                {/* Group 2 */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                                                        <span className="material-symbols-outlined text-gray-400 text-sm">sports</span>
                                                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">{d('sportsData')}</h3>
                                                    </div>
                                                    <InfoRow icon="sports_soccer" label={d('position')} value={positionLabel} />
                                                    <InfoRow icon="groups"        label={d('team')}     value={profile.teamName} />
                                                    <InfoRow icon="star_rate"     label={d('skill')}    value={skillLabel} />
                                                    <InfoRow icon="pin_drop"      label={d('address')}  value={displayAddress} />
                                                    <InfoRow icon="calendar_today" label={d('joinDate')} value={profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '—'} />
                                                </div>
                                            </div>

                                            {/* Verification badge */}
                                            <div className={`mt-8 rounded-xl px-5 py-4 flex items-center gap-3 ${
                                                profile.isVerified ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-amber-50 border border-amber-100 text-amber-800'
                                            }`}>
                                                <span className="material-symbols-outlined text-2xl">{profile.isVerified ? 'verified' : 'pending'}</span>
                                                <p className="text-sm font-bold">
                                                    {profile.isVerified ? d('verified') : d('unverified')}
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
                                    <h2 className="font-black text-sm text-[#191c1c]">{d('pointsHistory')}</h2>
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
                                                        {new Date(entry.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
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
