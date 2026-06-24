"use client";

import type { GroupTable, Team } from "@/lib/types";
import { MatchCard } from "./MatchCard";
import type { ResolvedGame } from "@/lib/types";

interface GroupStandingsProps {
  groups: GroupTable[];
  teams: Record<string, Team>;
  games: ResolvedGame[];
}

function statusBadge(status: string) {
  switch (status) {
    case "qualified":
      return (
        <span className="rounded bg-emerald-900/60 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
          Q
        </span>
      );
    case "possible":
      return (
        <span className="rounded bg-amber-900/60 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
          ?
        </span>
      );
    case "eliminated":
      return (
        <span className="rounded bg-red-900/40 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
          OUT
        </span>
      );
    default:
      return null;
  }
}

export function GroupStandings({ groups, teams, games }: GroupStandingsProps) {
  const sorted = [...groups].sort((a, b) => a.letter.localeCompare(b.letter));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sorted.map((group) => {
        const groupGames = games.filter(
          (g) => g.type === "group" && g.group === group.letter,
        );
        const unplayed = groupGames.filter((g) => !g.finished || g.isSimulated);

        return (
          <div
            key={group.letter}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden"
          >
            <div className="border-b border-zinc-800 bg-emerald-950/30 px-4 py-2">
              <h3 className="font-bold text-emerald-300">Group {group.letter}</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-500">
                  <th className="px-3 py-2">#</th>
                  <th className="px-1 py-2">Team</th>
                  <th className="px-1 py-2 text-center">P</th>
                  <th className="px-1 py-2 text-center">GD</th>
                  <th className="px-3 py-2 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {group.standings.map((row) => {
                  const team = teams[row.teamId];
                  return (
                    <tr
                      key={row.teamId}
                      className="border-t border-zinc-800/60 text-zinc-200"
                    >
                      <td className="px-3 py-2 text-zinc-400">{row.position}</td>
                      <td className="px-1 py-2">
                        <div className="flex items-center gap-1.5">
                          {team?.flag && (
                            <img
                              src={team.flag}
                              alt=""
                              className="h-4 w-5 rounded object-cover"
                            />
                          )}
                          <span className="truncate text-xs">{team?.nameEn}</span>
                          {statusBadge(row.status)}
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center text-zinc-400">
                        {row.mp}
                      </td>
                      <td className="px-1 py-2 text-center">
                        {row.gd > 0 ? `+${row.gd}` : row.gd}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold">
                        {row.pts}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {unplayed.length > 0 && (
              <div className="space-y-2 border-t border-zinc-800 p-3">
                <p className="text-xs font-medium text-zinc-500">
                  Remaining fixtures
                </p>
                {unplayed.map((g) => (
                  <MatchCard key={g.id} game={g} compact />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
