import { useState, useCallback } from 'react';
import { fieldsApi } from '../api/fields.api';
import type { Field, FieldFilterParams } from '../types/fields.types';
import { toast } from 'sonner';

export function useFields() {
    const [fields, setFields] = useState<Field[]>([]);
    const [popularFields, setPopularFields] = useState<Field[]>([]);
    const [currentField, setCurrentField] = useState<Field | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchApprovedFields = useCallback(async (search?: string, limit?: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fieldsApi.getAllApprovedFields(search, limit);
            const cleanData = Array.isArray(data) ? data : (data as any)?.data || [];
            setFields(cleanData);
        } catch (err: any) {
            const msg = err.message || 'حدث خطأ أثناء جلب الملاعب';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchPopularFields = useCallback(async (limit: number = 3) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fieldsApi.getPopularFields(limit);
            const cleanData = Array.isArray(data) ? data : (data as any)?.data || [];
            setPopularFields(cleanData);
        } catch (err: any) {
            setPopularFields([]);
            console.error('Error fetching popular fields:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchFieldById = useCallback(async (id: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fieldsApi.getFieldById(id);
            setCurrentField(data);
            return data;
        } catch (err: any) {
            const msg = err.message || 'الملعب غير موجود';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchFilteredFields = useCallback(async (filters: FieldFilterParams) => {
        setIsLoading(true);
        setError(null);
        try {
            let result = await fieldsApi.getFilteredFields(filters);

            if ((!result || result.length === 0) && !filters.City && !filters.Governorate && !filters.Type) {
                result = await fieldsApi.getAllApprovedFields();
            }

            const cleanData = Array.isArray(result) ? result : (result as any)?.data || [];
            setFields(cleanData);
            setTotalCount(cleanData.length);
        } catch (err: any) {
            const msg = err.message || 'حدث خطأ أثناء تصفية الملاعب';
            setError(msg);
            setFields([]);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        fields,
        popularFields,
        currentField,
        totalCount,
        isLoading,
        error,
        fetchApprovedFields,
        fetchPopularFields,
        fetchFieldById,
        fetchFilteredFields
    };
}