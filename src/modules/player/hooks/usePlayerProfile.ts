import { useState, useCallback, useEffect } from 'react';
import { playerApi } from '../api/player.api';
import type { PlayerProfileResponse, PlayerPointsResponse, UpdatePlayerProfileRequest } from '../types/player.types';
import { toast } from 'sonner';

export function usePlayerProfile(autoFetch = true) {
    const [profile, setProfile] = useState<PlayerProfileResponse | null>(null);
    const [points, setPoints] = useState<PlayerPointsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [profileData, pointsData] = await Promise.all([
                playerApi.getMyProfile(),
                playerApi.getMyPoints().catch(() => null) // Points might fail or be empty, don't break profile
            ]);
            setProfile(profileData);
            if (pointsData) setPoints(pointsData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch player profile');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoFetch) {
            fetchProfile();
        }
    }, [autoFetch, fetchProfile]);

    const updateProfile = async (request: UpdatePlayerProfileRequest) => {
        try {
            const updatedProfile = await playerApi.updateMyProfile(request);
            setProfile(updatedProfile);
            toast.success('تم تحديث الملف الشخصي بنجاح');
            return updatedProfile;
        } catch (err: any) {
            toast.error(err.message || 'فشل تحديث الملف الشخصي');
            throw err;
        }
    };

    const deleteAccount = async () => {
        try {
            await playerApi.deleteAccount();
            toast.success('تم حذف الحساب بنجاح');
            localStorage.removeItem('hagzaya_token');
            localStorage.removeItem('accessToken');
            window.location.href = '/';
        } catch (err: any) {
            toast.error(err.message || 'فشل حذف الحساب');
            throw err;
        }
    };

    return {
        profile,
        points,
        isLoading,
        error,
        fetchProfile,
        updateProfile,
        deleteAccount
    };
}
