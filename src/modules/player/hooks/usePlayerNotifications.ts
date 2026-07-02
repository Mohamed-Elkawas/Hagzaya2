import { create } from 'zustand';
import { playerApi } from '../api/player.api';
import type { PlayerNotification } from '../types/player.types';
import { toast } from 'sonner';

interface NotificationState {
    notifications: PlayerNotification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    
    // Actions
    fetchNotifications: () => Promise<void>;
    markAsRead: (notificationId: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await playerApi.getMyNotifications();
            // Sort by createdAt descending (newest first)
            const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            set({ 
                notifications: sortedData,
                unreadCount: sortedData.filter(n => !n.isRead).length,
                isLoading: false 
            });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch notifications', isLoading: false });
        }
    },

    markAsRead: async (notificationId: number) => {
        const { notifications } = get();
        
        // Optimistic update
        const updatedNotifications = notifications.map((n) => 
            n.notificationId === notificationId ? { ...n, isRead: true } : n
        );
        
        set({
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.isRead).length
        });
        
        try {
            await playerApi.markAsRead(notificationId);
        } catch (err: any) {
            // Revert on failure
            toast.error('فشل تحديث حالة الإشعار');
            set({
                notifications: notifications,
                unreadCount: notifications.filter(n => !n.isRead).length
            });
        }
    },

    markAllAsRead: async () => {
        const { notifications } = get();
        
        // Optimistic update
        const updatedNotifications = notifications.map((n) => ({ ...n, isRead: true }));
        
        set({
            notifications: updatedNotifications,
            unreadCount: 0
        });
        
        try {
            await playerApi.markAllAsRead();
            toast.success('تم تحديد الكل كمقروء');
        } catch (err: any) {
            // Revert on failure
            toast.error('فشل تحديد الإشعارات كمقروءة');
            set({
                notifications: notifications,
                unreadCount: notifications.filter(n => !n.isRead).length
            });
        }
    }
}));
