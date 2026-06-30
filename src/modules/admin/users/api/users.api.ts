// src/modules/admin/users/api/users.api.ts
import axios from 'axios';
import type {
    GetUsersParams,
    AdminUsersResponse,
    AdminUserListItem,
    BanUserRequest
} from '../types/users.types';

const API = axios.create({
    baseURL: 'https://hagzaya.runasp.net/api',
});

// تضمن إرسال الـ Authorization Header تلقائياً في كل الطلبات
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('hagzaya_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const usersAdminApi = {
    // 1. GET /api/admin/users (جلب المستخدمين مع الفلترة والـ Pagination)
    getUsers: async (params: GetUsersParams): Promise<AdminUsersResponse> => {
        const response = await API.get<AdminUsersResponse>('/admin/users', {
            params: {
                Search: params.search || undefined,
                Role: params.role || undefined,
                IsBanned: params.isBanned !== undefined ? params.isBanned : undefined,
                Page: params.page,
                PageSize: params.pageSize,
            },
        });
        return response.data;
    },

    // 2. GET /api/admin/users/{userId} (جلب تفاصيل المستخدم بناءً على الـ ID والـ Role كـ Query Param)
    getUserById: async (userId: number, role: 'Owner' | 'Player'): Promise<AdminUserListItem> => {
        const response = await API.get<AdminUserListItem>(`/admin/users/${userId}`, {
            params: { role },
        });
        return response.data;
    },

    // 3. PUT /api/admin/users/{userId}/ban (عمل حظر للمستخدم وتمرير السبب والـ Role)
    banUser: async (userId: number, role: 'Owner' | 'Player', data: BanUserRequest): Promise<any> => {
        const response = await API.put(`/admin/users/${userId}/ban`, data, {
            params: { role },
        });
        return response.data;
    },

    // 4. PUT /api/admin/users/{userId}/unban (إلغاء الحظر للمستخدم وتمرير الـ Role)
    unbanUser: async (userId: number, role: 'Owner' | 'Player'): Promise<any> => {
        const response = await API.put(`/admin/users/${userId}/unban`, {}, {
            params: { role },
        });
        return response.data;
    },
};