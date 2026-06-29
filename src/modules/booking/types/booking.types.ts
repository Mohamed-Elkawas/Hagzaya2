import type { PaymentMethod, BookingStatus, SlotStatus } from '../types/Booking.enums';

// ─────────────────────────────────────────────────────────────────────────────
// Wire types — shaped to match the actual Swagger schemas, not the page UI.
// Anywhere the backend contract diverges from what a naive client would
// expect, it's called out in a comment.
// ─────────────────────────────────────────────────────────────────────────────

/** A single bookable time slot for a field on a given day. */
export interface Slot {
    id: number;
    fieldId: number;
    date: string; // ISO date, e.g. "2026-06-24"
    startTime: string;
    endTime: string;
    price: number;
    status: SlotStatus;
    isAvailable: boolean;
}

/**
 * POST /api/bookings request body.
 * NOTE: the backend books an *array* of slot ids in one call, and requires
 * `paymentMethod` + `usePoints` at creation time — there is no separate
 * "lock slot" step that's payment-method-agnostic. We always send a single
 * id wrapped in an array, since this flow books one slot at a time, and the
 * UI lets the player change `paymentMethod` again later via submit-payment.
 */
export interface CreateBookingRequest {
    slotIds: number[];
    paymentMethod: PaymentMethod;
    usePoints: boolean;
}

/**
 * Shape of a created booking as returned by POST /api/bookings.
 * Field names confirmed from real DevTools network response.
 *
 * ⚠️  The API returns `id` (not `bookingId`) and `finalPrice` (not `totalAmount`).
 *     The old field names are kept as deprecated optionals for gradual migration.
 */
export interface CreateBookingResponse {
    /** Primary booking identifier — the API returns this as `"id"` */
    id: number;
    status: BookingStatus;
    totalPrice: number;
    discountAmount: number;
    /** Amount charged after discounts — use this for all price display */
    finalPrice: number;
    pointsUsed: number;
    paymentMethod: PaymentMethod;
    qrCode: string;
    slots: BookingResponseSlot[];
    // ── Deprecated aliases (the API no longer returns these field names) ───────
    /** @deprecated The API returns `"id"`. Use `result.id`. */
    bookingId?: number;
    /** @deprecated The API returns `"finalPrice"`. Use `result.finalPrice`. */
    totalAmount?: number;
}

/** A slot entry embedded in the POST /api/bookings response body. */
export interface BookingResponseSlot {
    id: number;
    status: SlotStatus;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    fieldId: number;
    fieldName: string;
}

/** POST /api/bookings/cancel request body. */
export interface CancelBookingRequest {
    bookingId: number;
    reason: string;
}

/**
 * POST /api/bookings/submit-payment request body.
 * NOTE: this is `proofImageUrl` (a string URL), NOT a base64 data blob.
 * The receipt photo must be uploaded to storage first; this endpoint only
 * records the resulting URL against the booking.
 */
export interface SubmitPaymentRequest {
    bookingId: number;
    paymentMethod: PaymentMethod;
    transactionId?: string;
    proofImageUrl: string;
}

/** GET /api/bookings/{id}/payment-status response (inferred). */
export interface PaymentStatusResponse {
    bookingId: number;
    status: BookingStatus;
    approvalStatus?: ApprovalStatusLike;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
}

// Kept separate from booking.enums' ApprovalStatus import to avoid an
// unused-type lint when this file is read in isolation; re-exported below.
type ApprovalStatusLike = 'Pending' | 'Approved' | 'Rejected';

/** A single row in GET /api/bookings/my-bookings (inferred shape). */
export interface MyBooking {
    bookingId: number;
    fieldId: number;
    fieldName: string;
    fieldImage?: string | null;
    date: string;
    startTime: string;
    endTime: string;
    totalAmount: number;
    status: BookingStatus;
    paymentMethod?: PaymentMethod | null;
    createdAt: string;
}

/** Booking context threaded between the sequential pages via router state. */
export interface BookingFlowContext {
    fieldId: number;
    fieldName: string;
    date: string;
    slot: Slot;
    bookingId: number;
    totalAmount: number;
}

/** Payment context threaded from the Payment Methods page to the Receipt page. */
export interface PaymentFlowContext extends BookingFlowContext {
    paymentMethod: PaymentMethod;
}