// ─────────────────────────────────────────────────────────────────────────────
// BracketView — Responsive knockout bracket with SVG connector lines
// Supports 8, 16, 32 team brackets rendered column by column
// ─────────────────────────────────────────────────────────────────────────────

import { Shield, Trophy } from 'lucide-react';
import type { Match } from '../types/tournament';
import { MatchStatus } from '../types/tournament';

interface BracketViewProps {
  matches: Match[];
  numberOfTeams: 8 | 16 | 32;
}

// Stage ordering for bracket columns

const stageLabels: Record<string, string> = {
  RoundOf16: 'دور الـ 16',
  QuarterFinal: 'ربع النهائي',
  SemiFinal: 'نصف النهائي',
  Final: 'النهائي',
};

function getApplicableStages(numberOfTeams: 8 | 16 | 32): string[] {
  if (numberOfTeams === 32) return ['RoundOf16', 'QuarterFinal', 'SemiFinal', 'Final'];
  if (numberOfTeams === 16) return ['QuarterFinal', 'SemiFinal', 'Final'];
  return ['SemiFinal', 'Final'];
}

interface BracketMatchProps {
  match: Match;
}

function BracketMatch({ match }: BracketMatchProps) {
  const isLive = match.status === MatchStatus.Live;
  const isCompleted = match.status === MatchStatus.Completed;
  const scoreA = match.scoreA ?? null;
  const scoreB = match.scoreB ?? null;
  const isFinal = match.stage === 'Final';

  const winnerIsA =
    isCompleted && scoreA !== null && scoreB !== null && scoreA > scoreB;
  const winnerIsB =
    isCompleted && scoreA !== null && scoreB !== null && scoreB > scoreA;

  return (
    <div
      className={`relative bg-white rounded-xl border shadow-sm overflow-hidden transition-all w-48 ${
        isLive
          ? 'border-red-300 ring-1 ring-red-200 shadow-red-50'
          : isFinal
          ? 'border-yellow-300 shadow-yellow-50'
          : 'border-[#e1e3e1]'
      }`}
    >
      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
      )}
      {isFinal && (
        <div className="absolute top-1.5 right-1.5">
          <Trophy className="w-3.5 h-3.5 text-yellow-500" />
        </div>
      )}

      {/* Team A */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b border-[#f0f2f0] ${
          winnerIsA ? 'bg-emerald-50' : ''
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {match.teamA?.logoUrl ? (
            <img src={match.teamA.logoUrl} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#e8f5e9] flex items-center justify-center shrink-0">
              <Shield className="w-3 h-3 text-[#006b20]" />
            </div>
          )}
          <span
            className={`text-xs truncate ${
              winnerIsA ? 'font-black text-[#006b20]' : 'font-semibold text-[#191c1c]'
            }`}
          >
            {match.teamA?.name ?? 'TBD'}
          </span>
        </div>
        <span className={`text-xs font-black ms-2 ${winnerIsA ? 'text-[#006b20]' : 'text-[#191c1c]'}`}>
          {scoreA ?? '-'}
        </span>
      </div>

      {/* Team B */}
      <div
        className={`flex items-center justify-between px-3 py-2 ${
          winnerIsB ? 'bg-emerald-50' : ''
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {match.teamB?.logoUrl ? (
            <img src={match.teamB.logoUrl} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#e8f5e9] flex items-center justify-center shrink-0">
              <Shield className="w-3 h-3 text-[#006b20]" />
            </div>
          )}
          <span
            className={`text-xs truncate ${
              winnerIsB ? 'font-black text-[#006b20]' : 'font-semibold text-[#191c1c]'
            }`}
          >
            {match.teamB?.name ?? 'TBD'}
          </span>
        </div>
        <span className={`text-xs font-black ms-2 ${winnerIsB ? 'text-[#006b20]' : 'text-[#191c1c]'}`}>
          {scoreB ?? '-'}
        </span>
      </div>
    </div>
  );
}

// ── Column rendering ─────────────────────────────────────────────────────────

interface BracketColumnProps {
  stageName: string;
  matches: Match[];
  isLast: boolean;
}

function BracketColumn({ stageName, matches, isLast }: BracketColumnProps) {
  return (
    <div className="flex flex-col items-center shrink-0">
      {/* Column Header */}
      <div className="mb-4 px-3 py-1.5 bg-[#006b20] text-white text-xs font-bold rounded-full shadow">
        {stageLabels[stageName] ?? stageName}
      </div>

      {/* Matches in this column */}
      <div
        className="flex flex-col justify-around h-full gap-6"
        style={{ minHeight: `${matches.length * 88 + (matches.length - 1) * 24}px` }}
      >
        {matches.map((m) => (
          <div key={m.id} className="flex items-center">
            <BracketMatch match={m} />
            {/* Connector line to next round */}
            {!isLast && (
              <div className="w-8 flex flex-col items-center self-stretch">
                <div className="flex-1 border-t-2 border-[#d0d8d2] mt-6 w-full" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Champion display ─────────────────────────────────────────────────────────

function ChampionSlot({ matches }: { matches: Match[] }) {
  const finalMatch = matches.find((m) => m.stage === 'Final');
  if (!finalMatch || finalMatch.status !== MatchStatus.Completed) return null;

  const scoreA = finalMatch.scoreA ?? 0;
  const scoreB = finalMatch.scoreB ?? 0;
  const champion =
    scoreA > scoreB ? finalMatch.teamA : scoreA < scoreB ? finalMatch.teamB : null;

  if (!champion) return null;

  return (
    <div className="flex flex-col items-center ms-4">
      <div className="mb-4 px-3 py-1.5 bg-yellow-500 text-white text-xs font-bold rounded-full shadow">
        البطل 🏆
      </div>
      <div className="w-32 flex flex-col items-center gap-2 bg-gradient-to-b from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center shadow">
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>
        <p className="text-xs font-black text-[#191c1c] text-center leading-tight">
          {champion.name}
        </p>
      </div>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────────────────────

export function BracketView({ matches, numberOfTeams }: BracketViewProps) {
  const applicableStages = getApplicableStages(numberOfTeams);
  const knockoutMatches = matches.filter(
    (m) => m.stage !== 'Group' && applicableStages.includes(m.stage)
  );

  if (knockoutMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 bg-[#f0f2f0] rounded-full flex items-center justify-center">
          <Trophy className="w-7 h-7 text-[#3e4a3c]/40" />
        </div>
        <p className="text-sm font-bold text-[#191c1c]">الكأس الإقصائي</p>
        <p className="text-xs text-[#3e4a3c]/60 max-w-xs">
          سيتم إنشاء الكأس الإقصائي بعد انتهاء دور المجموعات وتحديد المتأهلين.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f8f7] rounded-2xl border border-[#e1e3e1] p-6 overflow-x-auto">
      <div className="flex items-start gap-2 min-w-max">
        {applicableStages.map((stage, idx) => {
          const stageMatches = knockoutMatches.filter((m) => m.stage === stage);
          const isLast = idx === applicableStages.length - 1;

          return (
            <div key={stage} className="flex items-start gap-0">
              <BracketColumn
                stageName={stage}
                matches={stageMatches}
                isLast={isLast}
              />
              {/* SVG horizontal connector between columns */}
              {!isLast && (
                <div className="flex flex-col justify-around self-stretch pt-12">
                  {Array.from({ length: Math.ceil(stageMatches.length / 2) }).map((_, i) => (
                    <svg
                      key={i}
                      width="24"
                      height="80"
                      viewBox="0 0 24 80"
                      fill="none"
                      className="shrink-0"
                    >
                      <path
                        d="M0 20 H12 V60 H24"
                        stroke="#c8d8c8"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Champion Slot */}
        <ChampionSlot matches={knockoutMatches} />
      </div>
    </div>
  );
}
