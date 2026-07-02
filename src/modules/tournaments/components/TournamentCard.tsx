// ─────────────────────────────────────────────────────────────────────────────
// TournamentCard — Rich card component with status badge, prize, teams progress
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Users,
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
} from 'lucide-react';
import type { Tournament } from '../types/tournament';
import { TournamentStatus } from '../types/tournament';
import { useLanguage } from '../../../core/context/LanguageContext';

interface TournamentCardProps {
  tournament: Tournament;
}

const DICT = {
    prize: { ar: 'الجائزة', en: 'Prize' },
    registeredTeams: { ar: 'فرق مسجلة', en: 'Teams Registered' },
    startDate: { ar: 'تاريخ البداية', en: 'Start Date' },
    registration: { ar: 'التسجيل', en: 'Registration' },
    full: { ar: 'مكتمل', en: 'Full' },
    registerTeam: { ar: 'سجل فريقك الآن ⚽', en: 'Register Team Now ⚽' },
    details: { ar: 'عرض التفاصيل', en: 'View Details' },
    live: { ar: 'LIVE', en: 'LIVE' },
    currency: { ar: 'ج.م', en: 'EGP' },
} as const;

const statusConfig: Record<
  TournamentStatus,
  { labelEn: string; labelAr: string; color: string; bg: string; icon: React.ReactNode }
> = {
  [TournamentStatus.Upcoming]: {
    labelEn: 'Open',
    labelAr: 'مفتوحة',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: <Clock className="w-3 h-3" />,
  },
  [TournamentStatus.Ongoing]: {
    labelEn: 'Live',
    labelAr: 'جارية',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    icon: <Zap className="w-3 h-3" />,
  },
  [TournamentStatus.Finished]: {
    labelEn: 'Finished',
    labelAr: 'منتهية',
    color: 'text-slate-500',
    bg: 'bg-slate-100 border-slate-200',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  [TournamentStatus.Cancelled]: {
    labelEn: 'Cancelled',
    labelAr: 'ملغية',
    color: 'text-red-400',
    bg: 'bg-red-50 border-red-100',
    icon: <XCircle className="w-3 h-3" />,
  },
};

function formatDate(iso: string, lang: 'ar' | 'en'): string {
  try {
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function getLocalizedName(item: any, lang: 'ar' | 'en'): string {
    if (lang === 'ar' && item.name_ar) return item.name_ar;
    if (lang === 'en' && item.name_en) return item.name_en;
    return item.name || '';
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const d = (key: keyof typeof DICT) => DICT[key][lang];

  const config = statusConfig[tournament.status] ?? statusConfig[TournamentStatus.Upcoming];
  
  // Safe math calculation to fix NaN%
  const totalTeams = tournament.numberOfTeams || 1; // avoid division by zero
  const regTeams = tournament.registeredTeamsCount ?? tournament.teamsJoined ?? 0;
  const progressPct = Math.min(100, Math.round((regTeams / totalTeams) * 100));
  
  // Localized percentage string
  const formattedPct = new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-US', { 
      style: 'percent', 
      maximumFractionDigits: 0 
  }).format(progressPct / 100);

  const isFull = regTeams >= totalTeams;
  const isLive = tournament.status === TournamentStatus.Ongoing;

  // Format currency dynamically if it's a raw number
  const formattedPrize = typeof tournament.prize === 'number'
    ? new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-US').format(tournament.prize) + ' ' + d('currency')
    : tournament.prize?.toString().replace('EGP', d('currency'));

  return (
    <div
      onClick={() => navigate(`/tournaments/${tournament.id}`)}
      className={`group relative bg-white rounded-2xl border border-[#e1e3e1] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col ${isAr ? 'font-ar' : 'font-en'}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Live Pulse Indicator */}
      {isLive && (
        <div className="absolute top-3 inset-e-3 z-10 flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          {d('live')}
        </div>
      )}

      {/* Cover / Gradient Header */}
      <div
        className="relative h-28 bg-linear-to-br from-[#003d12] via-primary to-[#00a336] flex items-end p-4 overflow-hidden"
        style={
          tournament.coverImage
            ? {
                backgroundImage: `url(${tournament.coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {tournament.coverImage && (
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
        )}
        <div className="relative z-10">
          <h3 className="text-white font-extrabold text-base leading-tight line-clamp-1">
            {getLocalizedName(tournament, lang)}
          </h3>
          <p className="text-white/70 text-xs mt-0.5 capitalize">{tournament.type}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-4">
        {/* Status + Prize Row */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${config.bg} ${config.color}`}
          >
            {config.icon}
            {isAr ? config.labelAr : config.labelEn}
          </span>
          <div className="text-end">
            <p className="text-[10px] text-on-surface-variant/50 font-medium">{d('prize')}</p>
            <p className="text-sm font-black text-primary flex items-center gap-0.5" dir="ltr">
              <Trophy className="w-3.5 h-3.5" />
              {formattedPrize}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f6f8f7] rounded-xl p-2.5 text-center">
            <Users className="w-4 h-4 text-primary mx-auto mb-0.5" />
            <p className="text-xs font-bold text-[#191c1c]">
              {regTeams}/{totalTeams}
            </p>
            <p className="text-[10px] text-on-surface-variant/60">{d('registeredTeams')}</p>
          </div>
          <div className="bg-[#f6f8f7] rounded-xl p-2.5 text-center">
            <CalendarDays className="w-4 h-4 text-primary mx-auto mb-0.5" />
            <p className="text-xs font-bold text-[#191c1c]" dir="ltr">
              {formatDate(tournament.startDate, lang)}
            </p>
            <p className="text-[10px] text-on-surface-variant/60">{d('startDate')}</p>
          </div>
        </div>

        {/* Field Location (when available) */}
        {(tournament.fieldName || tournament.fieldCity) && (
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/70">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">
              {[tournament.fieldName, tournament.fieldCity].filter(Boolean).join(' — ')}
            </span>
          </div>
        )}

        {/* Registration Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-on-surface-variant">
            <span>{d('registration')}</span>
            <span className={isFull ? 'text-red-500' : 'text-primary'}>
              {isFull ? d('full') : formattedPct}
            </span>
          </div>
          <div className="w-full bg-[#e8ede9] h-2 rounded-full overflow-hidden" dir="ltr">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isFull
                  ? 'bg-red-400'
                  : progressPct > 70
                  ? 'bg-amber-400'
                  : 'bg-primary'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-auto flex flex-col gap-2">
          {/* Register CTA — only for open, non-full Upcoming tournaments */}
          {tournament.status === TournamentStatus.Upcoming && !isFull && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tournaments/${tournament.id}/join`);
              }}
              className="w-full bg-linear-to-r from-primary to-[#00a336] hover:from-[#005318] hover:to-[#007a28] active:scale-[0.98] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md group-hover:shadow-lg"
            >
              {d('registerTeam')}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tournaments/${tournament.id}`);
            }}
            className="w-full border border-primary/30 text-primary hover:bg-primary/5 active:scale-[0.98] py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            {d('details')}
            {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
