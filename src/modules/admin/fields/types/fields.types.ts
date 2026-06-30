// src/modules/admin/fields/types/fields.types.ts

export interface PendingFieldItem {
    id: number;
    name: string;
    city: string;
    address: string;
    type: 'FiveASide' | 'SevenASide' | 'ElevenASide' | string;
    priceAm: number;
    pricePm: number;
    photos: string; // ستأتي كـ JSON String ونقوم بفكها بمصفوفة
    theLicense: string;
    ownerName: string;
    ownerEmail: string;
    submittedOn: string;
}

export interface AllFieldsItem {
    id: number;
    name: string;
    city: string;
    type: string;
    surface: string;
    priceAm: number;
    approvalStatus: 'Approved' | 'Pending' | 'Rejected';
    ownerName: string;
    bookingsCount: number;
    averageRating: number;
    isAvailable: boolean;
}

export interface AllFieldsResponse {
    page: number;
    pageSize: number;
    total: number;
    items: AllFieldsItem[];
}

export interface ApproveFieldPayload {
    isApproved: boolean;
    rejectionReason: string;
}

export interface FieldsFilterParams {
    search?: string;
    city?: string;
    type?: string;
    status?: string;
    page: number;
    pageSize: number;
}