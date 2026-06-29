// ─────────────────────────────────────────────────────────────────────────────
// Tournament Module — API Service
// Matches exact backend routes from the API contract spec
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Tournament,
  PlayerProfile,
  GetTournamentsParams,
  CreateTournamentPayload,
  JoinTournamentPayload,
  CreateTeamPayload,
  SetRewardsPayload,
} from '../types/tournament';

const BACKEND_URL = 'https://upwind-schnapps-uncoated.ngrok-free.dev';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getAuthHeaders = (): HeadersInit => ({
  'ngrok-skip-browser-warning': 'true',
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('hagzaya_token') || ''}`,
});

const getJsonHeaders = (): HeadersInit => ({
  ...getAuthHeaders(),
  'Content-Type': 'application/json',
});

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    let message = `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.message || parsed.title || message;
    } catch {
      message = errorText || message;
    }
    throw new Error(message);
  }
  const blob = await response.blob();
  const text = await blob.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
};

// ── Tournament API ────────────────────────────────────────────────────────────

export const tournamentsApi = {
  /**
   * GET /api/tournaments
   * Fetch all tournaments with optional filters.
   */
  getAll: async (params?: GetTournamentsParams): Promise<Tournament[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', params.limit.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${BACKEND_URL}/api/tournaments${qs}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Tournament[]>(res);
  },

  /**
   * GET /api/tournaments/upcoming
   * Fetch upcoming tournaments (used on the dashboard / explore hero).
   */
  getUpcoming: async (limit = 6): Promise<Tournament[]> => {
    const res = await fetch(
      `${BACKEND_URL}/api/tournaments/upcoming?limit=${limit}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<Tournament[]>(res);
  },

  /**
   * GET /api/tournaments/{id}
   * Fetch a single tournament with full detail (groups, matches, brackets).
   */
  getById: async (id: string): Promise<Tournament> => {
    const res = await fetch(`${BACKEND_URL}/api/tournaments/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Tournament>(res);
  },

  /**
   * POST /api/tournaments
   * Create a new tournament. Role: Owner / Admin.
   */
  create: async (payload: CreateTournamentPayload): Promise<Tournament> => {
    const res = await fetch(`${BACKEND_URL}/api/tournaments`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Tournament>(res);
  },

  /**
   * DELETE /api/tournaments/{id}
   * Delete a tournament. Role: Admin.
   */
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BACKEND_URL}/api/tournaments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(res);
  },

  /**
   * GET /api/tournaments/players/search?username=...
   * Search players by username to add them to a team. Role: Player.
   */
  searchPlayers: async (username: string): Promise<PlayerProfile[]> => {
    const res = await fetch(
      `${BACKEND_URL}/api/tournaments/players/search?username=${encodeURIComponent(username)}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<PlayerProfile[]>(res);
  },

  /**
   * POST /api/tournaments/{id}/join
   * Register a team for a tournament. Role: Player.
   */
  joinTournament: async (
    id: string,
    payload: JoinTournamentPayload
  ): Promise<{ message: string }> => {
    const res = await fetch(`${BACKEND_URL}/api/tournaments/${id}/join`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ message: string }>(res);
  },

  /**
   * POST /api/tournaments/teams
   * Create a standalone team linked to a tournament. Role: Player / Admin.
   */
  createTeam: async (
    payload: CreateTeamPayload
  ): Promise<{ id: string; name: string }> => {
    const res = await fetch(`${BACKEND_URL}/api/tournaments/teams`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ id: string; name: string }>(res);
  },

  setRewards: async (
    payload: SetRewardsPayload
  ): Promise<{ message: string }> => {
    const res = await fetch(`${BACKEND_URL}/api/tournaments/rewards`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ message: string }>(res);
  },

  /**
   * PUT /api/matches/{id}/score
   * Update match score. Role: Admin / Owner.
   */
  async updateMatchScore(
    matchId: number | string,
    scoreA: number,
    scoreB: number
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${BACKEND_URL}/api/matches/${Number(matchId)}/score`,
      {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify({ scoreA, scoreB }),
      }
    );
    return handleResponse<{ message: string }>(response);
  },
};
