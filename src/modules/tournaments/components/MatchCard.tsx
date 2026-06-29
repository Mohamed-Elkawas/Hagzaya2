// ─────────────────────────────────────────────────────────────────────────────
// MatchCard — Displays a single match: Team A vs Team B, scores, live indicator
// Includes Owner score-update form that appears inline
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Pencil,
  Check,
  X,
  Shield,
  Calendar,
  Loader2,
} from 'lucide-react';
import { tournamentsApi } from '../api/api';
import type { Match, UserRole } from '../types/tournament';
import { MatchStatus, UserRole as Role } from '../types/tournament';
import { useTournamentState } from '../hooks/useTournamentState';

interface MatchCardProps {
  match: Match;
  currentRole: UserRole;
  onScoreUpdate?: (matchId: string, scoreA: number, scoreB: number) => void;
}

const stageLabels: Record<string, string> = {
  Group: 'دور المجموعات',
  RoundOf16: 'دور الـ 16',
  QuarterFinal: 'ربع النهائي',
  SemiFinal: 'نصف النهائي',
  Final: 'النهائي',
};

function formatMatchTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ar-EG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function TeamDisplay({ team, scoreVal, side }: {
  team: { id: string; name: string; logoUrl?: string } | null;
  scoreVal: number | null;
  side: 'left' | 'right';
}) {
  const align = side === 'left' ? 'items-start' : 'items-end';
  return (
    <div className={`flex flex-col ${align} gap-1.5 flex-1`}>
      {team?.logoUrl ? (
        <img src={team.logoUrl} alt={team.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#e1e3e1] shadow" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] border-2 border-[#c8e6c9] flex items-center justify-center shadow">
          <Shield className="w-6 h-6 text-[#006b20]" />
        </div>
      )}
      <p className={`text-sm font-bold text-[#191c1c] ${side === 'right' ? 'text-end' : 'text-start'} leading-tight max-w-[100px]`}>
        {team?.name ?? 'TBD'}
      </p>
      {scoreVal !== null && (
        <span className="text-3xl font-black text-[#191c1c]">{scoreVal}</span>
      )}
    </div>
  );
}

export function MatchCard({ match, currentRole, onScoreUpdate }: MatchCardProps) {
  const { updateMatchScore } = useTournamentState();

  const [isEditing, setIsEditing] = useState(false);
  const [editScoreA, setEditScoreA] = useState<string>(
    match.scoreA !== null ? String(match.scoreA) : '0'
  );
  const [editScoreB, setEditScoreB] = useState<string>(
    match.scoreB !== null ? String(match.scoreB) : '0'
  );

  const canEditScore =
    currentRole === Role.Owner || currentRole === Role.Admin;
  const isLive = match.status === MatchStatus.Live;
  const isCompleted = match.status === MatchStatus.Completed;

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveScore = async () => {
    const a = parseInt(editScoreA, 10);
    const b = parseInt(editScoreB, 10);
    if (isNaN(a) || isNaN(b)) return;
    
    setIsSaving(true);
    try {
      await tournamentsApi.updateMatchScore(match.id, a, b);
      updateMatchScore(match.id, a, b);
      onScoreUpdate?.(match.id, a, b);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update score:', error);
      alert('حدث خطأ أثناء تحديث النتيجة');
    } finally {
      setIsSaving(false);
    }
  };

  const statusBadge = {
    [MatchStatus.Live]: (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white shadow animate-pulse">
        <Zap className="w-2.5 h-2.5" /> مباشر
      </span>
    ),
    [MatchStatus.Scheduled]: (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600">
        <Clock className="w-2.5 h-2.5" /> مجدولة
      </span>
    ),
    [MatchStatus.Completed]: (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
        <CheckCircle2 className="w-2.5 h-2.5" /> منتهية
      </span>
    ),
    [MatchStatus.Cancelled]: (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-400">
        <XCircle className="w-2.5 h-2.5" /> ملغية
      </span>
    ),
  }[match.status];

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
        isLive
          ? 'border-red-300 shadow-red-100 ring-1 ring-red-200'
          : 'border-[#e1e3e1]'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#f6f8f7] border-b border-[#e1e3e1]">
        <span className="text-[11px] font-semibold text-[#3e4a3c]/70">
          {stageLabels[match.stage] ?? match.stage}
        </span>
        <div className="flex items-center gap-2">
          {statusBadge}
          {canEditScore && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[10px] text-[#006b20] hover:text-[#004d18] font-bold flex items-center gap-0.5 transition-colors"
            >
              <Pencil className="w-3 h-3" />
              تحديث
            </button>
          )}
        </div>
      </div>

      {/* Match Body */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Team A */}
          <TeamDisplay team={match.teamA} scoreVal={match.scoreA} side="left" />

          {/* Middle — Score or VS */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            {isEditing ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={editScoreA}
                  onChange={(e) => setEditScoreA(e.target.value)}
                  className="w-12 h-10 text-center text-lg font-black rounded-xl border-2 border-[#006b20] outline-none focus:ring-2 focus:ring-[#006b20]/30"
                />
                <span className="text-xl font-black text-[#3e4a3c]">:</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={editScoreB}
                  onChange={(e) => setEditScoreB(e.target.value)}
                  className="w-12 h-10 text-center text-lg font-black rounded-xl border-2 border-[#006b20] outline-none focus:ring-2 focus:ring-[#006b20]/30"
                />
              </div>
            ) : isCompleted || isLive ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-[#191c1c]">
                  {match.scoreA ?? 0}
                </span>
                <span className="text-xl font-black text-[#3e4a3c]/50">:</span>
                <span className="text-3xl font-black text-[#191c1c]">
                  {match.scoreB ?? 0}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f0f2f0]">
                <span className="text-base font-black text-[#3e4a3c]">VS</span>
              </div>
            )}

            {/* Action buttons for editing */}
            {isEditing && (
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleSaveScore}
                  disabled={isSaving}
                  className="w-8 h-8 bg-[#006b20] hover:bg-[#005318] text-white rounded-full flex items-center justify-center transition-colors shadow disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-8 h-8 bg-[#f0f2f0] hover:bg-[#e1e3e1] text-[#3e4a3c] rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Team B */}
          <TeamDisplay team={match.teamB} scoreVal={match.scoreB} side="right" />
        </div>

        {/* Match Time */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#3e4a3c]/60 font-medium justify-center">
          <Calendar className="w-3 h-3" />
          {formatMatchTime(match.startTime)}
        </div>
      </div>
    </div>
  );
}
