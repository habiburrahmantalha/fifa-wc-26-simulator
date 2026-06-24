"use client";

import { useSimulation } from "@/hooks/useSimulation";

export function TournamentHeader() {
  const { state, tournament, refresh, reset } = useSimulation();

  const phase = tournament?.groupStageComplete ? "Knockout Stage" : "Group Stage";

  return (
    <header className="border-b border-emerald-900/40 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            FIFA World Cup 2026 Simulator
          </h1>
          <p className="text-sm text-zinc-400">
            Live data from worldcup26.ir · Pick winners to simulate the rest
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-900/50 px-3 py-1 text-xs font-medium text-emerald-300">
            {phase}
          </span>
          {state.lastUpdated && (
            <span className="hidden text-xs text-zinc-500 sm:inline">
              Updated {state.lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => refresh()}
            disabled={state.loading}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
          >
            {state.loading ? "Loading…" : "Refresh"}
          </button>
          <button
            onClick={reset}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}
