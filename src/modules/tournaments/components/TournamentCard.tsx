// ─────────────────────────────────────────────────────────────────────────────
// TournamentCard — Rich card component with status badge, prize, teams progress
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Users,
  CalendarDays,
  ChevronRight,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
} from 'lucide-react';
import type { Tournament } from '../types/tournament';
import { TournamentStatus } from '../types/tournament';
import { useTournamentState } from '../hooks/useTournamentState';

interface TournamentCardProps {
  tournament: Tournament;
}

const statusConfig: Record<
  TournamentStatus,
  { label: string; labelAr: string; color: string; bg: string; icon: React.ReactNode }
> = {
  [TournamentStatus.Upcoming]: {
    label: 'Open',
    labelAr: 'مفتوحة',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: <Clock className="w-3 h-3" />,
  },
  [TournamentStatus.Ongoing]: {
    label: 'Live',
    labelAr: 'جارية',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    icon: <Zap className="w-3 h-3" />,
  },
  [TournamentStatus.Finished]: {
    label: 'Finished',
    labelAr: 'منتهية',
    color: 'text-slate-500',
    bg: 'bg-slate-100 border-slate-200',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  [TournamentStatus.Cancelled]: {
    label: 'Cancelled',
    labelAr: 'ملغية',
    color: 'text-red-400',
    bg: 'bg-red-50 border-red-100',
    icon: <XCircle className="w-3 h-3" />,
  },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const navigate = useNavigate();
  const { openRegisterModal } = useTournamentState();
  const config = statusConfig[tournament.status] ?? statusConfig[TournamentStatus.Upcoming];
  const progressPct = Math.min(
    100,
    Math.round((tournament.registeredTeamsCount / tournament.numberOfTeams) * 100)
  );
  const isFull = tournament.registeredTeamsCount >= tournament.numberOfTeams;
  const isLive = tournament.status === TournamentStatus.Ongoing;

  return (
    <div
      onClick={() => navigate(`/tournaments/${tournament.id}`)}
      className="group relative bg-white rounded-2xl border border-[#e1e3e1] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Live Pulse Indicator */}
      {isLive && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
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
            {tournament.name}
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
            {config.labelAr}
          </span>
          <div className="text-end">
            <p className="text-[10px] text-on-surface-variant/50 font-medium">الجائزة</p>
            <p className="text-sm font-black text-primary flex items-center gap-0.5">
              <Trophy className="w-3.5 h-3.5" />
              {tournament.prize}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f6f8f7] rounded-xl p-2.5 text-center">
            <Users className="w-4 h-4 text-primary mx-auto mb-0.5" />
            <p className="text-xs font-bold text-[#191c1c]">
              {tournament.registeredTeamsCount ?? tournament.teamsJoined ?? 0}/{tournament.numberOfTeams}
            </p>
            <p className="text-[10px] text-on-surface-variant/60">فرق مسجلة</p>
          </div>
          <div className="bg-[#f6f8f7] rounded-xl p-2.5 text-center">
            <CalendarDays className="w-4 h-4 text-primary mx-auto mb-0.5" />
            <p className="text-xs font-bold text-[#191c1c]">
              {formatDate(tournament.startDate)}
            </p>
            <p className="text-[10px] text-on-surface-variant/60">تاريخ البداية</p>
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
            <span>التسجيل</span>
            <span className={isFull ? 'text-red-500' : 'text-primary'}>
              {isFull ? 'مكتمل' : `${progressPct}%`}
            </span>
          </div>
          <div className="w-full bg-[#e8ede9] h-2 rounded-full overflow-hidden">
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
                openRegisterModal();
                navigate(`/tournaments/${tournament.id}`);
              }}
              className="w-full bg-linear-to-r from-primary to-[#00a336] hover:from-[#005318] hover:to-[#007a28] active:scale-[0.98] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md group-hover:shadow-lg"
            >
              سجل فريقك الآن ⚽
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tournaments/${tournament.id}`);
            }}
            className="w-full border border-primary/30 text-primary hover:bg-primary/5 active:scale-[0.98] py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            عرض التفاصيل
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
