import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { playerApi } from '../api/player.api';
import type { PlayerNavInfo } from '../types/player.types';

export function PlayerNav() {
    const [navInfo, setNavInfo] = useState<PlayerNavInfo | null>(null);

    useEffect(() => {
        playerApi.getNavInfo()
            .then(setNavInfo)
            .catch((err) => console.error('Failed to load nav info', err));
    }, []);

    if (!navInfo) return <div className="h-10 animate-pulse bg-gray-200 rounded-full w-32" />;

    return (
        <div className="flex items-center gap-4" dir="rtl">
            <Link to="/player/notifications" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-[#3e4a3c]">
                <span className="material-symbols-outlined text-2xl">notifications</span>
                {navInfo.unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                        {navInfo.unreadNotificationsCount > 99 ? '99+' : navInfo.unreadNotificationsCount}
                    </span>
                )}
            </Link>
            
            <Link to="/player/profile" className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-[#e1e3e1]">
                <div className="flex flex-col text-left items-end">
                    <span className="text-sm font-bold text-[#191c1c] leading-tight">{navInfo.displayName}</span>
                    <span className="text-[11px] font-semibold text-[#006b20]">{navInfo.points} نقطة</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#e8f5e9] text-[#006b20] border-2 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                    {navInfo.avatarUrl ? (
                        <img src={navInfo.avatarUrl} alt={navInfo.displayName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="material-symbols-outlined text-xl">person</span>
                    )}
                </div>
            </Link>
        </div>
    );
}
