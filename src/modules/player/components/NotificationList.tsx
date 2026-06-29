import { usePlayerNotifications } from '../hooks/usePlayerNotifications';
import { NOTIFICATION_TYPE_ICONS, NOTIFICATION_TYPE_LABELS } from '../types/player.enums';

export function NotificationList() {
    const { notifications, unreadCount, isLoading, error, markAsRead, markAllAsRead } = usePlayerNotifications();

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <span className="material-symbols-outlined animate-spin text-3xl text-[#006b20]">progress_activity</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#fdecea] p-4 rounded-xl text-center">
                <p className="text-sm font-bold text-[#c62828]">{error}</p>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#e1e3e1] shadow-sm">
                <span className="material-symbols-outlined text-4xl text-[#3e4a3c]/30 mb-3">notifications_paused</span>
                <p className="text-sm font-bold text-[#3e4a3c]/60">لا توجد إشعارات حالياً</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-[#e1e3e1] shadow-sm overflow-hidden" dir="rtl">
            <div className="p-4 border-b border-[#e1e3e1] flex items-center justify-between bg-[#fcfdfc]">
                <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-[#191c1c] text-lg">الإشعارات</h2>
                    {unreadCount > 0 && (
                        <span className="bg-[#006b20] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            {unreadCount} جديد
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-[#006b20] hover:text-[#005318] hover:underline"
                    >
                        تحديد الكل كمقروء
                    </button>
                )}
            </div>

            <div className="divide-y divide-[#e1e3e1] max-h-[500px] overflow-y-auto">
                {notifications.map((notif) => {
                    const icon = NOTIFICATION_TYPE_ICONS[notif.type] || 'notifications';
                    const label = NOTIFICATION_TYPE_LABELS[notif.type] || 'إشعار';
                    const dateObj = new Date(notif.createdAt);
                    const formattedDate = dateObj.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
                    const formattedTime = dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

                    return (
                        <div
                            key={notif.notificationId}
                            className={`p-4 flex gap-4 transition-colors ${
                                notif.isRead ? 'bg-white opacity-70' : 'bg-[#e8f5e9]/20'
                            }`}
                        >
                            <div
                                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
                                    notif.isRead ? 'bg-[#f0f2f0] text-[#3e4a3c]' : 'bg-[#e8f5e9] text-[#006b20]'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f0f2f0] text-[#3e4a3c]">
                                            {label}
                                        </span>
                                        {!notif.isRead && (
                                            <span className="w-2 h-2 rounded-full bg-red-500" />
                                        )}
                                    </div>
                                    <span className="text-[10px] font-semibold text-[#3e4a3c]/60 whitespace-nowrap">
                                        {formattedDate} · {formattedTime}
                                    </span>
                                </div>
                                <h4 className={`text-sm mb-1 ${notif.isRead ? 'font-bold text-[#3e4a3c]' : 'font-extrabold text-[#191c1c]'}`}>
                                    {notif.title}
                                </h4>
                                <p className="text-xs text-[#3e4a3c] leading-relaxed">
                                    {notif.message}
                                </p>
                                
                                {!notif.isRead && (
                                    <button
                                        onClick={() => markAsRead(notif.notificationId)}
                                        className="mt-3 text-[11px] font-bold text-[#006b20] flex items-center gap-1 hover:underline"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">done_all</span>
                                        تحديد كمقروء
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
