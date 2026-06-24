"use client";

import type { PickOutcome, ResolvedGame, Team } from "@/lib/types";
import { useSimulation } from "@/hooks/useSimulation";

interface MatchCardProps {
  game: ResolvedGame;
  compact?: boolean;
}

function TeamBadge({
  team,
  label,
  isWinner,
}: {
  team: Team | null;
  label?: string;
  isWinner?: boolean;
}) {
  const name = team?.nameEn ?? label ?? "TBD";
  return (
    <div
      className={`flex items-center gap-2 ${isWinner ? "font-semibold text-emerald-300" : "text-zinc-200"}`}
    >
      {team?.flag && (
        <img src={team.flag} alt="" className="h-5 w-7 rounded object-cover" />
      )}
      <span className="truncate text-sm">{name}</span>
    </div>
  );
}

export function MatchCard({ game, compact }: MatchCardProps) {
  const { tournament, setPick, clearPick, state } = useSimulation();
  if (!tournament) return null;

  const homeTeam = game.resolvedHomeId
    ? tournament.teams[game.resolvedHomeId]
    : null;
  const awayTeam = game.resolvedAwayId
    ? tournament.teams[game.resolvedAwayId]
    : null;

  const pick = state.picks[game.id]?.outcome;
  const hasScore =
    (game.finished || pick != null) &&
    game.effectiveHomeScore != null &&
    game.effectiveAwayScore != null;
  const isPlayed = game.finished && !game.isSimulated;
  const canSimulate =
    !isPlayed && Boolean(game.resolvedHomeId && game.resolvedAwayId);

  const handlePick = (outcome: PickOutcome) => {
    if (pick === outcome) {
      clearPick(game.id);
    } else {
      setPick(game.id, outcome);
    }
  };

  const homeWin =
    hasScore && game.effectiveHomeScore! > game.effectiveAwayScore!;
  const awayWin =
    hasScore && game.effectiveAwayScore! > game.effectiveHomeScore!;
  const isDraw =
    hasScore && game.effectiveHomeScore === game.effectiveAwayScore;

  return (
    <div
      className={`rounded-lg border border-zinc-800 bg-zinc-900/60 ${compact ? "p-3" : "p-4"}`}
    >
      {!compact && (
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
          <span>
            {game.type === "group" ? `Group ${game.group}` : game.group} · MD
            {game.matchday}
          </span>
          <span>{game.localDate}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <TeamBadge
          team={homeTeam}
          label={game.homeTeamLabel}
          isWinner={homeWin || pick === "home"}
        />
        <div className="shrink-0 text-center">
          {hasScore ? (
            <span
              className={`font-mono text-lg ${game.isSimulated ? "text-amber-400" : "text-white"}`}
            >
              {game.effectiveHomeScore} – {game.effectiveAwayScore}
            </span>
          ) : (
            <span className="text-zinc-500">vs</span>
          )}
          {game.isSimulated && (
            <p className="text-[10px] text-amber-500/80">simulated</p>
          )}
        </div>
        <TeamBadge
          team={awayTeam}
          label={game.awayTeamLabel}
          isWinner={awayWin || pick === "away"}
        />
      </div>

      {canSimulate && game.type === "group" && (
        <div className="mt-3 flex gap-2">
          {(["home", "draw", "away"] as PickOutcome[]).map((o) => (
            <button
              key={o}
              onClick={() => handlePick(o)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                pick === o
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {o === "home" ? "Home" : o === "away" ? "Away" : "Draw"}
            </button>
          ))}
        </div>
      )}

      {canSimulate && game.type !== "group" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => handlePick("home")}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
              pick === "home"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {homeTeam?.nameEn ?? "Home"} wins
          </button>
          <button
            onClick={() => handlePick("away")}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
              pick === "away"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {awayTeam?.nameEn ?? "Away"} wins
          </button>
        </div>
      )}

      {isDraw && game.type !== "group" && !pick && (
        <p className="mt-2 text-center text-xs text-zinc-500">
          Draw — pick a winner to advance
        </p>
      )}
    </div>
  );
}
