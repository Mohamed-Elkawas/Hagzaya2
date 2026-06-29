import { useState, useCallback, useEffect } from 'react';
import { playerApi } from '../api/player.api';
import type { PlayerNotification } from '../types/player.types';
import { toast } from 'sonner';

export function usePlayerNotifications(autoFetch = true) {
    const [notifications, setNotifications] = useState<PlayerNotification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await playerApi.getMyNotifications();
            // Sort by createdAt descending (newest first)
            const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setNotifications(sortedData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch notifications');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoFetch) {
            fetchNotifications();
        }
    }, [autoFetch, fetchNotifications]);

    const markAsRead = async (notificationId: number) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
        );
        try {
            await playerApi.markAsRead(notificationId);
        } catch (err: any) {
            // Revert on failure
            toast.error('فشل تحديث حالة الإشعار');
            setNotifications((prev) =>
                prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: false } : n))
            );
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        const previousState = [...notifications];
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        try {
            await playerApi.markAllAsRead();
            toast.success('تم تحديد الكل كمقروء');
        } catch (err: any) {
            toast.error('فشل تحديد الإشعارات كمقروءة');
            setNotifications(previousState);
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
}
