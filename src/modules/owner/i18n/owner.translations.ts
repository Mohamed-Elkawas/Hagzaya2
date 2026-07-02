export const ownerTranslations = {
    // Navigation
    'nav.dashboard': { ar: 'لوحة البيانات', en: 'Dashboard' },
    'nav.fields': { ar: 'إدارة ملاعبي', en: 'Manage Fields' },
    'nav.bookings': { ar: 'طلبات الحجز والعمليات', en: 'Bookings & Operations' },
    'nav.tournaments': { ar: 'البطولات', en: 'Tournaments' },
    'nav.payments': { ar: 'مدفوعات البطولات', en: 'Tournament Payments' },
    'nav.logout': { ar: 'تسجيل الخروج', en: 'Logout' },

    // Dashboard
    'dashboard.title': { ar: 'لوحة البيانات التحليلية', en: 'Analytical Dashboard Overview' },
    'dashboard.subtitle': { ar: 'نظرة شاملة على أداء ملاعبك، الإيرادات، والحجوزات القادمة.', en: 'Comprehensive overview of your fields performance, revenue, and upcoming bookings.' },
    'dashboard.totalRevenue': { ar: 'إجمالي الإيرادات', en: 'Total Revenue' },
    'dashboard.completedBookings': { ar: 'الحجوزات المكتملة', en: 'Completed Bookings' },
    'dashboard.upcomingBookings': { ar: 'الحجوزات القادمة', en: 'Upcoming Bookings' },
    'dashboard.fieldOccupancyRate': { ar: 'معدل إشغال الملاعب', en: 'Field Occupancy Rate' },
    'dashboard.totalRegisteredPlayers': { ar: 'إجمالي اللاعبين المسجلين', en: 'Total Registered Players' },
    
    // Charts & Tables
    'dashboard.weeklyRevenueChart': { ar: 'مؤشر الإيرادات الأسبوعي', en: 'Weekly Revenue Chart' },
    'dashboard.weeklyRevenueDesc': { ar: 'تتبع العوائد المالية خلال الأيام السبعة الماضية', en: 'Track financial returns over the past seven days' },
    'dashboard.upcomingBookingsTable': { ar: 'الحجوزات القادمة اليوم', en: 'Today\'s Upcoming Bookings' },
    'dashboard.viewAll': { ar: 'عرض الكل', en: 'View All' },
    
    // Table Headers
    'table.player': { ar: 'اللاعب', en: 'Player' },
    'table.field': { ar: 'الملعب', en: 'Field' },
    'table.time': { ar: 'الوقت', en: 'Time' },
    'table.amount': { ar: 'المبلغ', en: 'Amount' },
    'table.status': { ar: 'الحالة', en: 'Status' },
    
    // General
    'currency': { ar: 'ج.م', en: 'EGP' },
    'failedData': { ar: 'فشل جلب البيانات', en: 'Failed to fetch data' },
} as const;

export type TranslationKey = keyof typeof ownerTranslations;
