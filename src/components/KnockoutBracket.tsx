"use client";

import type { ResolvedGame } from "@/lib/types";
import { MatchCard } from "./MatchCard";

interface KnockoutBracketProps {
  games: ResolvedGame[];
}

const ROUNDS: { key: string; label: string; types: string[] }[] = [
  { key: "r32", label: "Round of 32", types: ["r32"] },
  { key: "r16", label: "Round of 16", types: ["r16"] },
  { key: "qf", label: "Quarter-finals", types: ["qf"] },
  { key: "sf", label: "Semi-finals", types: ["sf"] },
  { key: "final", label: "Final", types: ["third", "final"] },
];

export function KnockoutBracket({ games }: KnockoutBracketProps) {
  const knockout = games.filter((g) => g.type !== "group");

  return (
    <div className="space-y-8">
      {ROUNDS.map((round) => {
        const roundGames = knockout
          .filter((g) => round.types.includes(g.type))
          .sort((a, b) => Number(a.id) - Number(b.id));

        if (roundGames.length === 0) return null;

        return (
          <section key={round.key}>
            <h3 className="mb-4 text-lg font-semibold text-emerald-300">
              {round.label}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {roundGames.map((g) => (
                <div key={g.id}>
                  <p className="mb-1 text-xs text-zinc-500">Match {g.id}</p>
                  <MatchCard game={g} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
