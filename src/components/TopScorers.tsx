"use client";

import { buildGoalLeaderboard } from "@/lib/scorers";
import type { ResolvedGame } from "@/lib/types";
import { useSimulation } from "@/hooks/useSimulation";

export function TopScorers() {
  const { tournament } = useSimulation();
  if (!tournament) return null;

  const leaderboard = buildGoalLeaderboard(tournament.games).slice(0, 10);
  if (leaderboard.length === 0) return null;

  return (
    <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="mb-1 text-sm font-semibold text-emerald-300">
        Top goalscorers
      </h3>
      <p className="mb-3 text-xs text-zinc-500">
        Goals from live match data. Assists are not provided by the API.
      </p>
      <ol className="space-y-1.5">
        {leaderboard.map((entry, i) => (
          <li
            key={entry.player}
            className="flex items-center justify-between text-sm text-zinc-200"
          >
            <span className="truncate">
              <span className="mr-2 text-zinc-500">{i + 1}.</span>
              {entry.player}
              {entry.penalties > 0 && (
                <span className="ml-1 text-[10px] text-zinc-500">
                  ({entry.penalties} pen)
                </span>
              )}
            </span>
            <span className="ml-2 shrink-0 font-semibold text-emerald-400">
              {entry.goals}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
