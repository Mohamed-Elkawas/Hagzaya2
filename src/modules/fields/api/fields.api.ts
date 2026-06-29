import type { Field, FieldFilterParams } from '../types/fields.types';

type ApiRequest = Record<string, unknown>;

const BACKEND_URL = 'https://upwind-schnapps-uncoated.ngrok-free.dev';

const handleStreamResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    const text = await blob.text();
    return JSON.parse(text) as T;
};

export const fieldsApi = {
    getAllApprovedFields: async (search?: string, limit?: number): Promise<Field[]> => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (limit) params.append('limit', limit.toString());
        const queryString = params.toString() ? `?${params.toString()}` : '';

        const response = await fetch(`${BACKEND_URL}/api/fields${queryString}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('hagzaya_token') || ''}`
            }
        });
        return handleStreamResponse<Field[]>(response);
    },

    getPopularFields: async (limit: number = 3): Promise<Field[]> => {
        const response = await fetch(`${BACKEND_URL}/api/fields/popular?limit=${limit}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('hagzaya_token') || ''}`
            }
        });
        return handleStreamResponse<Field[]>(response);
    },

    searchFields: async (query: string): Promise<Field[]> => {
        const response = await fetch(`${BACKEND_URL}/api/fields/search?query=${encodeURIComponent(query)}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('hagzaya_token') || ''}`
            }
        });
        return handleStreamResponse<Field[]>(response);
    },

    getFieldById: async (id: number): Promise<Field> => {
        const response = await fetch(`${BACKEND_URL}/api/fields/${id}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('hagzaya_token') || ''}`
            }
        });
        return handleStreamResponse<Field>(response);
    },

    /**
     * ✅ تم تصحيح الـ Return Type هنا ليعيد مصفوفة مباشرة Field[] ليطابق الـ .NET بالملي
     */
    /**
         * 5. الفلترة المتقدمة والـ Pagination للملاعب (نسخة فلترة صارمة ومضمونة)
         * GET /api/fields/filter
         */
    getFilteredFields: async (filters: FieldFilterParams): Promise<Field[]> => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            // تنظيف صارم: لو القيمة موجودة ومش نص فاضي بعد مسح المسافات (trim)
            if (value !== undefined && value !== null) {
                const stringValue = value.toString().trim();
                if (stringValue !== '') {
                    params.append(key, stringValue);
                }
            }
        });

        const queryString = params.toString() ? `?${params.toString()}` : '';

        const response = await fetch(`${BACKEND_URL}/api/fields/filter${queryString}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('hagzaya_token') || ''}`
            }
        });
        return handleStreamResponse<Field[]>(response);
    },
    createField: async (request: ApiRequest): Promise<Field> => {
        const response = await fetch(`${BACKEND_URL}/api/fields`, {
            method: 'POST',
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('hagzaya_token') || ''}`
            },
            body: JSON.stringify(request)
        });
        return handleStreamResponse<Field>(response);
    },

    updateField: async (id: number, request: ApiRequest): Promise<Field> => {
        const response = await fetch(`${BACKEND_URL}/api/fields/${id}`, {
            method: 'PUT',
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('hagzaya_token') || ''}`
            },
            body: JSON.stringify(request)
        });
        return handleStreamResponse<Field>(response);
    },

    deleteField: async (id: number): Promise<void> => {
        const response = await fetch(`${BACKEND_URL}/api/fields/${id}`, {
            method: 'DELETE',
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Authorization': `Bearer ${localStorage.getItem('hagzaya_token') || ''}`
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    },

    getFieldsByOwner: async (ownerId: number): Promise<Field[]> => {
        const response = await fetch(`${BACKEND_URL}/api/fields/owner/${ownerId}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('hagzaya_token') || ''}`
            }
        });
        return handleStreamResponse<Field[]>(response);
    },

    getPendingFields: async (): Promise<Field[]> => {
        const response = await fetch(`${BACKEND_URL}/api/fields/pending`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('hagzaya_token') || ''}`
            }
        });
        return handleStreamResponse<Field[]>(response);
    },

    approveField: async (request: ApiRequest): Promise<void> => {
        const response = await fetch(`${BACKEND_URL}/api/fields/approve`, {
            method: 'POST',
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('hagzaya_token') || ''}`
            },
            body: JSON.stringify(request)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    },

    uploadFieldPhoto: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${BACKEND_URL}/api/upload/field/photos`, {
            method: 'POST',
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Authorization': `Bearer ${localStorage.getItem('hagzaya_token') || ''}`
            },
            body: formData
        });
        return handleStreamResponse<{ url: string }>(response);
    }
};