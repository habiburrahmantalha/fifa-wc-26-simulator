import type { Game, GroupLetter, GroupStanding } from "./types";

export const GROUP_LETTERS: GroupLetter[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];

export interface TeamStats {
  teamId: string;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

function emptyStats(teamId: string): TeamStats {
  return { teamId, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
}

function applyResult(
  stats: TeamStats,
  gf: number,
  ga: number,
): TeamStats {
  const won = gf > ga;
  const draw = gf === ga;
  return {
    ...stats,
    mp: stats.mp + 1,
    w: stats.w + (won ? 1 : 0),
    d: stats.d + (draw ? 1 : 0),
    l: stats.l + (!won && !draw ? 1 : 0),
    gf: stats.gf + gf,
    ga: stats.ga + ga,
    gd: stats.gd + gf - ga,
    pts: stats.pts + (won ? 3 : draw ? 1 : 0),
  };
}

function h2hStats(
  teamIds: string[],
  games: Game[],
  group: GroupLetter,
): Map<string, TeamStats> {
  const map = new Map<string, TeamStats>();
  for (const id of teamIds) map.set(id, emptyStats(id));

  for (const game of games) {
    if (game.group !== group || game.type !== "group") continue;
    if (game.homeScore == null || game.awayScore == null) continue;
    if (!game.homeTeamId || !game.awayTeamId) continue;
    if (!teamIds.includes(game.homeTeamId) || !teamIds.includes(game.awayTeamId))
      continue;

    map.set(
      game.homeTeamId,
      applyResult(map.get(game.homeTeamId)!, game.homeScore, game.awayScore),
    );
    map.set(
      game.awayTeamId,
      applyResult(map.get(game.awayTeamId)!, game.awayScore, game.homeScore),
    );
  }
  return map;
}

function compareStats(a: TeamStats, b: TeamStats): number {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return 0;
}

function compareH2H(a: TeamStats, b: TeamStats): number {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return 0;
}

function rankGroupTeams(
  statsMap: Map<string, TeamStats>,
  games: Game[],
  group: GroupLetter,
): TeamStats[] {
  const teams = [...statsMap.values()];

  const byPts = new Map<number, TeamStats[]>();
  for (const t of teams) {
    const list = byPts.get(t.pts) ?? [];
    list.push(t);
    byPts.set(t.pts, list);
  }

  const ranked: TeamStats[] = [];
  const sortedPts = [...byPts.keys()].sort((a, b) => b - a);

  for (const pts of sortedPts) {
    const tied = byPts.get(pts)!;
    if (tied.length === 1) {
      ranked.push(tied[0]);
      continue;
    }

    const tiedIds = tied.map((t) => t.teamId);
    const h2h = h2hStats(tiedIds, games, group);
    const h2hSorted = tiedIds
      .map((id) => h2h.get(id)!)
      .sort(compareH2H);

    if (h2hSorted.some((s, i) => i > 0 && compareH2H(h2hSorted[i - 1], s) !== 0)) {
      ranked.push(...h2hSorted);
      continue;
    }

    tied.sort((a, b) => compareStats(a, b));
    ranked.push(...tied);
  }

  return ranked;
}

export function computeGroupStandings(
  group: GroupLetter,
  teamIds: string[],
  games: Game[],
): GroupStanding[] {
  const statsMap = new Map<string, TeamStats>();
  for (const id of teamIds) statsMap.set(id, emptyStats(id));

  for (const game of games) {
    if (game.group !== group || game.type !== "group") continue;
    if (game.homeScore == null || game.awayScore == null) continue;
    if (!game.homeTeamId || !game.awayTeamId) continue;

    statsMap.set(
      game.homeTeamId,
      applyResult(statsMap.get(game.homeTeamId)!, game.homeScore, game.awayScore),
    );
    statsMap.set(
      game.awayTeamId,
      applyResult(statsMap.get(game.awayTeamId)!, game.awayScore, game.homeScore),
    );
  }

  const ranked = rankGroupTeams(statsMap, games, group);
  const allGroupGamesDone = games
    .filter((g) => g.group === group && g.type === "group")
    .every((g) => g.homeScore != null && g.awayScore != null);

  return ranked.map((s, i) => {
    let status: GroupStanding["status"] = "pending";
    if (allGroupGamesDone) {
      if (i < 2) status = "qualified";
      else if (i === 2) status = "possible";
      else status = "eliminated";
    } else if (i < 2 && s.mp >= 2 && ranked.length > 2) {
      const third = ranked[2];
      if (s.pts > third.pts || (s.pts === third.pts && s.gd > third.gd)) {
        status = "qualified";
      }
    }
    return { ...s, position: i + 1, status };
  });
}

export function compareThirdPlace(a: TeamStats, b: TeamStats): number {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return 0;
}
