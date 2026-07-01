import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tournamentsApi } from '../api/api';
import type { Tournament } from '../types/tournament';
import { TournamentStatus } from '../types/tournament';
import { toast } from 'sonner';
import {
    LayoutDashboard, Activity, CalendarDays, Trophy,
    BadgeDollarSign, FileText, Settings, LogOut, Plus, RefreshCw
} from 'lucide-react';

export function OwnerTournamentsTab() {
    const navigate = useNavigate();
    const location = useLocation();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingIds, setDeletingIds] = useState<string[]>([]);

    const fetchTournaments = async () => {
        setIsLoading(true);
        try {
            const data = await tournamentsApi.getAll();
            const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
            setTournaments(list);
        } catch (err) {
            setTournaments(MOCK_OWNER_TOURNAMENTS);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه البطولة نهائياً؟')) return;
        setDeletingIds(prev => [...prev, id]);
        try {
            await tournamentsApi.delete(id);
            setTournaments(prev => prev.filter(t => t.id !== id));
            toast.success('تم حذف البطولة بنجاح');
        } catch (err) {
            toast.error('فشل حذف البطولة. تأكد من صلاحياتك كمسؤول.');
        } finally {
            setDeletingIds(prev => prev.filter(delId => delId !== id));
        }
    };

    // Calculate KPIs
    const totalTournaments = tournaments.length;
    const activeTournaments = tournaments.filter(t => t.status === TournamentStatus.Ongoing || t.status === TournamentStatus.Upcoming).length;
    const totalTeams = tournaments.reduce((acc, t) => acc + t.registeredTeamsCount, 0);
    const expectedRevenue = tournaments.reduce((acc, t) => acc + (t.registeredTeamsCount * t.price), 0);

    const kpis = [
        { label: 'إجمالي البطولات', value: totalTournaments, icon: Trophy },
        { label: 'بطولات نشطة', value: activeTournaments, icon: Activity },
        { label: 'الفرق المسجلة', value: totalTeams, icon: CalendarDays },
        { label: 'إجمالي الإيرادات المتوقعة', value: `${expectedRevenue} ج.م`, icon: BadgeDollarSign },
    ];

    const getStatusBadge = (status: TournamentStatus) => {
        switch (status) {
            case TournamentStatus.Upcoming:
                return <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-1 rounded-full font-bold border border-emerald-200">متاحة للتسجيل</span>;
            case TournamentStatus.Ongoing:
                return <span className="bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded-full font-bold border border-red-200 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> جارية</span>;
            case TournamentStatus.Finished:
                return <span className="bg-slate-50 text-slate-600 text-[10px] px-2 py-1 rounded-full font-bold border border-slate-200">منتهية</span>;
            default:
                return <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-1 rounded-full font-bold border border-amber-200">{status}</span>;
        }
    };

    const navigation = [
        { name: 'لوحة البيانات', icon: LayoutDashboard, path: '/owner/dashboard' },
        { name: 'إدارة ملاعبي', icon: Activity, path: '/owner/fields' },
        { name: 'طلبات الحجز', icon: CalendarDays, path: '/owner/bookings' },
        { name: 'البطولات', icon: Trophy, path: '/owner/tournaments' },
        { name: 'مدفوعات البطولات', icon: BadgeDollarSign, path: '/owner/tournaments/payments' },
        { name: 'التقارير', icon: FileText, path: '/owner/reports' },
        { name: 'الإعدادات', icon: Settings, path: '/owner/settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex" dir="rtl">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <span className="text-indigo-400">Hagzaya</span> Owner
                    </h2>
                </div>
                <nav className="flex-1 p-4 space-y-1 mt-4">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                                    isActive
                                        ? 'bg-indigo-600 text-white font-bold shadow-md'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                                }`}
                            >
                                <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                                <span>{item.name}</span>
                            </button>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => { localStorage.removeItem('hagzaya_token'); navigate('/login'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-semibold transition-all text-sm"
                    >
                        <LogOut size={18} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden">
                <header className="bg-white border-b border-slate-200 px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-indigo-600" />
                                إدارة البطولات
                            </h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                نظم وأدر بطولات ملعبك، تتبع التسجيلات، وأدِر المباريات من مكان واحد
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/tournaments/create')}
                            className="shrink-0 bg-primary hover:bg-primary/90 text-white px-5 h-11 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                        >
                            <Plus size={16} />
                            <span>إنشاء بطولة جديدة</span>
                        </button>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    {/* KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {kpis.map((kpi) => (
                            <div
                                key={kpi.label}
                                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 group hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                        <kpi.icon size={20} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900">{kpi.value}</h4>
                                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">{kpi.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tournaments Data Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-black text-slate-900">البطولات الحالية</h3>
                            <button onClick={fetchTournaments} className="text-slate-500 hover:text-primary transition-colors p-1">
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="p-12 flex justify-center">
                                <RefreshCw size={24} className="animate-spin text-primary" />
                            </div>
                        ) : tournaments.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-500">
                                    <Trophy size={28} />
                                </div>
                                <p className="text-sm font-bold text-slate-900">لا توجد بطولات بعد</p>
                                <p className="text-xs mt-1">قم بإنشاء بطولتك الأولى لجذب فرق جديدة لملعبك.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-right border-collapse text-xs font-medium text-slate-900 whitespace-nowrap">
                                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="p-4">اسم البطولة</th>
                                            <th className="p-4">النوع</th>
                                            <th className="p-4">الفرق (مسجل/متاح)</th>
                                            <th className="p-4">تاريخ البداية</th>
                                            <th className="p-4">الحالة</th>
                                            <th className="p-4 text-center">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {tournaments.map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold text-sm text-primary">{t.name}</div>
                                                    <div className="text-[10px] text-slate-500 mt-0.5 max-w-50 truncate">{t.description}</div>
                                                </td>
                                                <td className="p-4 font-semibold">{t.type}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-full max-w-20 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
                                                            <div
                                                                className="h-full bg-primary rounded-full"
                                                                style={{ width: `${(t.registeredTeamsCount / t.numberOfTeams) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-bold">{t.registeredTeamsCount}/{t.numberOfTeams}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-semibold">{new Date(t.startDate).toLocaleDateString('ar-EG')}</td>
                                                <td className="p-4">{getStatusBadge(t.status)}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/tournaments/${t.id}`)}
                                                            className="px-3 py-1.5 text-[11px] font-bold border border-slate-200 rounded-lg hover:border-primary hover:text-primary bg-white transition-colors flex items-center gap-1"
                                                        >
                                                            <FileText size={14} />
                                                            إدارة
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/tournaments/edit/${t.id}`)}
                                                            className="px-3 py-1.5 text-[11px] font-bold border border-slate-200 rounded-lg hover:border-primary hover:text-primary bg-white transition-colors flex items-center gap-1"
                                                        >
                                                            <Settings size={14} />
                                                            تعديل
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(t.id)}
                                                            disabled={deletingIds.includes(t.id)}
                                                            className="px-3 py-1.5 text-[11px] font-bold border border-transparent bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                                                        >
                                                            {deletingIds.includes(t.id) ? (
                                                                <RefreshCw size={14} className="animate-spin" />
                                                            ) : (
                                                                <LogOut size={14} className="rotate-180" />
                                                            )}
                                                            حذف
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// ── Mock Fallback Data ────────────────────────────────────────────────────────
const MOCK_OWNER_TOURNAMENTS: Tournament[] = [
    {
        id: '1',
        name: 'كأس الربيع الودي',
        numberOfTeams: 16,
        prize: 'EGP 10,000',
        description: 'بطولة خماسية لجميع الأعمار.',
        price: 400,
        type: 'FiveASide',
        startDate: '2026-04-10T18:00:00',
        endDate: '2026-04-20T22:00:00',
        fieldId: 'f1',
        status: TournamentStatus.Ongoing,
        registeredTeamsCount: 16,
        ownerId: 'o1',
    },
    {
        id: '2',
        name: 'دوري أبطال حجززايا',
        numberOfTeams: 32,
        prize: 'EGP 50,000',
        description: 'أكبر دوري رمضاني على مستوى المنطقة.',
        price: 1000,
        type: 'ElevenASide',
        startDate: '2026-08-01T19:00:00',
        endDate: '2026-08-30T23:00:00',
        fieldId: 'f1',
        status: TournamentStatus.Upcoming,
        registeredTeamsCount: 12,
        ownerId: 'o1',
    }
];