// ─────────────────────────────────────────────────────────────────────────────
// GroupTable — Displays group standings with all stats columns
// MP, W, D, L, GF, GA, GD, Pts with proper tie-breaker ordering
// ─────────────────────────────────────────────────────────────────────────────

import { Shield } from 'lucide-react';
import type { Group, TeamStanding } from '../types/tournament';

interface GroupTableProps {
  group: Group;
}

function TeamRow({
  team,
  rank,
  qualifies,
}: {
  team: TeamStanding;
  rank: number;
  qualifies: boolean;
}) {
  return (
    <tr
      className={`border-b border-[#f0f2f0] last:border-0 transition-colors hover:bg-[#f6f8f7] ${
        qualifies ? 'bg-emerald-50/60' : ''
      }`}
    >
      {/* Rank */}
      <td className="px-3 py-3 text-center">
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
            qualifies
              ? 'bg-[#006b20] text-white'
              : 'bg-[#f0f2f0] text-[#3e4a3c]'
          }`}
        >
          {rank}
        </span>
      </td>

      {/* Team */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt={team.name}
              className="w-6 h-6 rounded-full object-cover border border-[#e1e3e1]"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#e8f5e9] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#006b20]" />
            </div>
          )}
          <span className="text-sm font-bold text-[#191c1c] truncate max-w-[120px]">
            {team.name}
          </span>
          {qualifies && (
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
              تأهل
            </span>
          )}
        </div>
      </td>

      {/* Stats */}
      <td className="px-3 py-3 text-center text-sm text-[#3e4a3c]">{team.played}</td>
      <td className="px-3 py-3 text-center text-sm font-semibold text-emerald-600">{team.won}</td>
      <td className="px-3 py-3 text-center text-sm text-[#3e4a3c]">{team.drawn}</td>
      <td className="px-3 py-3 text-center text-sm font-semibold text-red-500">{team.lost}</td>
      <td className="px-3 py-3 text-center text-sm text-[#3e4a3c]">{team.goalsFor}</td>
      <td className="px-3 py-3 text-center text-sm text-[#3e4a3c]">{team.goalsAgainst}</td>
      <td className="px-3 py-3 text-center text-sm font-semibold">
        <span
          className={
            team.goalDifference > 0
              ? 'text-emerald-600'
              : team.goalDifference < 0
              ? 'text-red-500'
              : 'text-[#3e4a3c]'
          }
        >
          {team.goalDifference > 0 ? '+' : ''}
          {team.goalDifference}
        </span>
      </td>
      <td className="px-3 py-3 text-center">
        <span className="text-sm font-black text-[#191c1c] bg-[#f0f2f0] px-2 py-0.5 rounded-md">
          {team.points}
        </span>
      </td>
    </tr>
  );
}

export function GroupTable({ group }: GroupTableProps) {
  // Sort by: Points → GD → GF
  const sorted = [...group.teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <div className="bg-white rounded-2xl border border-[#e1e3e1] shadow-sm overflow-hidden">
      {/* Group Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#003d12] to-[#006b20] flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
          <Shield className="w-3.5 h-3.5 text-white" />
        </div>
        <h4 className="text-white font-bold text-sm">{group.name}</h4>
        <span className="ms-auto text-white/60 text-[11px]">
          أعلى 2 فرق تتأهل
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-[#e1e3e1] bg-[#f6f8f7]">
              <th className="px-3 py-2.5 text-center text-[11px] font-bold text-[#3e4a3c]/60 uppercase tracking-wider w-10">
                #
              </th>
              <th className="px-3 py-2.5 text-start text-[11px] font-bold text-[#3e4a3c]/60 uppercase tracking-wider">
                الفريق
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] font-bold text-[#3e4a3c]/60 uppercase tracking-wider">
                لعب
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] font-bold text-[#3e4a3c]/60 uppercase tracking-wider">
                فاز
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] font-bold text-[#3e4a3c]/60 uppercase tracking-wider">
                تعادل
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] font-bold text-[#3e4a3c]/60 uppercase tracking-wider">
                خسر
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] font-bold text-[#3e4a3c]/60 uppercase tracking-wider">
                له
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] font-bold text-[#3e4a3c]/60 uppercase tracking-wider">
                عليه
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] font-bold text-[#3e4a3c]/60 uppercase tracking-wider">
                فرق
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] font-bold text-[#3e4a3c]/60 uppercase tracking-wider">
                نقاط
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, idx) => (
              <TeamRow
                key={team.id}
                team={team}
                rank={idx + 1}
                qualifies={idx < 2}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-[#f0f2f0] flex items-center gap-4 bg-[#f6f8f7]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-300" />
          <span className="text-[10px] text-[#3e4a3c]/70 font-medium">متأهل للدور القادم</span>
        </div>
      </div>
    </div>
  );
}
