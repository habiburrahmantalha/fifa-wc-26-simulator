"use client";

import { useState } from "react";
import { ChampionBanner } from "@/components/ChampionBanner";
import { FixturesList } from "@/components/FixturesList";
import { GroupStandings } from "@/components/GroupStandings";
import { KnockoutBracket } from "@/components/KnockoutBracket";
import { TournamentHeader } from "@/components/TournamentHeader";
import { useSimulation } from "@/hooks/useSimulation";

type Tab = "groups" | "fixtures" | "knockout";

export default function SimulatorPage() {
  const { state, tournament } = useSimulation();
  const [tab, setTab] = useState<Tab>("groups");

  if (state.loading && !tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading tournament data…
      </div>
    );
  }

  if (state.error && !tournament) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 text-red-400">
        <p>{state.error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!tournament) return null;

  const champion = tournament.championId
    ? tournament.teams[tournament.championId]
    : null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "groups", label: "Groups" },
    { id: "fixtures", label: "Fixtures" },
    { id: "knockout", label: "Knockout" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <TournamentHeader />
      {champion && <ChampionBanner champion={champion} />}

      <div className="mx-auto max-w-7xl px-4 py-6">
        <nav className="mb-6 flex gap-2 border-b border-zinc-800 pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-emerald-700 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === "groups" && (
          <GroupStandings
            groups={tournament.groups}
            teams={tournament.teams}
            games={tournament.games}
          />
        )}
        {tab === "fixtures" && <FixturesList games={tournament.games} />}
        {tab === "knockout" && (
          <>
            {!tournament.groupStageComplete && (
              <p className="mb-4 rounded-lg border border-amber-800/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
                Group stage still in progress. Knockout slots will fill in as
                you simulate remaining group matches.
              </p>
            )}
            <KnockoutBracket games={tournament.games} />
          </>
        )}
      </div>
    </div>
  );
}
