"use client";

import type { ResolvedGame } from "@/lib/types";
import { MatchCard } from "./MatchCard";
import { TopScorers } from "./TopScorers";

interface FixturesListProps {
  games: ResolvedGame[];
}

const TYPE_ORDER: Record<string, number> = {
  group: 0,
  r32: 1,
  r16: 2,
  qf: 3,
  sf: 4,
  third: 5,
  final: 6,
};

export function FixturesList({ games }: FixturesListProps) {
  const playable = games
    .filter((g) => !g.finished || g.isSimulated)
    .filter((g) => g.resolvedHomeId && g.resolvedAwayId)
    .sort((a, b) => {
      const typeDiff = (TYPE_ORDER[a.type] ?? 0) - (TYPE_ORDER[b.type] ?? 0);
      if (typeDiff !== 0) return typeDiff;
      return Number(a.id) - Number(b.id);
    });

  if (playable.length === 0) {
    return (
      <p className="py-8 text-center text-zinc-500">
        No simulatable fixtures right now. Complete group stage picks first.
      </p>
    );
  }

  return (
    <>
      <TopScorers />
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {playable.map((g) => (
          <MatchCard key={g.id} game={g} />
        ))}
      </div>
    </>
  );
}
