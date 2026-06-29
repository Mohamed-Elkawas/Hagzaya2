// src/modules/fields/types/fields.types.ts

export const FieldType = {
    FiveASide: '5-a-side',
    SevenASide: '7-a-side',
    ElevenASide: '11-a-side'
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