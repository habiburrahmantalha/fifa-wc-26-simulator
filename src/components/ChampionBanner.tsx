"use client";

import type { Team } from "@/lib/types";

interface ChampionBannerProps {
  champion: Team;
}

export function ChampionBanner({ champion }: ChampionBannerProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <div className="flex items-center justify-center gap-4 rounded-xl border border-yellow-500/40 bg-gradient-to-r from-yellow-950/60 to-amber-950/40 px-6 py-5">
        <img src={champion.flag} alt="" className="h-12 w-16 rounded object-cover shadow" />
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-yellow-400">
            Simulated Champion
          </p>
          <p className="text-2xl font-bold text-white">{champion.nameEn}</p>
        </div>
      </div>
    </div>
  );
}
