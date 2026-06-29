// ─────────────────────────────────────────────────────────────────────────────
// TournamentExplore — Grid catalog with search, status tabs, and Create button
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Trophy,
  RefreshCw,
  ChevronDown,
  Sliders,
  UserCog,
} from 'lucide-react';
import { TournamentCard } from '../components/TournamentCard';
import { tournamentsApi } from '../api/api';
import { useTournamentState } from '../hooks/useTournamentState';
import type { Tournament } from '../types/tournament';
import { TournamentStatus, UserRole } from '../types/tournament';

// ── Status Tab Config ──────────────────────────────────────────────────────

const STATUS_TABS: { value: TournamentStatus | 'All'; label: string }[] = [
  { value: 'All', label: 'الكل' },
  { value: TournamentStatus.Upcoming, label: 'قادمة' },
  { value: TournamentStatus.Ongoing, label: 'جارية 🔴' },
  { value: TournamentStatus.Finished, label: 'منتهية' },
  { value: TournamentStatus.Cancelled, label: 'ملغية' },
];

// ── Skeleton Card ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#e1e3e1] shadow-sm overflow-hidden animate-pulse">
      <div className="h-28 bg-[#e8ede9]" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-5 w-20 bg-[#f0f2f0] rounded-full" />
          <div className="h-5 w-16 bg-[#f0f2f0] rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-14 bg-[#f0f2f0] rounded-xl" />
          <div className="h-14 bg-[#f0f2f0] rounded-xl" />
        </div>
        <div className="h-2 bg-[#f0f2f0] rounded-full" />
        <div className="h-10 bg-[#f0f2f0] rounded-xl" />
      </div>
    </div>
  );
}

// ── Role Switcher (Simulation Only) ───────────────────────────────────────

function RoleSwitcher() {
  const { currentRole, setRole } = useTournamentState();
  const roles: { value: UserRole; label: string }[] = [
    { value: UserRole.Player, label: 'لاعب' },
    { value: UserRole.Owner, label: 'مالك' },
    { value: UserRole.Admin, label: 'مسؤول' },
  ];
  return (
    <div className="flex items-center gap-2 bg-[#f6f8f7] border border-[#e1e3e1] rounded-xl px-2 py-1">
      <UserCog className="w-3.5 h-3.5 text-[#3e4a3c]/60" />
      <span className="text-[10px] text-[#3e4a3c]/60 font-medium">محاكاة الدور:</span>
      <div className="flex gap-1">
        {roles.map((r) => (
          <button
            key={r.value}
            onClick={() => setRole(r.value)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
              currentRole === r.value
                ? 'bg-[#006b20] text-white'
                : 'text-[#3e4a3c] hover:bg-[#e1e3e1]'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export function TournamentExplore() {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentRole,
  } = useTournamentState();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const canCreate = currentRole === UserRole.Owner || currentRole === UserRole.Admin;

  const fetchTournaments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tournamentsApi.getAll({
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: searchQuery || undefined,
        limit: 24,
      });
      const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
      setTournaments(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تحميل البطولات');
      setTournaments(MOCK_TOURNAMENTS); // Fallback to mock data
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchTournaments, searchQuery ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchTournaments, searchQuery]);

  // Client-side filter as additional safety net
  const filtered = tournaments.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f6f8f7] pb-16" dir="rtl">
      {/* ── HERO HEADER ── */}
      <div className="bg-gradient-to-br from-[#002b0e] via-[#006b20] to-[#00a336] pt-12 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white text-xs font-bold">
            <Trophy className="w-3.5 h-3.5" />
            حجززايا — منصة البطولات الرياضية
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
            استكشف البطولات
          </h1>
          <p className="text-white/70 text-sm max-w-sm mx-auto">
            انضم لأفضل البطولات الرياضية في مصر وأثبت مهارتك
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-2 flex items-center gap-2 shadow-2xl max-w-xl mx-auto mt-6">
            <Search className="w-4 h-4 text-[#3e4a3c]/50 ms-2 shrink-0" />
            <input
              type="text"
              placeholder="ابحث عن بطولة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium text-[#191c1c] placeholder-[#3e4a3c]/40 outline-none border-none py-2"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#3e4a3c]/50 hover:text-[#3e4a3c] transition-colors text-xs font-bold px-2"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-4 -mt-12 space-y-6">
        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-[#e1e3e1] shadow-sm p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 flex-1 min-w-0">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                  statusFilter === tab.value
                    ? 'bg-[#006b20] text-white shadow'
                    : 'text-[#3e4a3c] hover:bg-[#f0f2f0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <RoleSwitcher />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs font-bold text-[#3e4a3c] border border-[#e1e3e1] px-3 py-1.5 rounded-xl flex items-center gap-1.5 hover:bg-[#f0f2f0] transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              فلاتر
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {canCreate && (
              <button
                onClick={() => navigate('/tournaments/create')}
                className="text-xs font-black text-white bg-[#006b20] hover:bg-[#005318] px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                إنشاء بطولة
              </button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-[#191c1c]">
              {isLoading ? 'جار التحميل...' : `${filtered.length} بطولة`}
            </h2>
            {statusFilter !== 'All' && (
              <p className="text-xs text-[#3e4a3c]/70 mt-0.5">
                تصفية: {STATUS_TABS.find((t) => t.value === statusFilter)?.label}
              </p>
            )}
          </div>
          <button
            onClick={fetchTournaments}
            className="flex items-center gap-1.5 text-xs font-bold text-[#3e4a3c] hover:text-[#006b20] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            تحديث
          </button>
        </div>

        {/* Error */}
        {error && !isLoading && tournaments.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-bold text-red-600">⚠️ {error}</p>
            <p className="text-xs text-red-500 mt-1">عرض بيانات تجريبية</p>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 bg-[#f0f2f0] rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-[#3e4a3c]/30" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191c1c]">لا توجد بطولات</h3>
              <p className="text-sm text-[#3e4a3c]/60 mt-1">
                {searchQuery
                  ? `لا نتائج لـ "${searchQuery}"`
                  : 'لا توجد بطولات بهذا الفلتر حالياً'}
              </p>
            </div>
            {canCreate && (
              <button
                onClick={() => navigate('/tournaments/create')}
                className="text-sm font-bold text-white bg-[#006b20] hover:bg-[#005318] px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                إنشاء أول بطولة
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mock Data (fallback when API is unavailable) ───────────────────────────

const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: '1',
    name: 'October Weekend League',
    numberOfTeams: 16,
    prize: 'EGP 15,000',
    description: 'بطولة كروية ضخمة لأفضل 16 فريق في القاهرة',
    price: 500,
    type: 'FiveASide',
    startDate: '2026-07-10T09:00:00',
    endDate: '2026-07-25T21:00:00',
    fieldId: 'f1',
    status: TournamentStatus.Upcoming,
    registeredTeamsCount: 8,
    ownerId: 'o1',
  },
  {
    id: '2',
    name: 'Hagzaya Summer Cup',
    numberOfTeams: 8,
    prize: 'EGP 8,000',
    description: 'كأس الصيف الأول من حجززايا',
    price: 300,
    type: 'SevenASide',
    startDate: '2026-07-01T10:00:00',
    endDate: '2026-07-15T18:00:00',
    fieldId: 'f2',
    status: TournamentStatus.Ongoing,
    registeredTeamsCount: 8,
    ownerId: 'o2',
  },
  {
    id: '3',
    name: 'Champions League Egypt',
    numberOfTeams: 32,
    prize: 'EGP 50,000',
    description: 'أكبر بطولة في مصر — 32 فريق',
    price: 1000,
    type: 'ElevenASide',
    startDate: '2026-08-01T09:00:00',
    endDate: '2026-09-30T21:00:00',
    fieldId: 'f3',
    status: TournamentStatus.Upcoming,
    registeredTeamsCount: 12,
    ownerId: 'o1',
  },
  {
    id: '4',
    name: 'Ramadan Champions 2026',
    numberOfTeams: 16,
    prize: 'EGP 20,000',
    description: 'بطولة رمضان الكبرى',
    price: 600,
    type: 'FiveASide',
    startDate: '2026-03-01T17:00:00',
    endDate: '2026-03-30T22:00:00',
    fieldId: 'f4',
    status: TournamentStatus.Finished,
    registeredTeamsCount: 16,
    ownerId: 'o3',
  },
];
