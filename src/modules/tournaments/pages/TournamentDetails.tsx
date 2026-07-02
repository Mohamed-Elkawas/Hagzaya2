// ─────────────────────────────────────────────────────────────────────────────
// TournamentDetails — Full tabs-based detail page
// Tabs: Overview | Groups/Standings | Bracket | Matches | Admin Panel
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Trophy,
  Users,
  CalendarDays,
  MapPin,
  Zap,
  Shield,
  Settings,
  BarChart3,
  Layers,
  Award,
  Loader2,
  Pencil,
  Trash2,
  Gift,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { GroupTable } from '../components/GroupTable';
import { BracketView } from '../components/BracketView';
import { MatchCard } from '../components/MatchCard';
import { tournamentsApi } from '../api/api';
import { useTournamentState } from '../hooks/useTournamentState';
import type { Tournament } from '../types/tournament';
import { TournamentStatus, UserRole, MatchStatus } from '../types/tournament';
import { useLanguage } from '../../../core/context/LanguageContext';

// ── Bilingual Dictionary ───────────────────────────────────────────────────────
const DICT = {
  tournamentDetails: { ar: 'تفاصيل البطولة',       en: 'Tournament Details' },
  organizer:         { ar: 'المنظم',              en: 'Organizer' },
  prizePool:         { ar: 'قيمة الجائزة',        en: 'Prize Pool' },
  entryFee:          { ar: 'رسوم الاشتراك',       en: 'Entry Fee' },
  registeredTeams:   { ar: 'الفرق المشتركة',      en: 'Registered Teams' },
  rulesRegs:         { ar: 'شروط وقوانين البطولة',en: 'Rules & Regulations' },
  aboutTourney:      { ar: 'عن البطولة',          en: 'About the Tournament' },
  joinNow:           { ar: 'اشترك الآن',          en: 'Join Tournament Now' },
  fullStatus:        { ar: 'مكتملة',              en: 'Full / Completed' },
  openStatus:        { ar: 'متاحة',               en: 'Open / Available' },
  ongoingStatus:     { ar: 'جارية الآن 🔴',       en: 'Ongoing 🔴' },
  finishedStatus:    { ar: 'منتهية',              en: 'Finished' },
  cancelledStatus:   { ar: 'ملغية',               en: 'Cancelled' },
  
  // Tabs
  tabOverview:       { ar: 'نظرة عامة',           en: 'Overview' },
  tabGroups:         { ar: 'المجموعات',           en: 'Groups' },
  tabBracket:        { ar: 'الكأس',               en: 'Bracket' },
  tabMatches:        { ar: 'المباريات',           en: 'Matches' },
  tabAdmin:          { ar: 'لوحة التحكم',         en: 'Admin Panel' },
  
  // Overview Tab
  startDate:         { ar: 'تاريخ البداية',       en: 'Start Date' },
  endDate:           { ar: 'تاريخ النهاية',       en: 'End Date' },
  noDesc:            { ar: 'لا توجد تفاصيل إضافية لهذه البطولة.', en: 'No additional details for this tournament.' },
  regProgress:       { ar: 'تقدم التسجيل',        en: 'Registration Progress' },
  seatsLeft:         { ar: 'مقعد متبقي',          en: 'seats left' },
  teamRegistered:    { ar: 'فريق مسجل',           en: 'registered teams' },
  tourneyRewards:    { ar: 'جوائز البطولة',       en: 'Tournament Rewards' },
  firstPlace:        { ar: '🥇 المركز الأول',     en: '🥇 First Place' },
  secondPlace:       { ar: '🥈 المركز الثاني',    en: '🥈 Second Place' },
  thirdPlace:        { ar: '🥉 المركز الثالث',    en: '🥉 Third Place' },
  bestPlayer:        { ar: 'أفضل لاعب:',          en: 'Best Player:' },
  bestGK:            { ar: 'أفضل حارس مرمى:',     en: 'Best Goalkeeper:' },
  
  // Status config
  statusUpcoming:    { ar: 'مفتوحة للتسجيل',      en: 'Open for Registration' },

  // Matches Tab
  noMatches:         { ar: 'لا توجد مباريات مجدولة', en: 'No scheduled matches' },
  noMatchesSub:      { ar: 'ستظهر المباريات بعد إجراء القرعة', en: 'Matches will appear after the draw' },
  liveMatches:       { ar: 'هناك مباريات تُلعب الآن!', en: 'There are live matches playing now!' },
  stageAll:          { ar: 'الكل',                en: 'All' },
  
  // Admin Panel
  unauthorized:      { ar: 'غير مصرح',            en: 'Unauthorized' },
  unauthorizedSub:   { ar: 'هذه اللوحة مخصصة للمالك والمسؤول فقط', en: 'This panel is for Owner and Admin only' },
  adminPanelOwner:   { ar: 'لوحة تحكم المالك',    en: 'Owner Panel' },
  adminPanelAdmin:   { ar: 'لوحة تحكم المسؤول',   en: 'Admin Panel' },
  adminSub:          { ar: 'إدارة البطولة، المكافآت، والإعدادات المتقدمة', en: 'Manage tournament, rewards, and advanced settings' },
  editTourney:       { ar: 'تعديل البطولة',       en: 'Edit Tournament' },
  manageTeams:       { ar: 'إدارة الفرق',         en: 'Manage Teams' },
  doDraw:            { ar: 'إجراء القرعة',        en: 'Conduct Draw' },
  matchSchedule:     { ar: 'جدول المباريات',      en: 'Match Schedule' },
  deleteTourney:     { ar: 'حذف البطولة',         en: 'Delete Tournament' },
  setRewards:        { ar: 'تحديد جوائز البطولة', en: 'Set Tournament Rewards' },
  saveRewards:       { ar: 'حفظ الجوائز',         en: 'Save Rewards' },
  rewardsSaved:      { ar: 'تم حفظ الجوائز بنجاح!', en: 'Rewards saved successfully!' },
  accepted:          { ar: 'مقبول',               en: 'Accepted' },
  noTeamsYet:        { ar: 'لا توجد فرق مسجلة بعد', en: 'No registered teams yet' },

  // Loading / Error
  loadingDetail:     { ar: 'جار تحميل تفاصيل البطولة...', en: 'Loading tournament details...' },
  notFound:          { ar: '⚠️ البطولة غير موجودة', en: '⚠️ Tournament not found' },
  backToList:        { ar: 'العودة للقائمة',      en: 'Back to list' },
  backToTourneys:    { ar: 'العودة للبطولات',     en: 'Back to Tournaments' },
  teamSuffix:        { ar: 'فريق',                en: 'Teams' },
} as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string, lang: 'ar' | 'en') {
  try {
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return iso; }
}

type TabId = 'overview' | 'groups' | 'bracket' | 'matches' | 'admin';

function translateStage(stage: string, lang: 'ar' | 'en'): string {
    const mapEnToAr: Record<string, string> = {
        Group: 'دور المجموعات', RoundOf16: 'دور الـ 16',
        QuarterFinal: 'ربع النهائي', SemiFinal: 'نصف النهائي', Final: 'النهائي',
    };
    if (lang === 'ar') return mapEnToAr[stage] || stage;
    return stage; // Default English from backend usually
}

function translateFieldType(type: unknown, lang: 'ar' | 'en'): string {
    if (typeof type !== 'string') return '';
    if (type.includes('5') || type === 'خماسي') return lang === 'ar' ? 'خماسي' : '5-A-Side';
    if (type.includes('7') || type === 'سباعي') return lang === 'ar' ? 'سباعي' : '7-A-Side';
    if (type.includes('11') || type.includes('قانوني')) return lang === 'ar' ? 'قانوني (11)' : 'Legal Size (11-A-Side)';
    return type;
}

// ── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ tournament, lang }: { tournament: Tournament; lang: 'ar' | 'en' }) {
  const d = (key: keyof typeof DICT) => DICT[key][lang];
  const progress = Math.min(100, Math.round(
    (tournament.registeredTeamsCount / tournament.numberOfTeams) * 100
  ));
  const isFull = tournament.registeredTeamsCount >= tournament.numberOfTeams;

  const STATUS_CONFIG: Record<TournamentStatus, { label: string; color: string; bg: string }> = {
    [TournamentStatus.Upcoming]: { label: d('statusUpcoming'), color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' },
    [TournamentStatus.Ongoing]:  { label: d('ongoingStatus'),  color: 'text-red-600',     bg: 'bg-red-50 border-red-300' },
    [TournamentStatus.Finished]: { label: d('finishedStatus'), color: 'text-slate-500',   bg: 'bg-slate-100 border-slate-300' },
    [TournamentStatus.Cancelled]:{ label: d('cancelledStatus'),color: 'text-red-400',     bg: 'bg-red-50 border-red-200' },
  };
  const config = STATUS_CONFIG[tournament.status] ?? STATUS_CONFIG[TournamentStatus.Upcoming];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Users className="w-5 h-5 text-primary" />, label: d('registeredTeams'), value: `${tournament.registeredTeamsCount}/${tournament.numberOfTeams}` },
          { icon: <Trophy className="w-5 h-5 text-amber-500" />, label: d('prizePool'), value: tournament.prize },
          { icon: <CalendarDays className="w-5 h-5 text-blue-500" />, label: d('startDate'), value: formatDate(tournament.startDate, lang) },
          { icon: <CalendarDays className="w-5 h-5 text-purple-500" />, label: d('endDate'), value: formatDate(tournament.endDate, lang) },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e1e3e1] p-4 flex flex-col items-start gap-2 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#f6f8f7] flex items-center justify-center">
              {stat.icon}
            </div>
            <div>
              <p className="text-[11px] text-on-surface-variant/60 font-medium">{stat.label}</p>
              <p className="text-sm font-black text-[#191c1c] leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-[#e1e3e1] p-5 shadow-sm">
        <h3 className="font-bold text-[#191c1c] mb-2 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> {d('aboutTourney')}
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {tournament.description || d('noDesc')}
        </p>
      </div>

      {/* Registration Progress */}
      <div className="bg-white rounded-2xl border border-[#e1e3e1] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#191c1c] text-sm">{d('regProgress')}</h3>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
          <span>{tournament.registeredTeamsCount} {d('teamRegistered')}</span>
          <span className={isFull ? 'text-red-500' : 'text-primary'}>
            {isFull ? d('fullStatus') : `${progress}%`}
          </span>
        </div>
        <div className="w-full bg-[#e8ede9] h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isFull ? 'bg-red-400' : progress > 70 ? 'bg-amber-400' : 'bg-primary'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-on-surface-variant/60">
          {tournament.numberOfTeams - tournament.registeredTeamsCount} {d('seatsLeft')}
        </p>
      </div>

      {/* Rewards */}
      {tournament.rewards && (
        <div className="bg-linear-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-5 shadow-sm">
          <h3 className="font-bold text-[#191c1c] mb-4 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> {d('tourneyRewards')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { place: d('firstPlace'), value: tournament.rewards.firstPlace },
              { place: d('secondPlace'), value: tournament.rewards.secondPlace },
              { place: d('thirdPlace'), value: tournament.rewards.thirdPlace },
            ].filter(r => r.value).map((r) => (
              <div key={r.place} className="bg-white rounded-xl p-3 text-center border border-amber-200">
                <p className="text-xs font-bold text-on-surface-variant">{r.place}</p>
                <p className="text-sm font-black text-amber-600 mt-1">{r.value}</p>
              </div>
            ))}
          </div>
          {tournament.rewards.theBestPlayer && (
            <div className="mt-3 flex items-center gap-2 bg-white rounded-xl p-3 border border-amber-200">
              <Award className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold text-on-surface-variant">{d('bestPlayer')}</span>
              <span className="text-xs font-black text-purple-600">{tournament.rewards.theBestPlayer}</span>
            </div>
          )}
        </div>
      )}

      {/* Rules */}
      <div className="bg-white rounded-2xl border border-[#e1e3e1] p-5 shadow-sm">
        <h3 className="font-bold text-[#191c1c] mb-3 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" /> {d('rulesRegs')}
        </h3>
        <ul className="space-y-2">
          {[
            lang === 'ar' ? 'كل مجموعة تحتوي على 4 فرق — أعلى فريقين يتأهلان' : 'Each group has 4 teams — top 2 qualify',
            lang === 'ar' ? 'ترتيب المجموعات: النقاط → فارق الأهداف → التشابك المباشر' : 'Group Standings: Points → Goal Difference → Head-to-Head',
            lang === 'ar' ? 'لا تعادل في الدور الإقصائي — وقت إضافي ثم ركلات الترجيح' : 'No draws in knockout — extra time then penalties',
            (lang === 'ar' ? 'رسوم التسجيل: ' : 'Registration Fee: ') + tournament.price + (lang === 'ar' ? ' جنيه لكل فريق' : ' EGP per team'),
          ].map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
              <span className="w-4 h-4 bg-[#e8f5e9] rounded-full flex items-center justify-center text-primary shrink-0 mt-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" />
              </span>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Groups Tab ────────────────────────────────────────────────────────────────

function GroupsTab({ tournament, lang }: { tournament: Tournament; lang: 'ar' | 'en' }) {
  if (!tournament.groups || tournament.groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 bg-[#f0f2f0] rounded-full flex items-center justify-center">
          <Layers className="w-7 h-7 text-on-surface-variant/40" />
        </div>
        <p className="text-sm font-bold text-[#191c1c]">{lang === 'ar' ? 'المجموعات' : 'Groups'}</p>
        <p className="text-xs text-on-surface-variant/60 max-w-xs">
          {lang === 'ar' ? 'سيتم تحديد المجموعات بعد اكتمال التسجيل وإجراء القرعة.' : 'Groups will be determined after registration and draw.'}
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {tournament.groups.map((group) => (
        <GroupTable key={group.id} group={group} />
      ))}
    </div>
  );
}

// ── Matches Tab ───────────────────────────────────────────────────────────────

function MatchesTab({
  tournament,
  currentRole,
  lang,
}: {
  tournament: Tournament;
  currentRole: UserRole;
  lang: 'ar' | 'en';
}) {
  const d = (key: keyof typeof DICT) => DICT[key][lang];
  const [filterStage, setFilterStage] = useState<string>('All');
  const matches = tournament.matches ?? [];

  const stages = ['All', ...Array.from(new Set(matches.map((m) => m.stage)))];

  const filtered =
    filterStage === 'All'
      ? matches
      : matches.filter((m) => m.stage === filterStage);

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 bg-[#f0f2f0] rounded-full flex items-center justify-center">
          <Clock className="w-7 h-7 text-on-surface-variant/40" />
        </div>
        <p className="text-sm font-bold text-[#191c1c]">{d('noMatches')}</p>
        <p className="text-xs text-on-surface-variant/60">{d('noMatchesSub')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stage Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => setFilterStage(stage)}
            className={`whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-xl transition-all shrink-0 ${
              filterStage === stage
                ? 'bg-primary text-white shadow'
                : 'bg-white border border-[#e1e3e1] text-on-surface-variant hover:bg-[#f0f2f0]'
            }`}
          >
            {stage === 'All' ? d('stageAll') : translateStage(stage, lang)}
          </button>
        ))}
      </div>

      {/* Live Matches Banner */}
      {filtered.some((m) => m.status === MatchStatus.Live) && (
        <div className="bg-red-500 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Zap className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-bold">{d('liveMatches')}</span>
          <span className="w-2 h-2 bg-white rounded-full animate-pulse ms-1" />
        </div>
      )}

      {/* Match Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            currentRole={currentRole}
          />
        ))}
      </div>
    </div>
  );
}

// ── Admin Panel Tab ───────────────────────────────────────────────────────────

function AdminPanelTab({
  tournament,
  currentRole,
  lang,
}: {
  tournament: Tournament;
  currentRole: UserRole;
  lang: 'ar' | 'en';
}) {
  const d = (key: keyof typeof DICT) => DICT[key][lang];
  const [rewardForm, setRewardForm] = useState({
    firstPlace: tournament.rewards?.firstPlace ?? '',
    secondPlace: tournament.rewards?.secondPlace ?? '',
    thirdPlace: tournament.rewards?.thirdPlace ?? '',
    theBestPlayer: tournament.rewards?.theBestPlayer ?? '',
    theBestGoalkeeper: tournament.rewards?.theBestGoalkeeper ?? '',
  });
  const [isSavingRewards, setIsSavingRewards] = useState(false);
  const [rewardSuccess, setRewardSuccess] = useState(false);

  if (currentRole === UserRole.Player) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
          <Shield className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-sm font-bold text-[#191c1c]">{d('unauthorized')}</p>
        <p className="text-xs text-on-surface-variant/60">{d('unauthorizedSub')}</p>
      </div>
    );
  }

  const handleSaveRewards = async () => {
    setIsSavingRewards(true);
    try {
      await tournamentsApi.setRewards({ tournamentId: tournament.id, ...rewardForm });
      setRewardSuccess(true);
      setTimeout(() => setRewardSuccess(false), 3000);
    } catch {
      // silent fail in demo
    } finally {
      setIsSavingRewards(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-linear-to-r from-slate-800 to-slate-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-4 h-4" />
          <h3 className="font-bold text-sm">{currentRole === UserRole.Admin ? d('adminPanelAdmin') : d('adminPanelOwner')}</h3>
        </div>
        <p className="text-white/60 text-xs">{d('adminSub')}</p>
      </div>

      {/* Quick Actions (Owner / Admin) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { icon: <Pencil className="w-4 h-4" />, label: d('editTourney'), color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
          { icon: <Users className="w-4 h-4" />, label: d('manageTeams'), color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
          { icon: <Trophy className="w-4 h-4" />, label: d('doDraw'), color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
          { icon: <Shield className="w-4 h-4" />, label: d('matchSchedule'), color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
          ...(currentRole === UserRole.Admin
            ? [{ icon: <Trash2 className="w-4 h-4" />, label: d('deleteTourney'), color: 'text-red-600 bg-red-50 hover:bg-red-100' }]
            : []
          ),
        ].map((action, i) => (
          <button
            key={i}
            className={`flex items-center gap-2 px-3 py-3 rounded-xl border border-transparent text-xs font-bold transition-all ${action.color}`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* Rewards Form (Admin Only) */}
      {currentRole === UserRole.Admin && (
        <div className="bg-white rounded-2xl border border-[#e1e3e1] p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-[#191c1c] text-sm flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-500" /> {d('setRewards')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: 'firstPlace', label: d('firstPlace') },
              { key: 'secondPlace', label: d('secondPlace') },
              { key: 'thirdPlace', label: d('thirdPlace') },
              { key: 'theBestPlayer', label: '⭐ ' + d('bestPlayer') },
              { key: 'theBestGoalkeeper', label: '🧤 ' + d('bestGK') },
            ].map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="text-[11px] font-semibold text-on-surface-variant">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={rewardForm[field.key as keyof typeof rewardForm]}
                  onChange={(e) =>
                    setRewardForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  className="w-full px-3 h-10 rounded-xl border border-[#e1e3e1] text-sm text-[#191c1c] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            ))}
          </div>
          {rewardSuccess && (
            <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2 flex items-center gap-1.5 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> {d('rewardsSaved')}
            </p>
          )}
          <button
            onClick={handleSaveRewards}
            disabled={isSavingRewards}
            className="w-full h-10 bg-primary hover:bg-[#005318] disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
          >
            {isSavingRewards ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Gift className="w-4 h-4" /> {d('saveRewards')}
              </>
            )}
          </button>
        </div>
      )}

      {/* Registered Teams List */}
      <div className="bg-white rounded-2xl border border-[#e1e3e1] p-5 shadow-sm">
        <h3 className="font-bold text-[#191c1c] text-sm flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          {d('registeredTeams')} ({tournament.registeredTeamsCount})
        </h3>
        {tournament.groups && tournament.groups.length > 0 ? (
          <div className="space-y-2">
            {tournament.groups.flatMap((g) => g.teams).map((team) => (
              <div
                key={team.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#f6f8f7] hover:bg-[#edf0ec] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#e8f5e9] flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm font-bold text-[#191c1c] flex-1">{team.name}</p>
                <span className="text-[10px] font-bold text-primary bg-[#e8f5e9] px-2 py-0.5 rounded-full">
                  {d('accepted')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-on-surface-variant/60 text-center py-4">
            {d('noTeamsYet')}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function TournamentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    activeTournament,
    setActiveTournament,
    isLoadingTournament,
    setLoadingTournament,
    setTournamentError,
    currentRole,
  } = useTournamentState();

  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const d = (key: keyof typeof DICT) => DICT[key][lang];

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: d('tabOverview'), icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'groups',   label: d('tabGroups'),  icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'bracket',  label: d('tabBracket'),      icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'matches',  label: d('tabMatches'),  icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'admin',    label: d('tabAdmin'), icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  // Navigation to new full-page join flow
  const navigateToJoin = () => navigate(`/tournaments/${tournament?.id}/join`);

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    if (!id) return;
    setLoadingTournament(true);
    setTournamentError(null);

    tournamentsApi
      .getById(id)
      .then((data) => setActiveTournament(data))
      .catch((err) => {
        setTournamentError(err.message);
        // Fallback to mock
        setActiveTournament(MOCK_DETAIL);
      })
      .finally(() => setLoadingTournament(false));
  }, [id]);

  const tournament = activeTournament;
  const canJoin =
    currentRole === UserRole.Player &&
    tournament?.status === TournamentStatus.Upcoming &&
    tournament.registeredTeamsCount < tournament.numberOfTeams;

  const canManage =
    currentRole === UserRole.Owner || currentRole === UserRole.Admin;

  // Visible tabs based on role
  const visibleTabs = TABS.filter((tab) => {
    if (tab.id === 'admin') return canManage;
    return true;
  });

  if (isLoadingTournament) {
    return (
      <div className={`min-h-screen bg-[#f6f8f7] flex items-center justify-center ${isAr ? 'font-ar' : 'font-en'}`} dir={isAr ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-bold text-on-surface-variant">{d('loadingDetail')}</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className={`min-h-screen bg-[#f6f8f7] flex items-center justify-center ${isAr ? 'font-ar' : 'font-en'}`} dir={isAr ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-3">
          <p className="text-base font-bold text-[#191c1c]">{d('notFound')}</p>
          <button
            onClick={() => navigate('/tournaments')}
            className="text-sm font-bold text-primary underline"
          >
            {d('backToList')}
          </button>
        </div>
      </div>
    );
  }

  const STATUS_CONFIG: Record<TournamentStatus, { label: string; color: string; bg: string }> = {
    [TournamentStatus.Upcoming]: { label: d('statusUpcoming'), color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' },
    [TournamentStatus.Ongoing]:  { label: d('ongoingStatus'),  color: 'text-red-600',     bg: 'bg-red-50 border-red-300' },
    [TournamentStatus.Finished]: { label: d('finishedStatus'), color: 'text-slate-500',   bg: 'bg-slate-100 border-slate-300' },
    [TournamentStatus.Cancelled]:{ label: d('cancelledStatus'),color: 'text-red-400',     bg: 'bg-red-50 border-red-200' },
  };

  const config = STATUS_CONFIG[tournament.status] ?? STATUS_CONFIG[TournamentStatus.Upcoming];
  const isLive = tournament.status === TournamentStatus.Ongoing;

  return (
    <div className={`min-h-screen bg-[#f6f8f7] pb-16 ${isAr ? 'font-ar' : 'font-en'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── HERO ── */}
      <div
        className="relative h-64 md:h-80 bg-linear-to-br from-[#001a07] via-[#003d12] to-primary flex flex-col justify-end overflow-hidden"
        style={
          tournament.coverImage
            ? { backgroundImage: `url(${tournament.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
      >
        {tournament.coverImage && (
          <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
        )}

        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-4 inset-e-4 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            {d('ongoingStatus')}
          </div>
        )}

        <div className="relative z-10 px-4 md:px-8 pb-5 max-w-5xl mx-auto w-full">
          <button
            onClick={() => navigate('/tournaments')}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-bold mb-4 transition-colors"
          >
            {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            {d('backToTourneys')}
          </button>

          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full border ${config.bg} ${config.color}`}>
                {config.label}
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                {tournament.name}
              </h1>
              <div className="flex items-center gap-3 text-white/70 text-xs font-medium">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {tournament.registeredTeamsCount}/{tournament.numberOfTeams} {d('teamSuffix')}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  {tournament.prize}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {translateFieldType(tournament.type, lang)}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            {canJoin && (
              <button
                onClick={navigateToJoin}
                className="shrink-0 bg-primary hover:bg-[#005318] text-white font-black text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                {d('joinNow')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── TABS + CONTENT ── */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-6 space-y-5">
        {/* Tab Bar */}
        <div className="bg-white rounded-2xl border border-[#e1e3e1] shadow-sm p-1.5 flex items-center gap-1 overflow-x-auto">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-bold px-3 py-2 rounded-xl transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow'
                  : 'text-on-surface-variant hover:bg-[#f0f2f0]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab tournament={tournament} lang={lang} />}
          {activeTab === 'groups' && <GroupsTab tournament={tournament} lang={lang} />}
          {activeTab === 'bracket' && (
            <BracketView
              matches={tournament.matches ?? []}
              numberOfTeams={tournament.numberOfTeams}
            />
          )}
          {activeTab === 'matches' && (
            <MatchesTab tournament={tournament} currentRole={currentRole} lang={lang} />
          )}
          {activeTab === 'admin' && canManage && (
            <AdminPanelTab tournament={tournament} currentRole={currentRole} lang={lang} />
          )}
        </div>
      </div>


    </div>
  );
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_DETAIL: Tournament = {
  id: '1',
  name: 'October Weekend League',
  numberOfTeams: 8,
  prize: 'EGP 15,000',
  description:
    'بطولة كروية ضخمة تجمع أفضل 8 فرق في القاهرة لتتنافس على لقب البطولة وجوائز قيمة. تُقام المباريات على أفضل الملاعب المجهزة.',
  price: 500,
  type: 'FiveASide',
  startDate: '2026-07-10T09:00:00',
  endDate: '2026-07-25T21:00:00',
  fieldId: 'f1',
  status: TournamentStatus.Upcoming,
  registeredTeamsCount: 5,
  ownerId: 'o1',
  rewards: {
    firstPlace: 'EGP 8,000 + كأس',
    secondPlace: 'EGP 4,000',
    thirdPlace: 'EGP 2,000',
    theBestPlayer: 'EGP 1,000',
    theBestGoalkeeper: 'EGP 500',
  },
  groups: [
    {
      id: 'g1',
      name: 'المجموعة A',
      teams: [
        { id: 't1', name: 'النسور الذهبية', played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 7, goalsAgainst: 2, goalDifference: 5, points: 7 },
        { id: 't2', name: 'صقور القاهرة', played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 4, goalsAgainst: 4, goalDifference: 0, points: 4 },
        { id: 't3', name: 'أبطال الدلتا', played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 3, goalsAgainst: 5, goalDifference: -2, points: 3 },
        { id: 't4', name: 'نجوم الجيزة', played: 3, won: 0, drawn: 2, lost: 1, goalsFor: 2, goalsAgainst: 5, goalDifference: -3, points: 2 },
      ],
    },
    {
      id: 'g2',
      name: 'المجموعة B',
      teams: [
        { id: 't5', name: 'فرسان الإسكندرية', played: 3, won: 3, drawn: 0, lost: 0, goalsFor: 9, goalsAgainst: 1, goalDifference: 8, points: 9 },
        { id: 't6', name: 'المارد الأخضر', played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 5, goalsAgainst: 5, goalDifference: 0, points: 4 },
        { id: 't7', name: 'نمور السويس', played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 3, goalsAgainst: 6, goalDifference: -3, points: 3 },
        { id: 't8', name: 'أسود بورسعيد', played: 3, won: 0, drawn: 1, lost: 2, goalsFor: 2, goalsAgainst: 7, goalDifference: -5, points: 1 },
      ],
    },
  ],
  matches: [
    {
      id: 'm1', tournamentId: '1', stage: 'Group', groupId: 'g1',
      teamA: { id: 't1', name: 'النسور الذهبية' },
      teamB: { id: 't2', name: 'صقور القاهرة' },
      scoreA: 3, scoreB: 1, status: MatchStatus.Completed,
      startTime: '2026-07-10T09:00:00', fieldId: 'f1',
    },
    {
      id: 'm2', tournamentId: '1', stage: 'Group', groupId: 'g1',
      teamA: { id: 't3', name: 'أبطال الدلتا' },
      teamB: { id: 't4', name: 'نجوم الجيزة' },
      scoreA: null, scoreB: null, status: MatchStatus.Live,
      startTime: '2026-07-10T11:00:00', fieldId: 'f1',
    },
    {
      id: 'm3', tournamentId: '1', stage: 'SemiFinal',
      teamA: { id: 't1', name: 'النسور الذهبية' },
      teamB: { id: 't5', name: 'فرسان الإسكندرية' },
      scoreA: null, scoreB: null, status: MatchStatus.Scheduled,
      startTime: '2026-07-20T15:00:00', fieldId: 'f1',
    },
    {
      id: 'm4', tournamentId: '1', stage: 'Final',
      teamA: null, teamB: null,
      scoreA: null, scoreB: null, status: MatchStatus.Scheduled,
      startTime: '2026-07-25T18:00:00', fieldId: 'f1',
    },
  ],
};
