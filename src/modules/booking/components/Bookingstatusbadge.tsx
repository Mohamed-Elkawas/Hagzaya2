import type { BookingStatus } from '../types/Booking.enums';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_STYLES } from '../types/Booking.enums';

interface BookingStatusBadgeProps {
    status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
    // إضافة Fallback بسيط في حال كان الـ status غير معروف
    const style = BOOKING_STATUS_STYLES[status] || { bg: 'bg-gray-100', text: 'text-gray-600' };
    const label = BOOKING_STATUS_LABELS[status] || 'غير معروف';

    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${style.bg} ${style.text}`}
        >
            {label}
        </span>
    );
}