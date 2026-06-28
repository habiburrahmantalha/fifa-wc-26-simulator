import {
  getMatchWinner,
  resolveSlotLabel,
} from "./bracket";
import {
  buildGroupTables,
  computeQualification,
  isGroupStageComplete,
} from "./qualification";
import type {
  Game,
  PickOutcome,
  RawApiGame,
  RawApiGroup,
  RawApiTeam,
  ResolvedGame,
  SimulationPick,
  QualificationResult,
  Team,
  TournamentState,
} from "./types";
import { parseBool, parseScore, parseTeamId } from "./worldcup-api";

function normalizeGame(raw: RawApiGame): Game {
  return {
    id: raw.id,
    homeTeamId: parseTeamId(raw.home_team_id),
    awayTeamId: parseTeamId(raw.away_team_id),
    homeTeamLabel: raw.home_team_label,
    awayTeamLabel: raw.away_team_label,
    homeScore: parseScore(raw.home_score),
    awayScore: parseScore(raw.away_score),
    finished: parseBool(raw.finished),
    type: raw.type as Game["type"],
    group: raw.group,
    matchday: Number(raw.matchday),
    localDate: raw.local_date,
    homeTeamName: raw.home_team_name_en,
    awayTeamName: raw.away_team_name_en,
  };
}

function normalizeTeam(raw: RawApiTeam): Team {
  return {
    id: raw.id,
    nameEn: raw.name_en,
    nameFa: raw.name_fa,
    flag: raw.flag,
    fifaCode: raw.fifa_code,
    group: raw.groups as Team["group"],
  };
}

function pickToScores(outcome: PickOutcome): { home: number; away: number } {
  if (outcome === "home") return { home: 1, away: 0 };
  if (outcome === "away") return { home: 0, away: 1 };
  return { home: 0, away: 0 };
}

function applyPicksToGames(
  games: Game[],
  picks: Record<string, SimulationPick>,
): Game[] {
  return games.map((game) => {
    const pick = picks[game.id]?.outcome;
    if (game.finished && game.homeScore != null && game.awayScore != null) {
      return game;
    }
    if (pick) {
      const scores = pickToScores(pick);
      return { ...game, homeScore: scores.home, awayScore: scores.away };
    }
    return { ...game, homeScore: null, awayScore: null };
  });
}

function isBracketSlotLabel(label?: string): boolean {
  if (!label) return false;
  return /^(Winner Group|Runner-up Group|3rd Group|Winner Match|Loser Match)/.test(
    label,
  );
}

function resolveRef(
  ref: string,
  winnerByMatchId: Map<string, string>,
  gamesById: Map<string, ResolvedGame>,
): string | null {
  const winMatch = ref.match(/^__match_(\d+)__$/);
  if (winMatch) return winnerByMatchId.get(winMatch[1]) ?? null;

  const loseMatch = ref.match(/^__loser_(\d+)__$/);
  if (loseMatch) {
    const winner = winnerByMatchId.get(loseMatch[1]);
    const src = gamesById.get(loseMatch[1]);
    if (!winner || !src) return null;
    return src.resolvedHomeId === winner
      ? src.resolvedAwayId
      : src.resolvedHomeId;
  }

  return ref;
}

function resolveTeamSlot(
  teamId: string | null,
  label: string | undefined,
  qual: QualificationResult | null,
  matchId: string,
  winnerByMatchId: Map<string, string>,
  gamesById: Map<string, ResolvedGame>,
  finished: boolean,
): string | null {
  if (label && isBracketSlotLabel(label)) {
    const ref = resolveSlotLabel(label, qual, matchId);
    if (ref) {
      const resolved = resolveRef(ref, winnerByMatchId, gamesById);
      if (resolved) return resolved;
    }
    // Ignore stale/wrong placeholder IDs from the API for unresolved slots
    if (!finished) return null;
  }

  if (teamId) return teamId;
  if (!label) return null;

  const ref = resolveSlotLabel(label, qual, matchId);
  if (!ref) return null;
  return resolveRef(ref, winnerByMatchId, gamesById);
}

function resolveAllGames(
  games: Game[],
  picks: Record<string, SimulationPick>,
  qual: QualificationResult | null,
): ResolvedGame[] {
  const sorted = [...games].sort((a, b) => Number(a.id) - Number(b.id));
  const winnerByMatchId = new Map<string, string>();
  const gamesById = new Map<string, ResolvedGame>();
  const resolved: ResolvedGame[] = [];

  for (const game of sorted) {
    const pick = picks[game.id]?.outcome;
    const isSimulated = Boolean(pick && !game.finished);

    const partial: ResolvedGame = {
      ...game,
      resolvedHomeId: null,
      resolvedAwayId: null,
      effectiveHomeScore:
        game.finished || pick ? game.homeScore : null,
      effectiveAwayScore:
        game.finished || pick ? game.awayScore : null,
      isSimulated,
      winnerId: null,
    };
    gamesById.set(game.id, partial);

    const homeId = resolveTeamSlot(
      game.homeTeamId,
      game.homeTeamLabel,
      qual,
      game.id,
      winnerByMatchId,
      gamesById,
      game.finished,
    );
    const awayId = resolveTeamSlot(
      game.awayTeamId,
      game.awayTeamLabel,
      qual,
      game.id,
      winnerByMatchId,
      gamesById,
      game.finished,
    );

    const winnerId = getMatchWinner(
      homeId,
      awayId,
      game.homeScore,
      game.awayScore,
      pick,
    );

    const full: ResolvedGame = {
      ...partial,
      resolvedHomeId: homeId,
      resolvedAwayId: awayId,
      winnerId,
    };

    resolved.push(full);
    gamesById.set(game.id, full);
    if (winnerId) winnerByMatchId.set(game.id, winnerId);
  }

  return resolved;
}

export function buildTournamentState(
  rawGames: RawApiGame[],
  rawTeams: RawApiTeam[],
  _rawGroups: RawApiGroup[],
  picks: Record<string, SimulationPick>,
): TournamentState {
  const teams: Record<string, Team> = {};
  for (const t of rawTeams) teams[t.id] = normalizeTeam(t);

  const baseGames = rawGames.map(normalizeGame);
  const effectiveGames = applyPicksToGames(baseGames, picks);
  const groupStageComplete = isGroupStageComplete(effectiveGames);
  const groups = buildGroupTables(teams, effectiveGames);
  const qualification = groupStageComplete
    ? computeQualification(groups)
    : null;

  let resolved = resolveAllGames(effectiveGames, picks, qualification);

  if (qualification) {
    resolved = resolveAllGames(
      resolved.map((g) => ({
        ...g,
        homeTeamId: g.resolvedHomeId,
        awayTeamId: g.resolvedAwayId,
        homeScore: g.effectiveHomeScore,
        awayScore: g.effectiveAwayScore,
      })),
      picks,
      qualification,
    );
  }

  const finalGame = resolved.find((g) => g.type === "final");
  const championId = finalGame?.winnerId ?? null;

  return {
    teams,
    games: resolved,
    groups,
    qualification,
    groupStageComplete,
    championId,
  };
}
