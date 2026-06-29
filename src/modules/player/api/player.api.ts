import type {
    PlayerNavInfo,
    PlayerProfileResponse,
    PlayerPointsResponse,
    PlayerNotification,
    NotificationSettingsResponse,
    PlayerSummary,
    UpdatePlayerProfileRequest,
    ChangeEmailRequest,
    ChangePasswordRequest,
    UpdateNotificationSettingsRequest,
} from '../types/player.types';

// ─────────────────────────────────────────────────────────────────────────────
// Base URL + shared fetch wrapper
// Re-uses the project's central api-client conventions:
//   • VITE_PUBLIC_API_URL env var → ngrok fallback
//   • hagzaya_token from localStorage
//   • ngrok-skip-browser-warning header
//   • application/octet-stream stream unwrapping (same pattern as booking.api.ts)
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = (
    import.meta.env.VITE_PUBLIC_API_URL ??
    'https://upwind-schnapps-uncoated.ngrok-free.dev'
).replace(/\/$/, '');

function authHeaders(): Record<string, string> {
    const token =
        localStorage.getItem('hagzaya_token') ??
        localStorage.getItem('accessToken') ??
        '';
    return {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse<T>(response: Response, url: string): Promise<T> {
    // Always read as text first — the backend may return application/octet-stream
    const text = await response.text();

    if (!response.ok) {
        // Surface HTML error pages in a collapsible console group
        if (text.trimStart().startsWith('<')) {
            console.groupCollapsed(`[Player API] HTML error ${response.status} — ${url}`);
            console.log(text);
            console.groupEnd();
        }
        let msg = `[${response.status}] ${url}`;
        try {
            const j = JSON.parse(text);
            msg += ` — ${j.message ?? j.title ?? text.slice(0, 120)}`;
        } catch { /* non-JSON body */ }
        throw new Error(msg);
    }

    if (!text.trim()) return undefined as T;

    if (text.trimStart().startsWith('<')) {
        console.groupCollapsed(`[Player API] Unexpected HTML from ${url}`);
        console.log(text);
        console.groupEnd();
        throw new Error(`Expected JSON but received HTML from ${url}`);
    }

    return JSON.parse(text) as T;
}

async function get<T>(path: string): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const response = await fetch(url, { headers: authHeaders() });
    return handleResponse<T>(response, url);
}

async function put<T>(path: string, body?: unknown): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response, url);
}

async function del<T>(path: string): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const response = await fetch(url, { method: 'DELETE', headers: authHeaders() });
    return handleResponse<T>(response, url);
}

// ─────────────────────────────────────────────────────────────────────────────
// Player API surface
// ─────────────────────────────────────────────────────────────────────────────

export const playerApi = {
    // ── Navigation ────────────────────────────────────────────────────────────
    /** GET /api/players/me/nav */
    getNavInfo(): Promise<PlayerNavInfo> {
        return get('/api/players/me/nav');
    },

    // ── Profile ───────────────────────────────────────────────────────────────
    /** GET /api/players/me */
    getMyProfile(): Promise<PlayerProfileResponse> {
        return get('/api/players/me');
    },

    /** PUT /api/players/me */
    updateMyProfile(request: UpdatePlayerProfileRequest): Promise<PlayerProfileResponse> {
        return put('/api/players/me', request);
    },

    /** DELETE /api/players/me */
    deleteAccount(): Promise<void> {
        return del('/api/players/me');
    },

    // ── Points ────────────────────────────────────────────────────────────────
    /** GET /api/players/me/points */
    getMyPoints(): Promise<PlayerPointsResponse> {
        return get('/api/players/me/points');
    },

    // ── Notifications ─────────────────────────────────────────────────────────
    /** GET /api/players/me/notifications */
    getMyNotifications(): Promise<PlayerNotification[]> {
        return get<PlayerNotification[] | { data: PlayerNotification[] }>(
            '/api/players/me/notifications'
        ).then((d) => (Array.isArray(d) ? d : d?.data ?? []));
    },

    /** PUT /api/players/me/notifications/{notificationId}/read */
    markAsRead(notificationId: number): Promise<void> {
        return put(`/api/players/me/notifications/${notificationId}/read`);
    },

    /** PUT /api/players/me/notifications/read-all */
    markAllAsRead(): Promise<void> {
        return put('/api/players/me/notifications/read-all');
    },

    // ── Notification Settings ─────────────────────────────────────────────────
    /** GET /api/players/me/notification-settings */
    getNotificationSettings(): Promise<NotificationSettingsResponse> {
        return get('/api/players/me/notification-settings');
    },

    /** PUT /api/players/me/notification-settings */
    updateNotificationSettings(
        request: UpdateNotificationSettingsRequest
    ): Promise<NotificationSettingsResponse> {
        return put('/api/players/me/notification-settings', request);
    },

    // ── Security ─────────────────────────────────────────────────────────────
    /** PUT /api/players/me/change-email */
    changeEmail(request: ChangeEmailRequest): Promise<void> {
        return put('/api/players/me/change-email', request);
    },

    /** PUT /api/players/me/change-password */
    changePassword(request: ChangePasswordRequest): Promise<void> {
        return put('/api/players/me/change-password', request);
    },

    // ── Public Player Lookup ──────────────────────────────────────────────────
    /** GET /api/players */
    getAllPlayers(): Promise<PlayerSummary[]> {
        return get<PlayerSummary[] | { data: PlayerSummary[] }>('/api/players').then(
            (d) => (Array.isArray(d) ? d : d?.data ?? [])
        );
    },

    /** GET /api/players/{id} */
    getPlayerById(id: number): Promise<PlayerProfileResponse> {
        return get(`/api/players/${id}`);
    },

    /** GET /api/players/team/{teamId} */
    getPlayersByTeam(teamId: number): Promise<PlayerSummary[]> {
        return get<PlayerSummary[] | { data: PlayerSummary[] }>(
            `/api/players/team/${teamId}`
        ).then((d) => (Array.isArray(d) ? d : d?.data ?? []));
    },
};
