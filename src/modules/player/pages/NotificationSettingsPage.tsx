import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { playerApi } from '../api/player.api';
import type { NotificationSettingsResponse, UpdateNotificationSettingsRequest } from '../types/player.types';
import { toast } from 'sonner';

const SETTING_ITEMS = [
    { key: 'Booking', label: 'الحجوزات', desc: 'إشعارات تأكيد الحجز وحالته', icon: 'event_available' },
    { key: 'Match', label: 'المباريات', desc: 'دعوات وتحديثات المباريات', icon: 'sports_soccer' },
    { key: 'Tournament', label: 'البطولات', desc: 'تحديثات البطولات المشترك بها', icon: 'emoji_events' },
    { key: 'Badge', label: 'الشارات', desc: 'عند حصولك على شارات أو إنجازات جديدة', icon: 'military_tech' },
    { key: 'Report', label: 'التقارير', desc: 'تقارير الأداء والإحصائيات', icon: 'description' },
    { key: 'General', label: 'عام', desc: 'أخبار وتحديثات المنصة', icon: 'notifications' },
] as const;

export function NotificationSettingsPage() {
    const [settings, setSettings] = useState<NotificationSettingsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        playerApi.getNotificationSettings()
            .then(setSettings)
            .catch(() => toast.error('فشل جلب إعدادات التنبيهات'))
            .finally(() => setIsLoading(false));
    }, []);

    const handleToggle = (type: 'email' | 'push', key: string) => {
        if (!settings) return;
        const propName = `${type}On${key}` as keyof NotificationSettingsResponse;
        setSettings((prev) => prev ? { ...prev, [propName]: !prev[propName] } : prev);
    };

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            const request: UpdateNotificationSettingsRequest = { ...settings };
            await playerApi.updateNotificationSettings(request);
            toast.success('تم حفظ إعدادات التنبيهات بنجاح');
        } catch (err: any) {
            toast.error(err.message || 'فشل حفظ الإعدادات');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7]">
                <span className="material-symbols-outlined animate-spin text-4xl text-[#006b20]">progress_activity</span>
            </div>
        );
    }

    if (!settings) return null;

    return (
        <div className="min-h-screen bg-[#f6f8f7] pb-16 font-ar" dir="rtl">
            <div className="bg-[#006b20] pt-12 pb-24 px-4 md:px-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white mb-1">الملف الشخصي</h1>
                        <p className="text-sm text-white/80 font-semibold">إدارة بياناتك الشخصية وإعدادات حسابك</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-16 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Settings Sidebar */}
                    <div className="w-full md:w-64 shrink-0 space-y-2">
                        <Link
                            to="/player/profile"
                            className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-[#f0f2f0] border border-[#e1e3e1] text-[#3e4a3c] font-bold text-sm transition-colors"
                        >
                            <span className="material-symbols-outlined">person</span>
                            البيانات الأساسية
                        </Link>
                        <Link
                            to="/player/settings/notifications"
                            className="flex items-center gap-3 p-3 rounded-xl bg-[#006b20] text-white font-bold text-sm shadow-sm"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            إعدادات التنبيهات
                        </Link>
                        <Link
                            to="/player/settings/security"
                            className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-[#f0f2f0] border border-[#e1e3e1] text-[#3e4a3c] font-bold text-sm transition-colors"
                        >
                            <span className="material-symbols-outlined">lock</span>
                            الأمان وكلمة المرور
                        </Link>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 bg-white rounded-2xl border border-[#e1e3e1] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#e1e3e1]">
                            <h2 className="text-xl font-black text-[#191c1c] mb-1">إعدادات التنبيهات</h2>
                            <p className="text-xs font-semibold text-[#3e4a3c]">
                                تحكم في كيفية وصول الإشعارات إليك عبر التطبيق أو البريد الإلكتروني.
                            </p>
                        </div>
                        
                        <div className="divide-y divide-[#e1e3e1]">
                            {SETTING_ITEMS.map((item) => {
                                const emailKey = `emailOn${item.key}` as keyof NotificationSettingsResponse;
                                const pushKey = `pushOn${item.key}` as keyof NotificationSettingsResponse;
                                
                                return (
                                    <div key={item.key} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-[#fcfdfc] transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#f0f2f0] text-[#3e4a3c] flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined">{item.icon}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-[#191c1c] mb-1">{item.label}</h3>
                                                <p className="text-xs font-semibold text-[#3e4a3c] leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-6 mt-2 sm:mt-0 shrink-0 bg-[#f0f2f0]/50 p-2 rounded-xl">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <span className="text-[11px] font-bold text-[#3e4a3c] group-hover:text-[#191c1c] transition-colors">دفع (Push)</span>
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={!!settings[pushKey]}
                                                    onChange={() => handleToggle('push', item.key)}
                                                />
                                                <div className={`w-9 h-5 rounded-full transition-colors relative flex items-center ${settings[pushKey] ? 'bg-[#006b20]' : 'bg-[#e1e3e1]'}`}>
                                                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute shadow-sm transition-all ${settings[pushKey] ? 'left-1' : 'right-1'}`} />
                                                </div>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <span className="text-[11px] font-bold text-[#3e4a3c] group-hover:text-[#191c1c] transition-colors">إيميل</span>
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={!!settings[emailKey]}
                                                    onChange={() => handleToggle('email', item.key)}
                                                />
                                                <div className={`w-9 h-5 rounded-full transition-colors relative flex items-center ${settings[emailKey] ? 'bg-[#006b20]' : 'bg-[#e1e3e1]'}`}>
                                                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute shadow-sm transition-all ${settings[emailKey] ? 'left-1' : 'right-1'}`} />
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="p-6 border-t border-[#e1e3e1] bg-[#fcfdfc]">
                            <button
                                onClick={handleSave}
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
                    </div>
                </div>
            </div>
        </div>
    );
}
