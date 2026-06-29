import type { Gender, Position, SkillLevel, NotificationType } from './player.enums';

// ─────────────────────────────────────────────────────────────────────────────
// Response Shapes
// ─────────────────────────────────────────────────────────────────────────────

export interface PlayerNavInfo {
    playerId: number;
    displayName: string;
    avatarUrl: string | null;
    unreadNotificationsCount: number;
    points: number;
}

export interface PlayerProfileResponse {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string | null;
    address: string | null;
    age: number;
    gender: Gender | null;
    teamName: string | null;
    position: string | Position | null; // Handle both string from api or numeric enum
    totalMatches: number;
    totalScores: number;
    totalAssists: number;
    skillLevel: SkillLevel | null;
    photo: string | null;
    currentElo: number;
    points: number;
    
    // Legacy / Frontend aliases to avoid breaking existing usages fully
    playerId?: number;
    userId?: string;
    displayName?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    dateOfBirth?: string | null;
    city?: string | null;
    country?: string | null;
    createdAt?: string;
    isVerified?: boolean;
}

export interface PlayerPointsResponse {
    points: number;
    pointsValue: number;
    maxDiscount: string;

    // Legacy fields
    playerId?: number;
    totalPoints?: number;
    level?: string;
    rank?: number | null;
    history?: PointsHistoryEntry[];
}

export interface PointsHistoryEntry {
    id: number;
    points: number;
    reason: string;
    createdAt: string;
}

export interface PlayerNotification {
    notificationId: number;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
    relatedEntityId: number | null;
}

export interface NotificationSettingsResponse {
    emailOnBooking: boolean;
    emailOnMatch: boolean;
    emailOnTournament: boolean;
    emailOnBadge: boolean;
    emailOnReport: boolean;
    emailOnGeneral: boolean;
    pushOnBooking: boolean;
    pushOnMatch: boolean;
    pushOnTournament: boolean;
    pushOnBadge: boolean;
    pushOnReport: boolean;
    pushOnGeneral: boolean;
}

export interface PlayerSummary {
    playerId: number;
    displayName: string;
    avatarUrl: string | null;
    position: Position | null;
    skillLevel: SkillLevel | null;
    city: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Request Shapes
// ─────────────────────────────────────────────────────────────────────────────

export interface UpdatePlayerProfileRequest {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    dateOfBirth?: string; // ISO date string YYYY-MM-DD
    gender?: Gender;
    position?: Position;
    skillLevel?: SkillLevel;
    city?: string;
    country?: string;
}

export interface ChangeEmailRequest {
    newEmail: string;
    currentPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface UpdateNotificationSettingsRequest {
    emailOnBooking?: boolean;
    emailOnMatch?: boolean;
    emailOnTournament?: boolean;
    emailOnBadge?: boolean;
    emailOnReport?: boolean;
    emailOnGeneral?: boolean;
    pushOnBooking?: boolean;
    pushOnMatch?: boolean;
    pushOnTournament?: boolean;
    pushOnBadge?: boolean;
    pushOnReport?: boolean;
    pushOnGeneral?: boolean;
}
