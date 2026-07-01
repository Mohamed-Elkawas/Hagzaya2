// src/modules/fields/api/fields.api.ts
import axios from 'axios';
import type { Field, FieldFilterParams, CreateFieldPayload } from '../types/fields.types';

// ─── Upload Response Schema (matches /api/upload/* endpoints) ─────────────────
export interface UploadResponse {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSizeInBytes: number;
}

// ─── Axios Instance ───────────────────────────────────────────────────────────
// Reads base URL from .env: VITE_PUBLIC_API_URL=https://hagzaya.runasp.net
const API = axios.create({
    baseURL: `${import.meta.env.VITE_PUBLIC_API_URL}/api`,
});

// Request interceptor: auto-injects token + ngrok bypass header on every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('hagzaya_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Prevents the Ngrok free-tier HTML warning page from intercepting the request
    // and breaking the CORS preflight response.
    config.headers['ngrok-skip-browser-warning'] = 'true';
    return config;
});

// Response interceptor: extract the structured error message from the body
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const serverMsg =
            error.response?.data?.message ||
            error.response?.data?.title ||
            (typeof error.response?.data === 'string' ? error.response.data : null) ||
            error.message ||
            'Unknown server error';
        return Promise.reject(new Error(serverMsg));
    }
);

// ─── API Object ───────────────────────────────────────────────────────────────
export const fieldsApi = {

    // ── Read ──────────────────────────────────────────────────────────────

    getAllApprovedFields: async (search?: string, limit?: number): Promise<Field[]> => {
        const params: Record<string, string | number> = {};
        if (search) params.search = search;
        if (limit) params.limit = limit;
        const response = await API.get<Field[]>('/fields', { params });
        return response.data;
    },

    getPopularFields: async (limit = 3): Promise<Field[]> => {
        const response = await API.get<Field[]>('/fields/popular', { params: { limit } });
        return response.data;
    },

    searchFields: async (query: string): Promise<Field[]> => {
        const response = await API.get<Field[]>('/fields/search', { params: { query } });
        return response.data;
    },

    getFieldById: async (id: number): Promise<Field> => {
        const response = await API.get<Field>(`/fields/${id}`);
        return response.data;
    },

    getFilteredFields: async (filters: FieldFilterParams): Promise<Field[]> => {
        // Strip out undefined/null/empty-string params before sending
        const cleaned: Record<string, string | number> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && String(value).trim() !== '') {
                cleaned[key] = value;
            }
        });
        const response = await API.get<Field[]>('/fields/filter', { params: cleaned });
        return response.data;
    },

    getFieldsByOwner: async (ownerId: number): Promise<Field[]> => {
        const response = await API.get<Field[]>(`/fields/owner/${ownerId}`);
        return response.data;
    },

    getPendingFields: async (): Promise<Field[]> => {
        const response = await API.get<Field[]>('/fields/pending');
        return response.data;
    },

    // ── Write ─────────────────────────────────────────────────────────────

    /**
     * STEP 1 of upload pipeline.
     * POST /api/upload/owner/license  (multipart/form-data, key: 'file')
     *
     * ⚠️  Do NOT set Content-Type manually — Axios will set it to
     *    'multipart/form-data; boundary=...' automatically when a FormData
     *    object is passed. Overriding it breaks the boundary delimiter.
     *
     * @returns { fileName, fileUrl, fileType, fileSizeInBytes }
     */
    uploadLicense: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await API.post<UploadResponse>('/upload/owner/license', formData);
        return response.data;
    },

    /**
     * STEP 1b (optional parallel) — Upload a field photo.
     * POST /api/upload/field/photos  (multipart/form-data, key: 'file')
     *
     * @returns { fileName, fileUrl, fileType, fileSizeInBytes }
     */
    uploadFieldPhoto: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await API.post<UploadResponse>('/upload/field/photos', formData);
        return response.data;
    },

    /**
     * STEP 2 (final) — Create the field record.
     * POST /api/fields  (application/json)
     *
     * theLicense and photos MUST be absolute URL strings
     * returned from the upload endpoints above.
     */
    createField: async (payload: CreateFieldPayload): Promise<Field> => {
        console.log('[fieldsApi.createField] Final payload:', JSON.stringify(payload, null, 2));
        const response = await API.post<Field>('/fields', payload);
        return response.data;
    },

    updateField: async (id: number, payload: Partial<CreateFieldPayload>): Promise<Field> => {
        const response = await API.put<Field>(`/fields/${id}`, payload);
        return response.data;
    },

    deleteField: async (id: number): Promise<void> => {
        await API.delete(`/fields/${id}`);
    },

    approveField: async (payload: Record<string, unknown>): Promise<void> => {
        await API.post('/fields/approve', payload);
    },
};