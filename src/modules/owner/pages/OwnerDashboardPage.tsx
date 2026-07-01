import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ownerApi } from '../api/owner.api';
import type { DashboardStats } from '../api/owner.api';
import { 
    TrendingUp, Calendar, Activity, Users, 
    CheckCircle2, Clock, LayoutDashboard, CalendarDays, Settings, LogOut, FileText,
    Trophy, BadgeDollarSign
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer
} from 'recharts';

export function OwnerDashboardPage() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        ownerApi.getDashboardStats('weekly')
            .then(setStats)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    // ─── Sidebar Navigation Array ─────────────────────────────────────────────
    const navigation = [
        { name: 'لوحة البيانات', icon: LayoutDashboard, path: '/owner/dashboard' },
        { name: 'إدارة ملاعبي', icon: Activity, path: '/owner/fields' },
        { name: 'طلبات الحجز والعمليات', icon: CalendarDays, path: '/owner/bookings' },
        { name: 'البطولات', icon: Trophy, path: '/owner/tournaments' },
        { name: 'مدفوعات البطولات', icon: BadgeDollarSign, path: '/owner/tournaments/payments' },
        { name: 'التقارير', icon: FileText, path: '/owner/reports' },
        { name: 'الإعدادات', icon: Settings, path: '/owner/settings' },
    ];

    // ─── Status Badge Helper ──────────────────────────────────────────────────
    const renderStatusBadge = (status: string) => {
        if (status === 'PaymentSubmitted') {
            return (
                <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-2.5 py-1 rounded-md flex items-center gap-1.5 whitespace-nowrap border border-amber-200">
                    تم تقديم الدفع (فودافون كاش)
                </span>
            );
        }
        if (status === 'Confirmed' || status === 'Approved') {
            return (
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-1 rounded-md flex items-center gap-1.5 whitespace-nowrap border border-emerald-200">
                    مؤكد
                </span>
            );
        }
        return (
            <span className="bg-slate-100 text-slate-700 text-[11px] font-black px-2.5 py-1 rounded-md flex items-center gap-1.5 whitespace-nowrap border border-slate-200">
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans flex" dir="rtl">
            
            {/* ── Right-Side Navigation Sidebar ── */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <span className="text-indigo-400">Hagzaya</span> Owner
                    </h2>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-indigo-600 text-white font-bold shadow-md' 
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                                }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                                <span>{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-semibold transition-all">
                        <LogOut size={20} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content Area ── */}
            <main className="flex-1 overflow-x-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-6">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">لوحة البيانات التحليلية</h1>
                    <p className="text-sm font-medium text-slate-500 mt-2">
                        نظرة شاملة على أداء ملاعبك، الإيرادات، والحجوزات القادمة.
                    </p>
                </header>

                <div className="p-8">
                    {isLoading ? (
                        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200" />)}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 h-[400px] bg-white rounded-2xl border border-slate-200" />
                                <div className="h-[400px] bg-white rounded-2xl border border-slate-200" />
                            </div>
                        </div>
                    ) : !stats ? (
                        <div className="text-center py-20 text-slate-500 font-bold">فشل جلب البيانات</div>
                    ) : (
                        <div className="max-w-7xl mx-auto space-y-8">
                            
                            {/* ── Key Metrics ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                            <TrendingUp size={24} />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-2xl font-black text-slate-900">{stats.totalRevenue?.toLocaleString() || 0} <span className="text-sm text-slate-500 font-bold">ج.م</span></h3>
                                        <p className="text-sm font-bold text-slate-500 mt-1">إجمالي الإيرادات</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                            <Calendar size={24} />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-2xl font-black text-slate-900">{stats.totalBookings || 0}</h3>
                                        <p className="text-sm font-bold text-slate-500 mt-1">الحجوزات المكتملة</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                            <Activity size={24} />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-2xl font-black text-slate-900">{stats.utilizationRate || 0}%</h3>
                                        <p className="text-sm font-bold text-slate-500 mt-1">معدل إشغال الملاعب</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            <Users size={24} />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-2xl font-black text-slate-900">{stats.totalPlayers || 0}</h3>
                                        <p className="text-sm font-bold text-slate-500 mt-1">إجمالي اللاعبين المسجلين</p>
                                    </div>
                                </div>
                            </div>

                            {/* ── Charts & Upcoming ── */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                
                                {/* Revenue Trend Area Chart */}
                                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h2 className="text-lg font-black text-slate-900 mb-6">مؤشر الإيرادات الأسبوعي</h2>
                                    <div className="h-[320px] w-full" dir="ltr">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.revenueTrend || []} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis 
                                                    dataKey="day" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 12, fill: '#64748b' }} 
                                                    dy={10} 
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 12, fill: '#64748b' }} 
                                                    dx={-10}
                                                    tickFormatter={(value) => `${value}ج`}
                                                />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                                    labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="revenue" 
                                                    name="الإيرادات"
                                                    stroke="#4f46e5" 
                                                    strokeWidth={3}
                                                    fillOpacity={1} 
                                                    fill="url(#colorRevenue)" 
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Upcoming Bookings Widget */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[400px]">
                                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                        <h2 className="text-lg font-black text-slate-900">الحجوزات القادمة</h2>
                                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-lg">
                                            {stats.upcomingBookings?.length || 0} حجوزات
                                        </span>
                                    </div>

                                    <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[400px]">
                                        {stats.upcomingBookings && stats.upcomingBookings.length > 0 ? (
                                            stats.upcomingBookings.map((booking, idx) => (
                                                <div key={idx} className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all shadow-sm">
                                                    
                                                    {/* Header: Name and Status */}
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h4 className="text-sm font-black text-slate-900">{booking.playerName}</h4>
                                                            <p className="text-[11px] font-bold text-indigo-600 mt-1">{booking.fieldName}</p>
                                                        </div>
                                                        {renderStatusBadge(booking.status)}
                                                    </div>

                                                    {/* Details Footer */}
                                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                                                            <Calendar size={13} className="text-slate-400" />
                                                            {booking.date}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                                                            <Clock size={13} className="text-slate-400" />
                                                            {booking.timeRange}
                                                        </div>
                                                    </div>

                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-12">
                                                <CheckCircle2 size={32} className="text-slate-400 mb-2" />
                                                <p className="text-sm font-bold text-slate-600">لا توجد حجوزات قادمة قريباً</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
