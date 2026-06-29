// ─────────────────────────────────────────────────────────────────────────────
// Mirrors backend Hagzaya.Domain.Enums exactly.
// Project rule: no `enum` keyword — `as const` objects + derived union types
// survive verbatimModuleSyntax / isolatedModules and tree-shake like plain values.
// ─────────────────────────────────────────────────────────────────────────────

export const Gender = {
    Male: 0,
    Female: 1,
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const Position = {
    Goalkeeper: 0,
    Defender: 1,
    Midfielder: 2,
    Winger: 3,
    Striker: 4,
} as const;
export type Position = (typeof Position)[keyof typeof Position];

export const SkillLevel = {
    Beginner: 1,
    Elementary: 2,
    Intermediate: 3,
    Advanced: 4,
    Professional: 5,
} as const;
export type SkillLevel = (typeof SkillLevel)[keyof typeof SkillLevel];

export const NotificationType = {
    Booking: 0,
    Match: 1,
    Tournament: 2,
    Badge: 3,
    Report: 4,
    General: 5,
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

// ─── Display helpers ──────────────────────────────────────────────────────────

export const GENDER_LABELS: Record<Gender, string> = {
    [Gender.Male]: 'ذكر',
    [Gender.Female]: 'أنثى',
};

export const POSITION_LABELS: Record<Position, string> = {
    [Position.Goalkeeper]: 'حارس مرمى',
    [Position.Defender]: 'مدافع',
    [Position.Midfielder]: 'وسط',
    [Position.Winger]: 'جناح',
    [Position.Striker]: 'مهاجم',
};

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
    [SkillLevel.Beginner]: 'مبتدئ',
    [SkillLevel.Elementary]: 'أساسي',
    [SkillLevel.Intermediate]: 'متوسط',
    [SkillLevel.Advanced]: 'متقدم',
    [SkillLevel.Professional]: 'محترف',
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
    [NotificationType.Booking]: 'الحجوزات',
    [NotificationType.Match]: 'المباريات',
    [NotificationType.Tournament]: 'البطولات',
    [NotificationType.Badge]: 'الشارات',
    [NotificationType.Report]: 'التقارير',
    [NotificationType.General]: 'عام',
};

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
    [NotificationType.Booking]: 'event_available',
    [NotificationType.Match]: 'sports_soccer',
    [NotificationType.Tournament]: 'emoji_events',
    [NotificationType.Badge]: 'military_tech',
    [NotificationType.Report]: 'description',
    [NotificationType.General]: 'notifications',
};
