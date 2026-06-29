import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OwnerTournamentsTab } from '../../tournaments/pages/OwnerTournamentsTab';

export function OwnerDashboardPage() {
    const navigate = useNavigate();
    const [activeTimeFilter, setActiveTimeFilter] = useState<'اليوم' | 'الأسبوع' | 'الشهر'>('اليوم');
    const [activeTab, setActiveTab] = useState<string>('لوحة التحكم');

    const navItems = [
        { name: 'لوحة التحكم', icon: 'dashboard', path: '/owner/dashboard' },
        { name: 'الحجوزات', icon: 'book_online', path: '#' },
        { name: 'إدارة الملاعب', icon: 'stadium', path: '/owner/fields' },
        { name: 'الطلبات', icon: 'receipt_long', path: '#' },
        { name: 'التشغيل اليومي', icon: 'view_timeline', path: '#' },
        { name: 'البطولات', icon: 'emoji_events', path: '#' },
        { name: 'ملف الملعب', icon: 'admin_panel_settings', path: '#' }
    ];

    const kpis = [
        { label: 'إجمالي الإيرادات', icon: 'payments' },
        { label: 'نسبة إشغال الحجوزات', icon: 'query_stats' },
        { label: 'لاعبون جدد', icon: 'person_add' },
        { label: 'معدل الاستخدام', icon: 'monitoring' }
    ];

    return (
        <div className="min-h-screen bg-[#f6f8f7] font-ar flex" dir="rtl">
            {/* Right Sidebar Area */}
            <aside className="w-64 bg-white border-l border-[#e1e3e1] sticky top-0 h-screen flex-col justify-between p-4 hidden md:flex">
                {/* Brand Header */}
                <div className="space-y-1 mb-8">
                    <h1 className="text-lg font-black text-[#006b20]">لوحة المالك - تحكم الملعب</h1>
                    <p className="text-[10px] text-[#3e4a3c] font-semibold leading-relaxed">
                        عرض تشغيلي متزامن مع حالة تطبيق اللاعب
                    </p>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.name;
                        return (
                            <button
                                key={item.name}
                                onClick={() => {
                                    if (item.name === 'لوحة التحكم' || item.name === 'البطولات') {
                                        setActiveTab(item.name);
                                    } else if (item.path !== '#') {
                                        navigate(item.path);
                                    }
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors ${isActive
                                        ? 'bg-[#e8f5e9] text-[#006b20] border border-[#006b20]/20'
                                        : 'text-[#3e4a3c] hover:bg-[#f0f2f0] border border-transparent'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                <span>{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="pt-4 mt-4 border-t border-[#e1e3e1] flex items-center justify-between">
                    <div className="text-xs font-bold text-[#191c1c] bg-[#f0f2f0] px-2.5 py-1.5 rounded-md">
                        Owner Account
                    </div>
                    <button className="text-xs font-bold text-[#006b20] hover:underline px-2 py-1">
                        EN / ع
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto h-screen">
                {/* Mobile Header Menu (Optional fallback for small screens) */}
                <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-[#e1e3e1] shadow-sm">
                    <h1 className="text-sm font-black text-[#006b20]">لوحة المالك</h1>
                    <span className="material-symbols-outlined text-[#3e4a3c]">menu</span>
                </div>

                {activeTab === 'البطولات' ? (
                    <OwnerTournamentsTab />
                ) : (
                    <>
                        {/* Header view */}
                        <div className="space-y-1 text-right">
                            <h2 className="text-2xl font-black text-[#191c1c]">نظرة عامة للمالك</h2>
                            <p className="text-xs font-semibold text-[#3e4a3c]">
                                .Track bookings, revenue, field activity, and important owner actions
                            </p>
                        </div>

                        {/* Top bar actions row */}
                        <div className="bg-white p-4 rounded-2xl border border-[#e1e3e1] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Time Filters */}
                            <div className="flex bg-[#f0f2f0] rounded-xl p-1 w-full sm:w-auto">
                                {['اليوم', 'الأسبوع', 'الشهر'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveTimeFilter(filter as any)}
                                        className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTimeFilter === filter
                                                ? 'bg-white text-[#191c1c] shadow-sm'
                                                : 'text-[#3e4a3c] hover:bg-white/50'
                                            }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            {/* Date Pill */}
                            <div className="flex items-center gap-2 bg-[#e8f5e9] text-[#006b20] px-4 py-2.5 rounded-xl font-bold text-xs shrink-0">
                                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                <span>٢٤ يونيو ٢٠٢٦</span>
                            </div>
                        </div>

                        {/* Executive Performance KPIs Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {kpis.map((kpi) => (
                                <div
                                    key={kpi.label}
                                    className="bg-white p-5 rounded-2xl border border-[#e1e3e1] shadow-sm flex flex-col gap-5 group hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="w-10 h-10 rounded-full bg-[#f0f2f0] flex items-center justify-center text-[#006b20] group-hover:scale-110 transition-transform duration-300">
                                            <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
                                        </div>
                                        <span className="bg-[#e8f5e9] text-[#006b20] text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                                            Empty
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-[#191c1c]">--</h4>
                                        <p className="text-xs font-bold text-[#3e4a3c] mt-1">{kpi.label}</p>
                                    </div>
                                    <div className="pt-3 border-t border-[#f0f2f0]">
                                        <p className="text-[10px] text-[#3e4a3c]/60 font-semibold">لا توجد بيانات بعد</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Analytics Bottom Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Right Column (Takes larger width space) */}
                            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#e1e3e1] shadow-sm flex flex-col gap-4 min-h-[300px]">
                                <div>
                                    <h3 className="text-sm font-black text-[#191c1c]">اتجاهات الإيرادات</h3>
                                    <p className="text-xs text-[#3e4a3c]/70 mt-1 font-semibold">نمو الإيرادات خلال الفترة المحددة</p>
                                </div>
                                <div className="flex-1 rounded-xl border-2 border-dashed border-[#e1e3e1] flex items-center justify-center bg-[#f0f2f0]/50 transition-colors hover:bg-[#f0f2f0]/80">
                                    <div className="flex flex-col items-center gap-3 text-[#3e4a3c]/50">
                                        <span className="material-symbols-outlined text-3xl">insights</span>
                                        <p className="text-xs font-bold">لا توجد بيانات لإيرادات لهذه الفترة</p>
                                    </div>
                                </div>
                            </div>

                            {/* Left Column (Takes smaller width space) */}
                            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-[#e1e3e1] shadow-sm flex flex-col gap-4 min-h-[300px]">
                                <div>
                                    <h3 className="text-sm font-black text-[#191c1c]">ساعات الذروة</h3>
                                    <p className="text-xs text-[#3e4a3c]/70 mt-1 font-semibold">كثافة الحجوزات حسب الساعة</p>
                                </div>
                                <div className="flex-1 rounded-xl border-2 border-dashed border-[#e1e3e1] flex items-center justify-center bg-[#f0f2f0]/50 transition-colors hover:bg-[#f0f2f0]/80">
                                    <div className="flex flex-col items-center gap-3 text-[#3e4a3c]/50 text-center px-4">
                                        <span className="material-symbols-outlined text-3xl">schedule</span>
                                        <p className="text-xs font-bold leading-relaxed">
                                            لا توجد حتّى الآن حجوزات مؤكدة ومدفوعة لهذه الفترة
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
