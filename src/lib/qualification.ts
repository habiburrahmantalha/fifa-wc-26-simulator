import type {
  Game,
  GroupLetter,
  GroupTable,
  QualificationResult,
  Team,
} from "./types";
import {
  GROUP_LETTERS,
  compareThirdPlace,
  computeGroupStandings,
} from "./tiebreakers";

export function buildGroupTables(
  teams: Record<string, Team>,
  games: Game[],
): GroupTable[] {
  return GROUP_LETTERS.map((letter) => {
    const teamIds = Object.values(teams)
      .filter((t) => t.group === letter)
      .map((t) => t.id);
    return {
      letter,
      standings: computeGroupStandings(letter, teamIds, games),
    };
  });
}

export function isGroupStageComplete(games: Game[]): boolean {
  return games
    .filter((g) => g.type === "group")
    .every((g) => g.homeScore != null && g.awayScore != null);
}

export function computeQualification(
  groups: GroupTable[],
): QualificationResult {
  const winners = {} as Record<GroupLetter, string>;
  const runnersUp = {} as Record<GroupLetter, string>;
  const thirdPlace = {} as Record<GroupLetter, string>;

  for (const group of groups) {
    winners[group.letter] = group.standings[0].teamId;
    runnersUp[group.letter] = group.standings[1].teamId;
    thirdPlace[group.letter] = group.standings[2].teamId;
  }

  const thirdCandidates = groups.map((g) => ({
    letter: g.letter,
    stats: g.standings[2],
  }));

  thirdCandidates.sort((a, b) => compareThirdPlace(a.stats, b.stats));
  const thirdQualifiers = thirdCandidates.slice(0, 8).map((c) => c.letter);

  return { winners, runnersUp, thirdPlace, thirdQualifiers };
}
