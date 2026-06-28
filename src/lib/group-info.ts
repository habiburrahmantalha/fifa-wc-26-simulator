import type { GroupLetter, GroupTable, QualificationResult } from "./types";

const ORDINALS = ["1st", "2nd", "3rd", "4th"] as const;

export interface TeamGroupSummary {
  group: GroupLetter;
  position: number;
  pts: number;
  gd: number;
  label: string;
}

export function getTeamGroupSummary(
  teamId: string,
  groups: GroupTable[],
  qualification: QualificationResult | null,
): TeamGroupSummary | null {
  for (const group of groups) {
    const idx = group.standings.findIndex((s) => s.teamId === teamId);
    if (idx === -1) continue;

    const standing = group.standings[idx];
    const ordinal = ORDINALS[idx] ?? `${idx + 1}th`;
    let label = `${ordinal} Group ${group.letter}`;

    if (idx === 2 && qualification?.thirdQualifiers.includes(group.letter)) {
      label += " · best 3rd";
    }

    const gd = standing.gd >= 0 ? `+${standing.gd}` : String(standing.gd);
    label += ` · ${standing.pts} pts · GD ${gd}`;

    return {
      group: group.letter,
      position: standing.position,
      pts: standing.pts,
      gd: standing.gd,
      label,
    };
  }

  return null;
}
