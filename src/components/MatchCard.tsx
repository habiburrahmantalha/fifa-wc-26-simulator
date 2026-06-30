"use client";

import { getTeamGroupSummary } from "@/lib/group-info";
import { needsKnockoutTiebreaker } from "@/lib/bracket";
import { parseScorers } from "@/lib/scorers";
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
  align = "start",
  groupSummary,
}: {
  team: Team | null;
  label?: string;
  isWinner?: boolean;
  align?: "start" | "end" | "center";
  groupSummary?: string | null;
}) {
  const name = team?.nameEn ?? label ?? "TBD";
  const alignClass =
    align === "end"
      ? "justify-end text-right"
      : align === "center"
        ? "justify-center text-center"
        : "justify-start text-left";

  return (
    <div className={`min-w-0 ${align === "end" ? "text-right" : ""}`}>
      <div
        className={`flex min-w-0 items-center gap-1.5 sm:gap-2 ${alignClass} ${
          isWinner ? "font-semibold text-emerald-300" : "text-zinc-200"
        }`}
      >
        {team?.flag && (
          <img
            src={team.flag}
            alt=""
            className="h-4 w-6 shrink-0 rounded object-cover sm:h-5 sm:w-7"
          />
        )}
        <span className="truncate text-xs leading-tight sm:text-sm">{name}</span>
      </div>
      {groupSummary && (
        <p
          className={`mt-0.5 truncate text-[10px] leading-tight text-zinc-500 sm:text-[11px] ${
            align === "end" ? "text-right" : "text-left"
          }`}
        >
          {groupSummary}
        </p>
      )}
    </div>
  );
}

function ScorersList({
  scorers,
  align,
}: {
  scorers: string[];
  align: "left" | "right";
}) {
  if (scorers.length === 0) return null;
  return (
    <ul
      className={`mt-1 space-y-0.5 text-[10px] text-zinc-500 sm:text-[11px] ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {scorers.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
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

  const isKnockout = game.type !== "group";
  const homeGroupSummary =
    isKnockout && game.resolvedHomeId
      ? getTeamGroupSummary(
          game.resolvedHomeId,
          tournament.groups,
          tournament.qualification,
        )?.label
      : null;
  const awayGroupSummary =
    isKnockout && game.resolvedAwayId
      ? getTeamGroupSummary(
          game.resolvedAwayId,
          tournament.groups,
          tournament.qualification,
        )?.label
      : null;

  const homeScorers =
    game.finished && !game.isSimulated
      ? parseScorers(game.homeScorers).map((s) => s.raw)
      : [];
  const awayScorers =
    game.finished && !game.isSimulated
      ? parseScorers(game.awayScorers).map((s) => s.raw)
      : [];

  const pick = state.picks[game.id]?.outcome;
  const hasScore =
    (game.finished || pick != null) &&
    game.effectiveHomeScore != null &&
    game.effectiveAwayScore != null;
  const tiebreakerNeeded = needsKnockoutTiebreaker(
    game.type,
    game.effectiveHomeScore,
    game.effectiveAwayScore,
    pick,
  );
  const knockoutResolved =
    isKnockout &&
    hasScore &&
    (game.effectiveHomeScore !== game.effectiveAwayScore ||
      pick === "home" ||
      pick === "away");
  const isPlayed =
    game.finished &&
    !game.isSimulated &&
    !tiebreakerNeeded &&
    (!isKnockout || knockoutResolved);
  const canSimulateGroup =
    !isPlayed && Boolean(game.resolvedHomeId && game.resolvedAwayId);
  const canPickKnockoutWinner =
    isKnockout &&
    Boolean(game.resolvedHomeId && game.resolvedAwayId) &&
    (!hasScore || game.isSimulated || tiebreakerNeeded || !game.finished);

  const handlePick = (outcome: PickOutcome) => {
    if (pick === outcome) {
      clearPick(game.id);
    } else {
      setPick(game.id, outcome);
    }
  };

  const homeWin =
    hasScore &&
    (game.effectiveHomeScore! > game.effectiveAwayScore! || pick === "home");
  const awayWin =
    hasScore &&
    (game.effectiveAwayScore! > game.effectiveHomeScore! || pick === "away");
  const isDraw =
    hasScore &&
    game.effectiveHomeScore === game.effectiveAwayScore &&
    !pick;

  const scoreSuffix =
    isKnockout && isDraw && hasScore ? (
      <p className="text-[10px] text-amber-400/90">a.e.t.</p>
    ) : null;

  const scoreBlock = (
    <div className="shrink-0 px-1 text-center">
      {hasScore ? (
        <>
          <span
            className={`font-mono text-base sm:text-lg ${
              game.isSimulated ? "text-amber-400" : "text-white"
            }`}
          >
            {game.effectiveHomeScore}–{game.effectiveAwayScore}
          </span>
          {scoreSuffix}
        </>
      ) : (
        <span className="text-xs text-zinc-500 sm:text-sm">vs</span>
      )}
      {game.isSimulated && (
        <p className="text-[10px] text-amber-500/80">simulated</p>
      )}
      {pick && isKnockout && game.effectiveHomeScore === game.effectiveAwayScore && (
        <p className="text-[10px] text-emerald-400">pens</p>
      )}
    </div>
  );

  return (
    <div
      className={`overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60 ${
        compact ? "p-3" : "p-3 sm:p-4"
      }`}
    >
      {!compact && (
        <div className="mb-3 flex flex-col gap-0.5 text-xs text-zinc-500 sm:mb-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium text-zinc-400">
            {game.type === "group" ? `Group ${game.group}` : game.group} · MD
            {game.matchday}
          </span>
          <span className="text-[11px] sm:text-xs">{game.localDate}</span>
        </div>
      )}

      {tiebreakerNeeded && (
        <div className="mb-3 rounded-md border border-amber-700/50 bg-amber-950/40 px-3 py-2 text-center text-xs text-amber-200">
          Level after extra time — pick the penalty shootout winner to advance
        </div>
      )}

      {/* Mobile: stacked teams */}
      <div className="space-y-2 sm:hidden">
        <div className="flex items-start justify-between gap-2">
          <TeamBadge
            team={homeTeam}
            label={game.homeTeamLabel}
            isWinner={homeWin || pick === "home"}
            groupSummary={homeGroupSummary}
          />
          {hasScore && (
            <span
              className={`shrink-0 font-mono text-sm ${
                game.isSimulated ? "text-amber-400" : "text-white"
              }`}
            >
              {game.effectiveHomeScore}
            </span>
          )}
        </div>
        <ScorersList scorers={homeScorers} align="left" />
        {!hasScore && (
          <div className="text-center text-xs text-zinc-500">vs</div>
        )}
        <div className="flex items-start justify-between gap-2">
          <TeamBadge
            team={awayTeam}
            label={game.awayTeamLabel}
            isWinner={awayWin || pick === "away"}
            groupSummary={awayGroupSummary}
          />
          {hasScore && (
            <span
              className={`shrink-0 font-mono text-sm ${
                game.isSimulated ? "text-amber-400" : "text-white"
              }`}
            >
              {game.effectiveAwayScore}
            </span>
          )}
        </div>
        <ScorersList scorers={awayScorers} align="left" />
        {game.isSimulated && (
          <p className="text-center text-[10px] text-amber-500/80">simulated</p>
        )}
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-start sm:gap-3">
        <div>
          <TeamBadge
            team={homeTeam}
            label={game.homeTeamLabel}
            isWinner={homeWin || pick === "home"}
            groupSummary={homeGroupSummary}
          />
          <ScorersList scorers={homeScorers} align="left" />
        </div>
        {scoreBlock}
        <div>
          <TeamBadge
            team={awayTeam}
            label={game.awayTeamLabel}
            isWinner={awayWin || pick === "away"}
            align="end"
            groupSummary={awayGroupSummary}
          />
          <ScorersList scorers={awayScorers} align="right" />
        </div>
      </div>

      {canSimulateGroup && game.type === "group" && (
        <div className="mt-3 grid grid-cols-3 gap-1.5 sm:flex sm:gap-2">
          {(["home", "draw", "away"] as PickOutcome[]).map((o) => (
            <button
              key={o}
              onClick={() => handlePick(o)}
              className={`rounded-md px-2 py-2 text-xs font-medium transition-colors sm:flex-1 sm:py-1.5 ${
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

      {canPickKnockoutWinner && (
        <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:gap-2">
          <button
            onClick={() => handlePick("home")}
            title={homeTeam?.nameEn}
            className={`rounded-md px-2 py-2 text-xs font-medium sm:flex-1 sm:py-1.5 ${
              pick === "home"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            <span className="line-clamp-2 sm:line-clamp-none">
              <span className="sm:hidden">
                {homeTeam?.nameEn?.split(" ").slice(-1)[0] ?? "Home"}{" "}
                {tiebreakerNeeded ? "on pens" : "wins"}
              </span>
              <span className="hidden sm:inline">
                {homeTeam?.nameEn ?? "Home"}{" "}
                {tiebreakerNeeded ? "wins on pens" : "wins"}
              </span>
            </span>
          </button>
          <button
            onClick={() => handlePick("away")}
            title={awayTeam?.nameEn}
            className={`rounded-md px-2 py-2 text-xs font-medium sm:flex-1 sm:py-1.5 ${
              pick === "away"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            <span className="line-clamp-2 sm:line-clamp-none">
              <span className="sm:hidden">
                {awayTeam?.nameEn?.split(" ").slice(-1)[0] ?? "Away"}{" "}
                {tiebreakerNeeded ? "on pens" : "wins"}
              </span>
              <span className="hidden sm:inline">
                {awayTeam?.nameEn ?? "Away"}{" "}
                {tiebreakerNeeded ? "wins on pens" : "wins"}
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
