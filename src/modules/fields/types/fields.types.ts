// src/modules/fields/types/fields.types.ts

// ⚠️ IMPORTANT: These values match the strict C# Enum names expected by the backend on POST.
// The backend transforms them to display strings (e.g. '5-a-side') only in GET responses.
export const FieldType = {
    FiveASide: 'FiveASide',
    SevenASide: 'SevenASide',
    ElevenASide: 'ElevenASide'
} as const;
export type FieldType = typeof FieldType[keyof typeof FieldType];

export const FieldSurface = {
    NaturalGrass: 'NaturalGrass',
    ArtificialTurf: 'ArtificialTurf',
    HybridTurf: 'HybridTurf'
} as const;
export type FieldSurface = typeof FieldSurface[keyof typeof FieldSurface];

export const ApprovalStatus = {
    Pending: 'Pending',
    Approved: 'Approved',
    Rejected: 'Rejected'
} as const;
export type ApprovalStatus = typeof ApprovalStatus[keyof typeof ApprovalStatus];

export interface Field {
    id: number;
    name: string;
    city: string;
    village?: string;
    address: string;
    governorate: string;
    type: string;
    priceAm: number;
    pricePm: number;
    isAvailable: boolean;
    approvalStatus: string;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    surface: string;
    openingTime?: string;
    closingTime?: string;
    photos: string; // يرجع كـ stringified JSON من الباك إند
    theLicense?: string;
    ownerId: number;
    pointsDiscountMaxPct?: number;
    pointsPerBooking?: number;
    amenities?: string | string[]; // دعم مصفوفة أو نص للتحويل الآمن
}

export interface FieldFilterParams {
    City?: string;
    Governorate?: string;
    Type?: string;
    Date?: string;
    Time?: string;
    Sort?: string;
    Page?: number;
    PageSize?: number;
}

// Strict creation payload — matches POST /api/fields exactly.
// Numbers MUST be cast via Number() before submission.
export interface CreateFieldPayload {
    name: string;
    city: string;
    village: string;
    address: string;
    governorate: string;
    theLicense: string;
    photos: string;              // Stringified JSON array or empty string
    type: FieldType;             // Sends 'FiveASide' | 'SevenASide' | 'ElevenASide'
    priceAm: number;
    pricePm: number;
    latitude: number;
    longitude: number;
    capacity: number;
    surface: 'NaturalGrass' | 'ArtificialTurf' | 'HybridTurf';
    openingTime: string;         // Format: "HH:mm"
    closingTime: string;         // Format: "HH:mm"
    amenities: string[];
}