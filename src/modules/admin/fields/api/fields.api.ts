// src/modules/admin/fields/api/fields.api.ts
import axios from 'axios';
import type {
    PendingFieldItem,
    AllFieldsResponse,
    ApproveFieldPayload,
    FieldsFilterParams
} from '../types/fields.types';

// تغيير الـ baseURL حسب السيرفر الفعلي لديك
const API = axios.create({
    baseURL: 'https://hagzaya.runasp.net/api',
});

// Interceptor لتمرير التوكن تلقائياً مع كل طلب أدمن
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('hagzaya_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const fieldsAdminApi = {
    // 1. جلب الملاعب المعلقة المخصصة للمراجعة
    getPendingFields: async (): Promise<PendingFieldItem[]> => {
        const response = await API.get<PendingFieldItem[]>('/admin/fields/pending');
        return response.data;
    },

    // 2. جلب جميع الملاعب مع الفلاتر والبحث والصفحات
    getAllFields: async (params: FieldsFilterParams): Promise<AllFieldsResponse> => {
        const response = await API.get<AllFieldsResponse>('/admin/fields', {
            params: {
                Search: params.search || undefined,
                City: params.city || undefined,
                Type: params.type || undefined,
                Status: params.status || undefined,
                Page: params.page,
                PageSize: params.pageSize,
            }
        });
        return response.data;
    },

    // 3. اتخاذ قرار بالقبول أو الرفض لملعب معين
    approveOrRejectField: async (fieldId: number, data: ApproveFieldPayload): Promise<any> => {
        const response = await API.put(`/admin/fields/${fieldId}/approve`, data);
        return response.data;
    }
};