import type { RawApiGame, RawApiGroup, RawApiTeam } from "./types";

const BASE = "https://worldcup26.ir";

export async function fetchFromWorldCup<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function parseBool(value: string | undefined): boolean {
  return value?.toUpperCase() === "TRUE";
}

export function parseScore(value: string | null | undefined): number | null {
  if (value == null || value === "null" || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export function parseTeamId(value: string | null | undefined): string | null {
  if (!value || value === "0" || value === "null") return null;
  return value;
}

export async function fetchWorldCupData() {
  const [gamesRes, groupsRes, teamsRes] = await Promise.all([
    fetchFromWorldCup<{ games: RawApiGame[] }>("/get/games"),
    fetchFromWorldCup<{ groups: RawApiGroup[] }>("/get/groups"),
    fetchFromWorldCup<{ teams: RawApiTeam[] }>("/get/teams"),
  ]);

  return {
    games: gamesRes.games,
    groups: groupsRes.groups,
    teams: teamsRes.teams,
  };
}
