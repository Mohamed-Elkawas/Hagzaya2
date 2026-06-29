import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { playerApi } from '../api/player.api';
import { toast } from 'sonner';

export function SecuritySettingsPage() {
    const navigate = useNavigate();
    const [isSavingEmail, setIsSavingEmail] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingEmail(true);
        try {
            await playerApi.changeEmail(emailForm);
            toast.success('تم تغيير البريد الإلكتروني بنجاح');
            setEmailForm({ newEmail: '', currentPassword: '' });
        } catch (err: any) {
            toast.error(err.message || 'فشل تغيير البريد الإلكتروني');
        } finally {
            setIsSavingEmail(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            toast.error('كلمة المرور الجديدة غير متطابقة');
            return;
        }
        setIsSavingPassword(true);
        try {
            await playerApi.changePassword(passwordForm);
            toast.success('تم تغيير كلمة المرور بنجاح');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (err: any) {
            toast.error(err.message || 'فشل تغيير كلمة المرور');
        } finally {
            setIsSavingPassword(false);
        }
    };

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
                            className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-[#f0f2f0] border border-[#e1e3e1] text-[#3e4a3c] font-bold text-sm transition-colors"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            إعدادات التنبيهات
                        </Link>
                        <Link
                            to="/player/settings/security"
                            className="flex items-center gap-3 p-3 rounded-xl bg-[#006b20] text-white font-bold text-sm shadow-sm"
                        >
                            <span className="material-symbols-outlined">lock</span>
                            الأمان وكلمة المرور
                        </Link>
                    </div>

                    <div className="flex-1 space-y-6">
                        {/* Change Email Form */}
                        <div className="bg-white rounded-2xl border border-[#e1e3e1] p-6 shadow-sm">
                            <div className="mb-6">
                                <h2 className="text-xl font-black text-[#191c1c] mb-1">تغيير البريد الإلكتروني</h2>
                                <p className="text-xs font-semibold text-[#3e4a3c]">
                                    قم بتحديث البريد الإلكتروني المرتبط بحسابك.
                                </p>
                            </div>
                            
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#3e4a3c]">البريد الإلكتروني الجديد</label>
                                    <input
                                        type="email"
                                        required
                                        dir="ltr"
                                        value={emailForm.newEmail}
                                        onChange={(e) => setEmailForm(p => ({ ...p, newEmail: e.target.value }))}
                                        className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20] text-right"
                                        placeholder="example@email.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#3e4a3c]">كلمة المرور الحالية</label>
                                    <input
                                        type="password"
                                        required
                                        dir="ltr"
                                        value={emailForm.currentPassword}
                                        onChange={(e) => setEmailForm(p => ({ ...p, currentPassword: e.target.value }))}
                                        className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20] text-right"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSavingEmail}
                                    className="w-full sm:w-auto px-8 h-12 mt-4 bg-[#191c1c] hover:bg-black disabled:bg-gray-400 text-white font-black rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSavingEmail ? (
                                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-lg">mail</span>
                                    )}
                                    تحديث البريد
                                </button>
                            </form>
                        </div>

                        {/* Change Password Form */}
                        <div className="bg-white rounded-2xl border border-[#e1e3e1] p-6 shadow-sm">
                            <div className="mb-6">
                                <h2 className="text-xl font-black text-[#191c1c] mb-1">تغيير كلمة المرور</h2>
                                <p className="text-xs font-semibold text-[#3e4a3c]">
                                    اختر كلمة مرور قوية للحفاظ على أمان حسابك.
                                </p>
                            </div>
                            
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#3e4a3c]">كلمة المرور الحالية</label>
                                    <input
                                        type="password"
                                        required
                                        dir="ltr"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                                        className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20] text-right"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#3e4a3c]">كلمة المرور الجديدة</label>
                                    <input
                                        type="password"
                                        required
                                        dir="ltr"
                                        minLength={6}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                                        className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20] text-right"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#3e4a3c]">تأكيد كلمة المرور الجديدة</label>
                                    <input
                                        type="password"
                                        required
                                        dir="ltr"
                                        minLength={6}
                                        value={passwordForm.confirmNewPassword}
                                        onChange={(e) => setPasswordForm(p => ({ ...p, confirmNewPassword: e.target.value }))}
                                        className={`w-full text-xs font-semibold px-4 h-12 border rounded-xl focus:outline-none text-right ${
                                            passwordForm.confirmNewPassword && passwordForm.newPassword !== passwordForm.confirmNewPassword
                                                ? 'border-red-500 focus:border-red-500 bg-red-50'
                                                : 'border-[#e1e3e1] focus:border-[#006b20]'
                                        }`}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSavingPassword || (passwordForm.confirmNewPassword.length > 0 && passwordForm.newPassword !== passwordForm.confirmNewPassword)}
                                    className="w-full sm:w-auto px-8 h-12 mt-4 bg-[#006b20] hover:bg-[#005318] disabled:bg-gray-400 text-white font-black rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSavingPassword ? (
                                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-lg">key</span>
                                    )}
                                    تغيير كلمة المرور
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
