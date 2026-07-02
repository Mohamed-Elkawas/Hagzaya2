import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tournamentsApi } from '../api/api';
import type { Tournament } from '../types/tournament';
import { TournamentStatus } from '../types/tournament';
import { toast } from 'sonner';
import {
    Activity, LayoutDashboard, CalendarDays, Trophy, FileText, Settings, LogOut, CheckCircle2, ChevronLeft, Plus, Clock, Users, ArrowUpRight, ArrowDownRight, BadgeDollarSign, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../../core/context/LanguageContext';

export function OwnerTournamentsTab() {
    const { t } = useLanguage();
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
        if (!window.confirm(t('owner.tournaments.delete.confirm'))) return;
        setDeletingIds(prev => [...prev, id]);
        try {
            await tournamentsApi.delete(id);
            setTournaments(prev => prev.filter(t => t.id !== id));
            toast.success(t('owner.tournaments.delete.success'));
        } catch (err) {
            toast.error(t('owner.tournaments.delete.error'));
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
        { label: t('owner.tournaments.kpi.total'), value: totalTournaments, icon: Trophy },
        { label: t('owner.tournaments.kpi.active'), value: activeTournaments, icon: Activity },
        { label: t('owner.tournaments.kpi.teams'), value: totalTeams, icon: CalendarDays },
        { label: t('owner.tournaments.kpi.revenue'), value: `${expectedRevenue} ${t('currency.egp')}`, icon: BadgeDollarSign },
    ];

    const getStatusBadge = (status: TournamentStatus) => {
        switch (status) {
            case TournamentStatus.Upcoming:
                return <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-1 rounded-full font-bold border border-emerald-200">{t('owner.tournaments.status.upcoming')}</span>;
            case TournamentStatus.Ongoing:
                return <span className="bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded-full font-bold border border-red-200 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> {t('owner.tournaments.status.ongoing')}</span>;
            case TournamentStatus.Finished:
                return <span className="bg-slate-50 text-slate-600 text-[10px] px-2 py-1 rounded-full font-bold border border-slate-200">{t('owner.tournaments.status.finished')}</span>;
            default:
                return <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-1 rounded-full font-bold border border-amber-200">{status}</span>;
        }
    };


    return (
        <div className="bg-slate-50 font-sans p-4 md:p-8">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 rounded-2xl mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-indigo-600" />
                                {t('owner.tournaments.title')}
                            </h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                {t('owner.tournaments.subtitle')}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/tournaments/create')}
                            className="shrink-0 bg-primary hover:bg-primary/90 text-white px-5 h-11 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                        >
                            <Plus size={16} />
                            <span>{t('owner.tournaments.createNew')}</span>
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
                            <h3 className="text-sm font-black text-slate-900">{t('owner.tournaments.current')}</h3>
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
                                <p className="text-sm font-bold text-slate-900">{t('owner.tournaments.empty.title')}</p>
                                <p className="text-xs mt-1">{t('owner.tournaments.empty.subtitle2')}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-right border-collapse text-xs font-medium text-slate-900 whitespace-nowrap">
                                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="p-4">{t('owner.tournaments.col.name')}</th>
                                            <th className="p-4">{t('owner.tournaments.col.type')}</th>
                                            <th className="p-4">{t('owner.tournaments.col.teamsInfo')}</th>
                                            <th className="p-4">{t('owner.tournaments.col.startDate')}</th>
                                            <th className="p-4">{t('owner.tournaments.col.status')}</th>
                                            <th className="p-4 text-center">{t('owner.tournaments.col.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {tournaments.map((tournament) => (
                                            <tr key={tournament.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold text-sm text-primary">{tournament.name}</div>
                                                    <div className="text-[10px] text-slate-500 mt-0.5 max-w-50 truncate">{tournament.description}</div>
                                                </td>
                                                <td className="p-4 font-semibold">{tournament.type}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-full max-w-20 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
                                                            <div
                                                                className="h-full bg-primary rounded-full"
                                                                style={{ width: `${(tournament.registeredTeamsCount / tournament.numberOfTeams) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-bold">{tournament.registeredTeamsCount}/{tournament.numberOfTeams}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-semibold">{new Date(tournament.startDate).toLocaleDateString('ar-EG')}</td>
                                                <td className="p-4">{getStatusBadge(tournament.status)}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/tournaments/${tournament.id}`)}
                                                            className="px-3 py-1.5 text-[11px] font-bold border border-slate-200 rounded-lg hover:border-primary hover:text-primary bg-white transition-colors flex items-center gap-1"
                                                        >
                                                            <FileText size={14} />
                                                            {t('owner.tournaments.action.manage')}
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/tournaments/edit/${tournament.id}`)}
                                                            className="px-3 py-1.5 text-[11px] font-bold border border-slate-200 rounded-lg hover:border-primary hover:text-primary bg-white transition-colors flex items-center gap-1"
                                                        >
                                                            <Settings size={14} />
                                                            {t('owner.tournaments.action.edit')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(tournament.id)}
                                                            disabled={deletingIds.includes(tournament.id)}
                                                            className="px-3 py-1.5 text-[11px] font-bold border border-transparent bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                                                        >
                                                            {deletingIds.includes(tournament.id) ? (
                                                                <RefreshCw size={14} className="animate-spin" />
                                                            ) : (
                                                                <LogOut size={14} className="rotate-180" />
                                                            )}
                                                            {t('owner.tournaments.action.delete')}
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