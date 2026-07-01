// ─────────────────────────────────────────────────────────────────────────────
// Tournament Module — Types
// All domain types, enums, API shapes for the Tournaments feature
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums ──────────────────────────────────────────────────────────────────

export const TournamentStatus = {
  Upcoming: 'Upcoming',
  Ongoing: 'Ongoing',
  Finished: 'Finished',
  Cancelled: 'Cancelled',
} as const;
export type TournamentStatus = typeof TournamentStatus[keyof typeof TournamentStatus];

export const MatchStatus = {
  Scheduled: 'Scheduled',
  Live: 'Live',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
} as const;
export type MatchStatus = typeof MatchStatus[keyof typeof MatchStatus];

export const PaymentMethod = {
  VodafoneCash: 'VodafoneCash',
  InstaPay: 'InstaPay',
} as const;
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export const PaymentRequestStatus = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
} as const;
export type PaymentRequestStatus = typeof PaymentRequestStatus[keyof typeof PaymentRequestStatus];

export const TournamentType = {
  FiveASide: 'FiveASide',
  SevenASide: 'SevenASide',
  ElevenASide: 'ElevenASide',
} as const;
export type TournamentType = typeof TournamentType[keyof typeof TournamentType];

export const UserRole = {
  Owner: 'OWNER',
  Player: 'PLAYER',
  Admin: 'ADMIN',
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

// ── Domain Models ─────────────────────────────────────────────────────────

export interface PlayerProfile {
  id: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  position?: string;
}

export interface TeamStanding {
  id: string;
  name: string;
  logoUrl?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Group {
  id: string;
  name: string;       // "Group A", "Group B" …
  teams: TeamStanding[];
}

export interface MatchTeam {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  groupId?: string;
  stage: 'Group' | 'RoundOf16' | 'QuarterFinal' | 'SemiFinal' | 'Final';
  teamA: MatchTeam | null;
  teamB: MatchTeam | null;
  scoreA: number | null;
  scoreB: number | null;
  status: MatchStatus;
  startTime: string;   // ISO 8601
  fieldId: string;
  /** Used to wire up the bracket next-round slot */
  nextMatchId?: string;
  /** Which slot in the next match does the winner go: 'A' or 'B' */
  nextMatchSlot?: 'A' | 'B';
}

export interface Tournament {
  id: string;
  name: string;
  numberOfTeams: 8 | 16 | 32;
  prize: string;
  description: string;
  price: number;
  type: TournamentType | string;
  startDate: string;
  endDate: string;
  fieldId: string;
  /** Optional field name/city returned by expanded API responses */
  fieldName?: string;
  fieldCity?: string;
  status: TournamentStatus;
  registeredTeamsCount: number;
  /** Alias used by some API responses */
  teamsJoined?: number;
  ownerId: string;
  coverImage?: string;
  groups?: Group[];
  matches?: Match[];
  rewards?: TournamentRewards;
}

export interface TournamentRewards {
  firstPlace: string;
  secondPlace: string;
  thirdPlace?: string;
  theBestPlayer?: string;
  theBestGoalkeeper?: string;
}

// ── Payment Request (Owner view) ──────────────────────────────────────────

/** Represents a team's tournament registration payment that awaits owner approval */
export interface PaymentRequest {
  id: number;
  tournamentId: string;
  tournamentName?: string;
  teamId?: string;
  teamName: string;
  captainId?: string;
  captainName: string;
  amountDue: number;
  paymentMethod: PaymentMethod;
  /** URL to uploaded receipt — only present when paymentMethod === 'VodafoneCash' */
  paymentProofUrl?: string;
  status: PaymentRequestStatus;
  createdAt?: string;
}

/** Returned from GET /api/tournaments/{id}/payment-status */
export interface PaymentStatus {
  tournamentId: string;
  teamName?: string;
  status: PaymentRequestStatus | string;
  paymentMethod?: PaymentMethod;
  amountPaid?: number;
  paidAt?: string;
  message?: string;
}

// ── API Request Shapes ────────────────────────────────────────────────────

export interface CreateTournamentPayload {
  name: string;
  numberOfTeams: 8 | 16 | 32;
  prize: string;
  description: string;
  price: number;
  type: string;
  startDate: string;
  endDate: string;
  fieldId: string;
}

export interface JoinTournamentPayload {
  teamName: string;
  memberIds: string[];
  paymentMethod: PaymentMethod;
  paymentProofUrl?: string;
}

export interface CreateTeamPayload {
  name: string;
  tournamentId: string;
}

export interface SetRewardsPayload {
  tournamentId: string;
  firstPlace: string;
  secondPlace: string;
  thirdPlace?: string;
  theBestPlayer?: string;
  theBestGoalkeeper?: string;
}

export interface UpdateScorePayload {
  matchId: string;
  scoreA: number;
  scoreB: number;
}

export interface RejectPaymentPayload {
  reason: string;
}

// ── API Response Shapes ───────────────────────────────────────────────────

export interface ApiListResponse<T> {
  data: T[];
  total?: number;
  page?: number;
}

export interface ApiSingleResponse<T> {
  data: T;
  message?: string;
}

// ── Query Params ─────────────────────────────────────────────────────────

export interface GetTournamentsParams {
  status?: TournamentStatus | string;
  search?: string;
  limit?: number;
}
