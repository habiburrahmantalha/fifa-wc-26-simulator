export type GroupLetter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L";

export type MatchType =
  | "group"
  | "r32"
  | "r16"
  | "qf"
  | "sf"
  | "third"
  | "final";

export type PickOutcome = "home" | "draw" | "away";

export interface Team {
  id: string;
  nameEn: string;
  nameFa: string;
  flag: string;
  fifaCode: string;
  group: GroupLetter;
}

export interface GroupStanding {
  teamId: string;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  position: number;
  status: "qualified" | "possible" | "eliminated" | "pending";
}

export interface GroupTable {
  letter: GroupLetter;
  standings: GroupStanding[];
}

export interface Game {
  id: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeTeamLabel?: string;
  awayTeamLabel?: string;
  homeScore: number | null;
  awayScore: number | null;
  finished: boolean;
  type: MatchType;
  group: string;
  matchday: number;
  localDate: string;
  homeTeamName?: string;
  awayTeamName?: string;
  homeScorers?: string | null;
  awayScorers?: string | null;
}

export interface SimulationPick {
  gameId: string;
  outcome: PickOutcome;
}

export interface ResolvedGame extends Game {
  resolvedHomeId: string | null;
  resolvedAwayId: string | null;
  effectiveHomeScore: number | null;
  effectiveAwayScore: number | null;
  isSimulated: boolean;
  winnerId: string | null;
}

export interface QualificationResult {
  winners: Record<GroupLetter, string>;
  runnersUp: Record<GroupLetter, string>;
  thirdPlace: Record<GroupLetter, string>;
  thirdQualifiers: GroupLetter[];
}

export interface TournamentState {
  teams: Record<string, Team>;
  games: ResolvedGame[];
  groups: GroupTable[];
  qualification: QualificationResult | null;
  groupStageComplete: boolean;
  championId: string | null;
}

export interface RawApiGame {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string | null;
  away_score: string | null;
  finished: string;
  type: string;
  group: string;
  matchday: string;
  local_date: string;
  home_team_label?: string;
  away_team_label?: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_scorers?: string | null;
  away_scorers?: string | null;
}

export interface RawApiTeam {
  id: string;
  name_en: string;
  name_fa: string;
  flag: string;
  fifa_code: string;
  groups: string;
}

export interface RawGroupEntry {
  team_id: string;
  mp: string;
  w: string;
  l: string;
  d: string;
  pts: string;
  gf: string;
  ga: string;
  gd: string;
}

export interface RawApiGroup {
  name: string;
  teams: RawGroupEntry[];
}
