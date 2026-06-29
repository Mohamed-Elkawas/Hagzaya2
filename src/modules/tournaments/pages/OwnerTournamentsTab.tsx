import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentsApi } from '../api/api';
import type { Tournament } from '../types/tournament';
import { TournamentStatus } from '../types/tournament';
import { toast } from 'sonner';

export function OwnerTournamentsTab() {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTournaments = async () => {
        setIsLoading(true);
        try {
            // In a real app, this might be a specific endpoint for the owner
            // For now we get all and assume they belong to the current authenticated owner
            const data = await tournamentsApi.getAll();
            const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
            setTournaments(list);
        } catch (err) {
            // Mock data fallback if API fails
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
        try {
            await tournamentsApi.delete(id);
            setTournaments(prev => prev.filter(t => t.id !== id));
            toast.success('تم حذف البطولة بنجاح');
        } catch (err) {
            toast.error('فشل حذف البطولة. تأكد من صلاحياتك كمسؤول.');
        }
    };

    // Calculate KPIs
    const totalTournaments = tournaments.length;
    const activeTournaments = tournaments.filter(t => t.status === TournamentStatus.Ongoing || t.status === TournamentStatus.Upcoming).length;
    const totalTeams = tournaments.reduce((acc, t) => acc + t.registeredTeamsCount, 0);
    const expectedRevenue = tournaments.reduce((acc, t) => acc + (t.registeredTeamsCount * t.price), 0);

    const kpis = [
        { label: 'إجمالي البطولات', value: totalTournaments, icon: 'emoji_events' },
        { label: 'بطولات نشطة', value: activeTournaments, icon: 'motion_photos_on' },
        { label: 'الفرق المسجلة', value: totalTeams, icon: 'groups' },
        { label: 'إجمالي الإيرادات المتوقعة', value: `${expectedRevenue} ج.م`, icon: 'payments' },
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-[#191c1c]">إدارة البطولات</h2>
                    <p className="text-xs font-semibold text-[#3e4a3c]">
                        نظم وأدر بطولات ملعبك، تتبع التسجيلات، وأدر المباريات من مكان واحد
                    </p>
                </div>
                <button
                    onClick={() => navigate('/tournaments/create')}
                    className="shrink-0 bg-[#006b20] hover:bg-[#005318] text-white px-5 h-11 rounded-xl text-xs font-bold flex items-center space-x-1.5 space-x-reverse transition-all shadow-sm active:scale-[0.98]"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>إنشاء بطولة جديدة</span>
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className="bg-white p-4 rounded-2xl border border-[#e1e3e1] shadow-sm flex flex-col gap-3 group hover:shadow-md transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-full bg-[#e8f5e9] flex items-center justify-center text-[#006b20] group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-[#191c1c]">{kpi.value}</h4>
                            <p className="text-[11px] font-bold text-[#3e4a3c] mt-0.5">{kpi.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tournaments Data Table */}
            <div className="bg-white rounded-2xl border border-[#e1e3e1] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#e1e3e1] flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-sm font-black text-[#191c1c]">البطولات الحالية</h3>
                    <button onClick={fetchTournaments} className="text-[#3e4a3c] hover:text-[#006b20] transition-colors p-1">
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <span className="material-symbols-outlined animate-spin text-3xl text-[#006b20]">progress_activity</span>
                    </div>
                ) : tournaments.length === 0 ? (
                    <div className="p-12 text-center text-[#3e4a3c]/60 flex flex-col items-center">
                        <div className="w-16 h-16 bg-[#f0f2f0] rounded-full flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-3xl">emoji_events</span>
                        </div>
                        <p className="text-sm font-bold text-[#191c1c]">لا توجد بطولات بعد</p>
                        <p className="text-xs mt-1">قم بإنشاء بطولتك الأولى لجذب فرق جديدة لملعبك.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse text-xs font-medium text-[#191c1c] whitespace-nowrap">
                            <thead className="bg-[#f0f2f0]/60 text-[#3e4a3c] font-bold border-b border-[#e1e3e1]">
                                <tr>
                                    <th className="p-4">اسم البطولة</th>
                                    <th className="p-4">النوع</th>
                                    <th className="p-4">الفرق (مسجل/متاح)</th>
                                    <th className="p-4">تاريخ البداية</th>
                                    <th className="p-4">الحالة</th>
                                    <th className="p-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f0f2f0]">
                                {tournaments.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-sm text-[#006b20]">{t.name}</div>
                                            <div className="text-[10px] text-[#3e4a3c]/70 mt-0.5 max-w-[200px] truncate">{t.description}</div>
                                        </td>
                                        <td className="p-4 font-semibold">{t.type}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-full max-w-[80px] bg-[#e8ede9] h-2 rounded-full overflow-hidden shrink-0">
                                                    <div
                                                        className="h-full bg-[#006b20] rounded-full"
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
                                                    className="px-3 py-1.5 text-[11px] font-bold border border-[#e1e3e1] rounded-lg hover:border-[#006b20] hover:text-[#006b20] bg-white transition-colors flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">view_list</span>
                                                    إدارة
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/tournaments/edit/${t.id}`)}
                                                    className="px-3 py-1.5 text-[11px] font-bold border border-[#e1e3e1] rounded-lg hover:border-[#006b20] hover:text-[#006b20] bg-white transition-colors flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                                    تعديل
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(t.id)}
                                                    className="px-3 py-1.5 text-[11px] font-bold border border-transparent bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">delete</span>
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
