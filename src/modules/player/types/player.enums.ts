// ─────────────────────────────────────────────────────────────────────────────
// Mirrors backend Hagzaya.Domain.Enums exactly (Strings instead of Numbers)
// Project rule: no `enum` keyword — `as const` objects + derived union types
// ─────────────────────────────────────────────────────────────────────────────

export const Gender = {
    Male: 'Male',
    Female: 'Female',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const Position = {
    Goalkeeper: 'Goalkeeper',
    Defender: 'Defender',
    Midfielder: 'Midfielder',
    Winger: 'Winger',
    Striker: 'Striker',
} as const;
export type Position = (typeof Position)[keyof typeof Position];

// ملاحظة: الـ SkillLevel معرف في الباك إند صراحة بأرقام (Beginner = 1) 
// لذلك نتركه أرقاماً كما هو حتى يوافق الـ دوت نت إينوم
export const SkillLevel = {
    Beginner: 1,
    Elementary: 2,
    Intermediate: 3,
    Advanced: 4,
    Professional: 5,
} as const;
export type SkillLevel = (typeof SkillLevel)[keyof typeof SkillLevel];

export const NotificationType = {
    Booking: 'Booking',
    Match: 'Match',
    Tournament: 'Tournament',
    Badge: 'Badge',
    Report: 'Report',
    General: 'General',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const ApprovalStatus = {
    Pending: 'Pending',
    Approved: 'Approved',
    Rejected: 'Rejected',
} as const;
export type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

export const BookingStatus = {
    Pending: 'Pending',
    PendingPayment: 'PendingPayment',
    PaymentSubmitted: 'PaymentSubmitted',
    AwaitingAdminApproval: 'AwaitingAdminApproval',
    Confirmed: 'Confirmed',
    Cancelled: 'Cancelled',
    Rejected: 'Rejected',
    Expired: 'Expired',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const FieldSurface = {
    NaturalGrass: 'NaturalGrass',
    ArtificialTurf: 'ArtificialTurf',
    HybridTurf: 'HybridTurf',
} as const;
export type FieldSurface = (typeof FieldSurface)[keyof typeof FieldSurface];

export const FieldType = {
    FiveASide: 'FiveASide',
    SevenASide: 'SevenASide',
    ElevenASide: 'ElevenASide',
} as const;
export type FieldType = (typeof FieldType)[keyof typeof FieldType];

export const MatchStatus = {
    Scheduled: 'Scheduled',
    Live: 'Live',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
} as const;
export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export const PaymentMethod = {
    VodafoneCash: 'VodafoneCash',
    InstaPay: 'InstaPay',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const ReportStatus = {
    Pending: 'Pending',
    UnderReview: 'UnderReview',
    Resolved: 'Resolved',
    Rejected: 'Rejected',
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const SlotStatus = {
    Available: 0,
    Reserved: 1,
    Booked: 2,
    PaymentSent: 3,
    UnderReview: 4,
} as const;
export type SlotStatus = (typeof SlotStatus)[keyof typeof SlotStatus];

export const TournamentStatus = {
    Upcoming: 'Upcoming',
    Ongoing: 'Ongoing',
    Finished: 'Finished',
    Cancelled: 'Cancelled',
} as const;
export type TournamentStatus = (typeof TournamentStatus)[keyof typeof TournamentStatus];

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