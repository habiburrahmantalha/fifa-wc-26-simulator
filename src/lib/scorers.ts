import type { Game } from "./types";

export interface GoalScorer {
  raw: string;
  player: string;
  isPenalty: boolean;
  isOwnGoal: boolean;
}

export interface PlayerGoalStats {
  player: string;
  goals: number;
  penalties: number;
  ownGoals: number;
}

export function parseScorers(raw: string | null | undefined): GoalScorer[] {
  if (!raw || raw === "null") return [];

  const normalized = raw
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");

  let entries: string[] = [];
  try {
    const parsed = JSON.parse(
      normalized.startsWith("[") ? normalized : `[${normalized}]`,
    );
    if (Array.isArray(parsed)) {
      entries = parsed.map(String);
    }
  } catch {
    const matches = normalized.match(/"([^"]+)"/g);
    if (matches) entries = matches.map((m) => m.slice(1, -1));
  }

  return entries.map((entry) => {
    const isOwnGoal = /\(OG\)|\(og\)/i.test(entry);
    const isPenalty = /\(p\)/i.test(entry);
    const player = entry
      .replace(/\d+\+?\d*'/g, "")
      .replace(/\(OG\)|\(og\)|\(p\)/gi, "")
      .trim();
    return { raw: entry, player, isPenalty, isOwnGoal };
  });
}

export function buildGoalLeaderboard(games: Game[]): PlayerGoalStats[] {
  const map = new Map<string, PlayerGoalStats>();

  for (const game of games) {
    if (!game.finished || game.homeScore == null) continue;

    const add = (scorers: GoalScorer[]) => {
      for (const s of scorers) {
        if (!s.player || s.isOwnGoal) continue;
        const cur = map.get(s.player) ?? {
          player: s.player,
          goals: 0,
          penalties: 0,
          ownGoals: 0,
        };
        cur.goals += 1;
        if (s.isPenalty) cur.penalties += 1;
        map.set(s.player, cur);
      }
    };

    add(parseScorers(game.homeScorers));
    add(parseScorers(game.awayScorers));
  }

  return [...map.values()].sort((a, b) => b.goals - a.goals || a.player.localeCompare(b.player));
}
