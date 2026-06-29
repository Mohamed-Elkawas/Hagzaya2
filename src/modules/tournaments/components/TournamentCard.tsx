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
} from 'lucide-react';
import type { Tournament } from '../types/tournament';
import { TournamentStatus } from '../types/tournament';

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
        className="relative h-28 bg-gradient-to-br from-[#003d12] via-[#006b20] to-[#00a336] flex items-end p-4 overflow-hidden"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
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
            <p className="text-[10px] text-[#3e4a3c]/50 font-medium">الجائزة</p>
            <p className="text-sm font-black text-[#006b20] flex items-center gap-0.5">
              <Trophy className="w-3.5 h-3.5" />
              {tournament.prize}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f6f8f7] rounded-xl p-2.5 text-center">
            <Users className="w-4 h-4 text-[#006b20] mx-auto mb-0.5" />
            <p className="text-xs font-bold text-[#191c1c]">
              {tournament.registeredTeamsCount}/{tournament.numberOfTeams}
            </p>
            <p className="text-[10px] text-[#3e4a3c]/60">فرق مسجلة</p>
          </div>
          <div className="bg-[#f6f8f7] rounded-xl p-2.5 text-center">
            <CalendarDays className="w-4 h-4 text-[#006b20] mx-auto mb-0.5" />
            <p className="text-xs font-bold text-[#191c1c]">
              {formatDate(tournament.startDate)}
            </p>
            <p className="text-[10px] text-[#3e4a3c]/60">تاريخ البداية</p>
          </div>
        </div>

        {/* Registration Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#3e4a3c]">
            <span>التسجيل</span>
            <span className={isFull ? 'text-red-500' : 'text-[#006b20]'}>
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
                  : 'bg-[#006b20]'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <button className="mt-auto w-full bg-[#006b20] hover:bg-[#005318] active:scale-[0.98] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:shadow-md">
          عرض التفاصيل
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
