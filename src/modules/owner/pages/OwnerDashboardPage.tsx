import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ownerApi } from '../api/owner.api';
import type { DashboardStats } from '../api/owner.api';
import { TrendingUp, Activity, Clock, ArrowDownRight, Calendar, Users, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../core/context/LanguageContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

export function OwnerDashboardPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        ownerApi.getDashboardStats('weekly')
            .then(setStats)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

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
        <div className="p-4 md:p-8">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 rounded-2xl mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('owner.dashboard.title')}</h1>
                <p className="text-sm font-medium text-slate-500 mt-2">
                    {t('owner.dashboard.subtitle')}
                </p>
            </header>

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
                <div className="text-center py-20 text-slate-500 font-bold">{t('owner.dashboard.error.fetch')}</div>
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
                                <h3 className="text-2xl font-black text-slate-900">{stats.totalRevenue?.toLocaleString() || 0} <span className="text-sm text-slate-500 font-bold">{t('owner.dashboard.metrics.currency')}</span></h3>
                                <p className="text-sm font-bold text-slate-500 mt-1">{t('owner.dashboard.metrics.totalRevenue')}</p>
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
                                <p className="text-sm font-bold text-slate-500 mt-1">{t('owner.dashboard.metrics.completedBookings')}</p>
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
                                <p className="text-sm font-bold text-slate-500 mt-1">{t('owner.dashboard.metrics.fieldOccupancyRate')}</p>
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
                                <p className="text-sm font-bold text-slate-500 mt-1">{t('owner.dashboard.metrics.totalPlayers')}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Charts & Upcoming ── */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* Revenue Trend Area Chart */}
                        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-black text-slate-900 mb-6">{t('owner.dashboard.charts.weeklyRevenue')}</h2>
                            <div className="h-[320px] w-full" dir="ltr">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.revenueTrend || []} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
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
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-black text-slate-900">{t('owner.dashboard.tables.upcomingBookings')}</h2>
                                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                                    {t('owner.dashboard.tables.viewAll')}
                                    <ArrowDownRight size={16} />
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{t('owner.dashboard.tables.player')}</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{t('owner.dashboard.tables.field')}</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{t('owner.dashboard.tables.time')}</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{t('owner.dashboard.tables.status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {stats.upcomingBookings && stats.upcomingBookings.length > 0 ? (
                                            stats.upcomingBookings.map((booking, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-4 font-bold text-slate-900">{booking.playerName}</td>
                                                    <td className="px-4 py-4 font-bold text-indigo-600">{booking.fieldName}</td>
                                                    <td className="px-4 py-4 font-bold text-slate-600">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={13} className="text-slate-400" />
                                                            {booking.timeRange}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">{renderStatusBadge(booking.status)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4}>
                                                    <div className="flex flex-col items-center justify-center text-center opacity-60 py-12">
                                                        <CheckCircle2 size={32} className="text-slate-400 mb-2" />
                                                        <p className="text-sm font-bold text-slate-600">لا توجد حجوزات قادمة قريباً</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
