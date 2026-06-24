import annexC from "@/data/annex-c-combinations.json";
import type { GroupLetter, QualificationResult } from "./types";

type AnnexCMap = Record<string, Record<string, string>>;

const combinations = annexC as AnnexCMap;

const WINNER_SLOTS: Record<string, GroupLetter> = {
  "Winner Group A": "A",
  "Winner Group B": "B",
  "Winner Group C": "C",
  "Winner Group D": "D",
  "Winner Group E": "E",
  "Winner Group F": "F",
  "Winner Group G": "G",
  "Winner Group H": "H",
  "Winner Group I": "I",
  "Winner Group J": "J",
  "Winner Group K": "K",
  "Winner Group L": "L",
};

const RUNNER_SLOTS: Record<string, GroupLetter> = {
  "Runner-up Group A": "A",
  "Runner-up Group B": "B",
  "Runner-up Group C": "C",
  "Runner-up Group D": "D",
  "Runner-up Group E": "E",
  "Runner-up Group F": "F",
  "Runner-up Group G": "G",
  "Runner-up Group H": "H",
  "Runner-up Group I": "I",
  "Runner-up Group J": "J",
  "Runner-up Group K": "K",
  "Runner-up Group L": "L",
};

const THIRD_SLOT_WINNERS: Record<number, GroupLetter> = {
  74: "E",
  77: "I",
  79: "A",
  80: "L",
  81: "D",
  82: "G",
  85: "B",
  87: "K",
};

function getThirdPlaceAssignment(
  qual: QualificationResult,
  winnerGroup: GroupLetter,
): GroupLetter | null {
  const key = [...qual.thirdQualifiers].sort().join("");
  const mapping = combinations[key];
  if (!mapping) return null;
  return (mapping[winnerGroup] as GroupLetter) ?? null;
}

export function resolveSlotLabel(
  label: string | undefined,
  qual: QualificationResult | null,
  matchId?: string,
): string | null {
  if (!label || !qual) return null;

  if (WINNER_SLOTS[label]) {
    return qual.winners[WINNER_SLOTS[label]];
  }
  if (RUNNER_SLOTS[label]) {
    return qual.runnersUp[RUNNER_SLOTS[label]];
  }

  const thirdMatch = label.match(/^3rd Group ([A-L](?:\/[A-L])*)$/);
  if (thirdMatch) {
    const matchNum = matchId ? Number(matchId) : NaN;
    const winnerGroup = THIRD_SLOT_WINNERS[matchNum];
    if (winnerGroup) {
      const assignedGroup = getThirdPlaceAssignment(qual, winnerGroup);
      if (assignedGroup) return qual.thirdPlace[assignedGroup];
    }

    const candidates = thirdMatch[1].split("/") as GroupLetter[];
    const qualifying = candidates.filter((g) =>
      qual.thirdQualifiers.includes(g),
    );
    if (qualifying.length === 1) {
      return qual.thirdPlace[qualifying[0]];
    }
  }

  const winnerMatch = label.match(/^Winner Match (\d+)$/);
  if (winnerMatch) return `__match_${winnerMatch[1]}__`;

  const loserMatch = label.match(/^Loser Match (\d+)$/);
  if (loserMatch) return `__loser_${loserMatch[1]}__`;

  return null;
}

export function getMatchWinner(
  homeId: string | null,
  awayId: string | null,
  homeScore: number | null,
  awayScore: number | null,
  pick?: "home" | "draw" | "away",
): string | null {
  if (homeScore != null && awayScore != null) {
    if (homeScore > awayScore) return homeId;
    if (awayScore > homeScore) return awayId;
    if (pick === "home") return homeId;
    if (pick === "away") return awayId;
    return null;
  }
  if (pick === "home") return homeId;
  if (pick === "away") return awayId;
  return null;
}

export { getThirdPlaceAssignment };
