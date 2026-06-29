// ─────────────────────────────────────────────────────────────────────────────
// Mirrors backend Hagzaya.Domain.Enums exactly (string-keyed, serialized as
// strings by the API). Project rule: no `enum` keyword — use `as const`
// objects + derived union types instead.
// ─────────────────────────────────────────────────────────────────────────────

export const PaymentMethod = {
    VodafoneCash: "VodafoneCash",
    InstaPay: "InstaPay",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const BookingStatus = {
    Pending: "Pending",
    PendingPayment: "PendingPayment",
    PaymentSubmitted: "PaymentSubmitted",
    AwaitingAdminApproval: "AwaitingAdminApproval",
    Confirmed: "Confirmed",
    Cancelled: "Cancelled",
    Rejected: "Rejected",
    Expired: "Expired",
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const SlotStatus = {
    Available: "Available",
    Reserved: "Reserved",
    Booked: "Booked",
    PaymentSent: "PaymentSent",
    UnderReview: "UnderReview",
} as const;
export type SlotStatus = (typeof SlotStatus)[keyof typeof SlotStatus];

export const ApprovalStatus = {
    Pending: 'Pending',
    Approved: 'Approved',
    Rejected: 'Rejected',
} as const;
export type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

// ─── Display helpers (Arabic labels + badge tokens for status pills) ───────

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
    [BookingStatus.Pending]: 'قيد الإنشاء',
    [BookingStatus.PendingPayment]: 'بانتظار الدفع',
    [BookingStatus.PaymentSubmitted]: 'تم إرسال الإيصال',
    [BookingStatus.AwaitingAdminApproval]: 'قيد المراجعة',
    [BookingStatus.Confirmed]: 'مؤكد',
    [BookingStatus.Cancelled]: 'ملغي',
    [BookingStatus.Rejected]: 'مرفوض',
    [BookingStatus.Expired]: 'منتهي الصلاحية',
};

export const BOOKING_STATUS_STYLES: Record<BookingStatus, { bg: string; text: string }> = {
    [BookingStatus.Pending]: { bg: 'bg-[#f0f2f0]', text: 'text-[#3e4a3c]' },
    [BookingStatus.PendingPayment]: { bg: 'bg-[#fff3e0]', text: 'text-[#b86a00]' },
    [BookingStatus.PaymentSubmitted]: { bg: 'bg-[#e3f2fd]', text: 'text-[#0d6cb0]' },
    [BookingStatus.AwaitingAdminApproval]: { bg: 'bg-[#e3f2fd]', text: 'text-[#0d6cb0]' },
    [BookingStatus.Confirmed]: { bg: 'bg-[#e8f5e9]', text: 'text-[#006b20]' },
    [BookingStatus.Cancelled]: { bg: 'bg-[#f0f2f0]', text: 'text-[#3e4a3c]/60' },
    [BookingStatus.Rejected]: { bg: 'bg-[#fdecea]', text: 'text-[#c62828]' },
    [BookingStatus.Expired]: { bg: 'bg-[#f0f2f0]', text: 'text-[#3e4a3c]/60' },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    [PaymentMethod.VodafoneCash]: 'فودافون كاش',
    [PaymentMethod.InstaPay]: 'إنستا باي',
};