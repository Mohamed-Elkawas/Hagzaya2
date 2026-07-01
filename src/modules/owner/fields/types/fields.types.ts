// src/modules/owner/fields/types/fields.types.ts

export enum FieldType {
    FiveASide = "FiveASide",
    SevenASide = "SevenASide",
    ElevenASide = "ElevenASide"
}

export enum FieldSurface {
    NaturalGrass = "NaturalGrass",
    ArtificialTurf = "ArtificialTurf",
    HybridTurf = "HybridTurf"
}

export interface CreateFieldRequest {
    name: string;
    city: string;
    village: string;
    address: string;
    governorate: string;
    theLicense: string;
    photos: string[];
    type: FieldType;
    priceAm: number;
    pricePm: number;
    latitude: number;
    longitude: number;
    capacity: number;
    surface: FieldSurface;
    openingTime: string;
    closingTime: string;
    amenities: string[];
}

export interface FieldResponse {
    id: number;
    name: string;
    isAvailable: boolean;
    approvalStatus: string;
    [key: string]: any; // Catch-all for extra fields in the 201 response
}
