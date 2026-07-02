// ─────────────────────────────────────────────────────────────────────────────
// TournamentExplore — Grid catalog with search, status tabs, and Create button
// Fully bilingual (Arabic / English) via useLanguage
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
import { useLanguage } from '../../../core/context/LanguageContext';

// ── Bilingual Dictionary ───────────────────────────────────────────────────────
const DICT = {
  heroBadge:    { ar: 'حجززايا — منصة البطولات الرياضية', en: 'Hagzaya — Sports Tournaments Platform' },
  heroTitle:    { ar: 'استكشف البطولات',                  en: 'Explore Tournaments' },
  heroSub:      { ar: 'انضم لأفضل البطولات الرياضية في مصر وأثبت مهارتك', en: 'Join the best sports tournaments in Egypt and prove your skills' },
  searchPlaceholder: { ar: 'ابحث عن بطولة...',           en: 'Search for a tournament...' },
  filters:      { ar: 'فلاتر',       en: 'Filters' },
  create:       { ar: 'إنشاء بطولة', en: 'Create Tournament' },
  roleSimulate: { ar: 'محاكاة الدور:', en: 'Simulate role:' },
  rolePlayer:   { ar: 'لاعب',  en: 'Player' },
  roleOwner:    { ar: 'مالك',  en: 'Owner' },
  roleAdmin:    { ar: 'مسؤول', en: 'Admin' },
  loading:      { ar: 'جار التحميل...',  en: 'Loading...' },
  countSuffix:  { ar: 'بطولة',          en: 'tournament(s)' },
  filterLabel:  { ar: 'تصفية:',         en: 'Filter:' },
  refresh:      { ar: 'تحديث',          en: 'Refresh' },
  errorFallback:{ ar: 'عرض بيانات تجريبية', en: 'Showing mock data' },
  noTournaments:{ ar: 'لا توجد بطولات',     en: 'No Tournaments Found' },
  noResults:    { ar: 'لا نتائج لـ',        en: 'No results for' },
  noFilter:     { ar: 'لا توجد بطولات بهذا الفلتر حالياً', en: 'No tournaments match this filter.' },
  createFirst:  { ar: 'إنشاء أول بطولة',   en: 'Create First Tournament' },
  tabAll:       { ar: 'الكل',     en: 'All' },
  tabUpcoming:  { ar: 'قادمة',    en: 'Upcoming' },
  tabOngoing:   { ar: 'جارية 🔴', en: 'Ongoing 🔴' },
  tabFinished:  { ar: 'منتهية',   en: 'Finished' },
  tabCancelled: { ar: 'ملغية',    en: 'Cancelled' },
} as const;

// ── Skeleton Card ──────────────────────────────────────────────────────────────
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

// ── Role Switcher ──────────────────────────────────────────────────────────────
function RoleSwitcher({ lang }: { lang: 'ar' | 'en' }) {
  const { currentRole, setRole } = useTournamentState();
  const d = (key: keyof typeof DICT) => DICT[key][lang];

  const roles: { value: UserRole; label: string }[] = [
    { value: UserRole.Player, label: d('rolePlayer') },
    { value: UserRole.Owner,  label: d('roleOwner') },
    { value: UserRole.Admin,  label: d('roleAdmin') },
  ];
  return (
    <div className="flex items-center gap-2 bg-[#f6f8f7] border border-[#e1e3e1] rounded-xl px-2 py-1">
      <UserCog className="w-3.5 h-3.5 text-on-surface-variant/60" />
      <span className="text-[10px] text-on-surface-variant/60 font-medium">{d('roleSimulate')}</span>
      <div className="flex gap-1">
        {roles.map((r) => (
          <button
            key={r.value}
            onClick={() => setRole(r.value)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
              currentRole === r.value
                ? 'bg-primary text-white'
                : 'text-on-surface-variant hover:bg-[#e1e3e1]'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export function TournamentExplore() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const d = (key: keyof typeof DICT) => DICT[key][lang];

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentRole,
  } = useTournamentState();

  const STATUS_TABS: { value: TournamentStatus | 'All'; label: string }[] = [
    { value: 'All',                         label: d('tabAll') },
    { value: TournamentStatus.Upcoming,     label: d('tabUpcoming') },
    { value: TournamentStatus.Ongoing,      label: d('tabOngoing') },
    { value: TournamentStatus.Finished,     label: d('tabFinished') },
    { value: TournamentStatus.Cancelled,    label: d('tabCancelled') },
  ];

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
      setError(err instanceof Error ? err.message : (isAr ? 'تعذر تحميل البطولات' : 'Failed to load tournaments'));
      setTournaments(MOCK_TOURNAMENTS);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, isAr]);

  useEffect(() => {
    const timer = setTimeout(fetchTournaments, searchQuery ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchTournaments, searchQuery]);

  // Client-side filter
  const filtered = tournaments.filter((t) => {
    const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`min-h-screen bg-[#f6f8f7] pb-16 ${isAr ? 'font-ar' : 'font-en'}`} dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── HERO HEADER ── */}
      <div className="bg-linear-to-br from-[#002b0e] via-primary to-[#00a336] pt-12 pb-24 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white text-xs font-bold">
            <Trophy className="w-3.5 h-3.5" />
            {d('heroBadge')}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
            {d('heroTitle')}
          </h1>
          <p className="text-white/70 text-sm max-w-sm mx-auto">
            {d('heroSub')}
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-2 flex items-center gap-2 shadow-2xl max-w-xl mx-auto mt-6">
            <Search className="w-4 h-4 text-on-surface-variant/50 ms-2 shrink-0" />
            <input
              type="text"
              placeholder={d('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium text-[#191c1c] placeholder-on-surface-variant/40 outline-none border-none py-2"
              dir={isAr ? 'rtl' : 'ltr'}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-on-surface-variant/50 hover:text-on-surface-variant transition-colors text-xs font-bold px-2"
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
                    ? 'bg-primary text-white shadow'
                    : 'text-on-surface-variant hover:bg-[#f0f2f0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <RoleSwitcher lang={lang} />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs font-bold text-on-surface-variant border border-[#e1e3e1] px-3 py-1.5 rounded-xl flex items-center gap-1.5 hover:bg-[#f0f2f0] transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              {d('filters')}
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {canCreate && (
              <button
                onClick={() => navigate('/tournaments/create')}
                className="text-xs font-black text-white bg-primary hover:bg-[#005318] px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                {d('create')}
              </button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-[#191c1c]">
              {isLoading ? d('loading') : `${filtered.length} ${d('countSuffix')}`}
            </h2>
            {statusFilter !== 'All' && (
              <p className="text-xs text-on-surface-variant/70 mt-0.5">
                {d('filterLabel')} {STATUS_TABS.find((t) => t.value === statusFilter)?.label}
              </p>
            )}
          </div>
          <button
            onClick={fetchTournaments}
            className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {d('refresh')}
          </button>
        </div>

        {/* Error Banner */}
        {error && !isLoading && tournaments.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-bold text-red-600">⚠️ {error}</p>
            <p className="text-xs text-red-500 mt-1">{d('errorFallback')}</p>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 bg-[#f0f2f0] rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-on-surface-variant/30" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191c1c]">{d('noTournaments')}</h3>
              <p className="text-sm text-on-surface-variant/60 mt-1">
                {searchQuery
                  ? `${d('noResults')} "${searchQuery}"`
                  : d('noFilter')}
              </p>
            </div>
            {canCreate && (
              <button
                onClick={() => navigate('/tournaments/create')}
                className="text-sm font-bold text-white bg-primary hover:bg-[#005318] px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                {d('createFirst')}
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

// ── Mock Data (fallback when API is unavailable) ───────────────────────────────
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