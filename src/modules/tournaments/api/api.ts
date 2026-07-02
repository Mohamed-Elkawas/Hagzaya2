// ─────────────────────────────────────────────────────────────────────────────
// Tournament Module — API Service
// Matches exact backend routes from the API contract spec
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Tournament,
  AvailablePlayer,
  PlayerProfile,
  GetTournamentsParams,
  CreateTournamentPayload,
  JoinTournamentPayload,
  CreateTeamPayload,
  SetRewardsPayload,
  PaymentRequest,
  PaymentStatus,
} from '../types/tournament';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  status: number;
  statusText: string;
  message: string;
  url: string;
  details?: unknown;
}

const BACKEND_URL = import.meta.env.VITE_PUBLIC_API_URL || 'https://upwind-schnapps-uncoated.ngrok-free.dev';

const createAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('hagzaya_token');

  return {
    'ngrok-skip-browser-warning': 'true',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const createJsonHeaders = (): HeadersInit => ({
  ...createAuthHeaders(),
  'Content-Type': 'application/json',
});

const parseErrorResponse = async (response: Response, text: string): Promise<ApiError> => {
  const contentType = response.headers.get('content-type') ?? '';
  let parsed: unknown = text;

  if (contentType.includes('application/json')) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  const message =
    typeof parsed === 'object' && parsed !== null && 'message' in parsed
      ? String((parsed as Record<string, unknown>).message)
      : text || `${response.status} ${response.statusText}`;

  return {
    status: response.status,
    statusText: response.statusText,
    message,
    url: response.url,
    details: parsed,
  };
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    const error = await parseErrorResponse(response, text);
    throw error;
  }

  if (!text) {
    return undefined as unknown as T;
  }

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  return text as unknown as T;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const url = `${BACKEND_URL}${path}`;
  const headers = {
    ...createAuthHeaders(),
    ...init.headers,
  } as HeadersInit;

  try {
    const response = await fetch(url, {
      ...init,
      headers,
    });

    return await parseResponse<T>(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Network error: ${error.message}`);
    }

    throw error;
  }
};

const buildQueryString = (params: Record<string, string | number | undefined>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const tournamentsApi = {
  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC / SHARED
  // ─────────────────────────────────────────────────────────────────────────

  getAll: async (params?: GetTournamentsParams): Promise<Tournament[]> => {
    const query = buildQueryString({
      status: params?.status,
      search: params?.search,
      limit: params?.limit,
    });

    return request<Tournament[]>(`/api/tournaments${query}`);
  },

  getUpcoming: async (limit = 6): Promise<Tournament[]> => {
    return request<Tournament[]>(`/api/tournaments/upcoming?limit=${limit}`);
  },

  getById: async (id: string | number): Promise<Tournament> => {
    return request<Tournament>(`/api/tournaments/${id}`);
  },

  /** Search players by username — fires GET /api/tournaments/players/search?username=…
   *  Returns [] immediately when `username` is empty (avoids 400 validation error). */
  searchPlayers: async (username: string): Promise<PlayerProfile[]> => {
    if (!username.trim()) return [];
    const query = buildQueryString({ username });
    return request<PlayerProfile[]>(`/api/tournaments/players/search${query}`);
  },

  /** Fetch the full player roster — GET /api/players — used for Step 2 member picker */
  getAllPlayers: async (): Promise<AvailablePlayer[]> => {
    return request<AvailablePlayer[]>('/api/players');
  },

  joinTournament: async (
    id: string | number,
    payload: JoinTournamentPayload
  ): Promise<{ message: string }> => {
    return request<{ message: string }>(`/api/tournaments/${id}/join`, {
      method: 'POST',
      headers: createJsonHeaders(),
      body: JSON.stringify(payload),
    });
  },

  getPaymentStatus: async (id: string | number): Promise<PaymentStatus> => {
    return request<PaymentStatus>(`/api/tournaments/${id}/payment-status`);
  },

  create: async (payload: CreateTournamentPayload): Promise<Tournament> => {
    return request<Tournament>('/api/tournaments', {
      method: 'POST',
      headers: createJsonHeaders(),
      body: JSON.stringify(payload),
    });
  },

  getPaymentRequests: async (): Promise<PaymentRequest[]> => {
    return request<PaymentRequest[]>('/api/tournaments/payment-requests');
  },

  approvePayment: async (id: number): Promise<{ message: string }> => {
    return request<{ message: string }>(`/api/tournaments/payments/${id}/approve`, {
      method: 'PUT',
      headers: createJsonHeaders(),
    });
  },

  rejectPayment: async (
    id: number,
    reason: string
  ): Promise<{ message: string }> => {
    return request<{ message: string }>(`/api/tournaments/payments/${id}/reject`, {
      method: 'PUT',
      headers: createJsonHeaders(),
      body: JSON.stringify({ reason }),
    });
  },

  delete: async (id: string): Promise<void> => {
    return request<void>(`/api/tournaments/${id}`, {
      method: 'DELETE',
    });
  },

  createTeam: async (
    payload: CreateTeamPayload
  ): Promise<{ id: string; name: string }> => {
    return request<{ id: string; name: string }>('/api/tournaments/teams', {
      method: 'POST',
      headers: createJsonHeaders(),
      body: JSON.stringify(payload),
    });
  },

  setRewards: async (
    payload: SetRewardsPayload
  ): Promise<{ message: string }> => {
    return request<{ message: string }>('/api/tournaments/rewards', {
      method: 'POST',
      headers: createJsonHeaders(),
      body: JSON.stringify(payload),
    });
  },

  async updateMatchScore(
    matchId: number | string,
    scoreA: number,
    scoreB: number
  ): Promise<{ message: string }> {
    const id = Number(matchId);
    if (Number.isNaN(id)) {
      throw new Error('Invalid matchId provided to updateMatchScore');
    }

    return request<{ message: string }>(`/api/matches/${id}/score`, {
      method: 'PUT',
      headers: createJsonHeaders(),
      body: JSON.stringify({ scoreA, scoreB }),
    });
  },
};
