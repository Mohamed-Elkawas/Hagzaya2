// src/modules/owner/fields/api/fields.api.ts
import axios from 'axios';
import type { CreateFieldPayload } from '../../fields/types/fields.types';

export interface FieldResponse {
    id: number;
    name: string;
    isAvailable: boolean;
    approvalStatus: string;
    [key: string]: any;
}

const API = axios.create({
    baseURL: 'https://hagzaya.runasp.net/api',
});

// Auto-inject Authorization + Ngrok headers on every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('hagzaya_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Required to bypass the Ngrok browser warning interstitial page,
    // which breaks CORS preflight checks on free Ngrok tunnels.
    config.headers['ngrok-skip-browser-warning'] = 'true';
    config.headers['Content-Type'] = 'application/json';
    return config;
});

export const fieldsOwnerApi = {
    createField: async (data: CreateFieldPayload): Promise<FieldResponse> => {
        // Log exact payload before sending for debugging
        console.log('[createField] Sending payload:', JSON.stringify(data, null, 2));
        const response = await API.post<FieldResponse>('/fields', data);
        return response.data;
    },
};
