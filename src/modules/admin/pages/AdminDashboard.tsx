import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminDashboardRequest } from '../api/admin.api';
import type { AdminDashboardResponse } from '../types/admin.types';
import { toast } from 'sonner';
import { useLanguage } from '../../../core/context/LanguageContext';

// ─── Local dictionary ─────────────────────────────────────────────────────────
const DICT = {
  ar: {
    overview: 'نظرة عامة',
    totalUsers: 'إجمالي المستخدمين',
    totalOwners: 'إجمالي أصحاب الملاعب',
    activeFields: 'الملاعب النشطة',
    bookingsToday: 'حجوزات اليوم',
    revenue: 'الإيرادات',
    openDisputes: 'النزاعات المفتوحة',
    requiresAction: 'يتطلب اتخاذ إجراء',
    revenueSnapshot: 'ملخص الإيرادات',
    weeklyEarnings: 'نظرة عامة على الأرباح الأسبوعية',
    thisWeek: 'هذا الأسبوع',
    lastWeek: 'الأسبوع الماضي',
    pendingActions: 'الإجراءات المعلقة',
    fieldApprovals: 'الموافقات على الملاعب',
    venuesWaiting: 'ملاعب في الانتظار',
    paymentReviews: 'مراجعة المدفوعات',
    receiptsPending: 'إيصالات معلقة',
    review: 'مراجعة',
    recentAuditLogs: 'سجلات التدقيق الأخيرة',
    viewAll: 'عرض الكل',
    colAction: 'الإجراء',
    colResource: 'المورد',
    colUser: 'المستخدم',
    colTimestamp: 'الوقت والتاريخ',
    live: 'مباشر',
    today: 'اليوم',
  },
  en: {
    overview: 'Overview',
    totalUsers: 'Total Users',
    totalOwners: 'Total Owners',
    activeFields: 'Active Fields',
    bookingsToday: 'Bookings Today',
    revenue: 'Revenue',
    openDisputes: 'Open Disputes',
    requiresAction: 'REQUIRES ACTION',
    revenueSnapshot: 'Revenue Snapshot',
    weeklyEarnings: 'Weekly earnings overview',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    pendingActions: 'Pending Actions',
    fieldApprovals: 'Field Approvals',
    venuesWaiting: 'venues waiting',
    paymentReviews: 'Payment Reviews',
    receiptsPending: 'receipts pending',
    review: 'Review',
    recentAuditLogs: 'Recent Audit Logs',
    viewAll: 'View All',
    colAction: 'ACTION',
    colResource: 'RESOURCE',
    colUser: 'USER',
    colTimestamp: 'TIMESTAMP',
    live: 'LIVE',
    today: 'TODAY',
  },
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const d = DICT[lang];
  const isAr = lang === 'ar';

  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAdminDashboardRequest();
        const payload = (response as any).data || response;
        setData(payload);
      } catch (err: any) {
        toast.error(isAr ? 'فشل في جلب بيانات لوحة التحكم' : 'Failed to fetch dashboard data');
        // Fallback mock data
        setData({
          totalPlayers: 1200,
          totalOwners: 150,
          totalFields: 80,
          approvedFields: 38,
          pendingFields: 12,
          totalBookings: 3200,
          bookingsToday: 6,
          totalTournaments: 40,
          activeTournaments: 3,
          totalRevenue: 1000,
          pendingFieldApprovals: 4,
          pendingPaymentReviews: 2,
          revenueTrend: [
            { day: isAr ? 'الإث' : 'Mon', revenue: 120 },
            { day: isAr ? 'الثل' : 'Tue', revenue: 200 },
            { day: isAr ? 'الأر' : 'Wed', revenue: 150 },
            { day: isAr ? 'الخم' : 'Thu', revenue: 300 },
            { day: isAr ? 'الجم' : 'Fri', revenue: 400 },
            { day: isAr ? 'السب' : 'Sat', revenue: 500 },
            { day: isAr ? 'الأح' : 'Sun', revenue: 450 },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7]">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#006b20]">progress_activity</span>
      </div>
    );
  }

  const totalUsers = data.totalPlayers + data.totalOwners;
  const maxRev = Math.max(...(data.revenueTrend?.map(r => r.revenue) || [1]));

  const auditLogs = [
    { action: isAr ? 'تمت الموافقة على الملعب' : 'Approved Field',   resource: 'Camp Nou Arena',   user: isAr ? 'مدير النظام' : 'Admin Super User', time: isAr ? 'منذ دقيقتين' : '2 mins ago',   color: 'text-green-600',  bg: 'bg-green-50'  },
    { action: isAr ? 'رفض الإيصال' : 'Rejected Receipt',              resource: 'Booking #476',      user: isAr ? 'النظام' : 'System',               time: isAr ? 'منذ ساعة' : '1 hour ago',      color: 'text-red-600',    bg: 'bg-red-50'    },
    { action: isAr ? 'تحديث السياسة' : 'Updated Policy',              resource: isAr ? 'شروط الاستخدام' : 'Terms of Service', user: isAr ? 'مدير النظام' : 'Admin Super User', time: isAr ? 'منذ 3 ساعات' : '3 hours ago', color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { action: isAr ? 'تعليق المالك' : 'Suspended Owner',              resource: 'Owner #102',        user: isAr ? 'مدير النظام' : 'Admin Super User', time: isAr ? 'أمس' : 'Yesterday',            color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#f3f4f6] min-h-screen" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

        {/* Total Users */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">{d.totalUsers}</span>
            <span className="material-symbols-outlined text-blue-500 text-lg">group</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-gray-900">{totalUsers.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center">
              <span className="material-symbols-outlined text-[10px]">trending_up</span> +12%
            </span>
          </div>
        </div>

        {/* Total Owners */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">{d.totalOwners}</span>
            <span className="material-symbols-outlined text-purple-500 text-lg">storefront</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-gray-900">{data.totalOwners.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center">
              <span className="material-symbols-outlined text-[10px]">trending_up</span> +5%
            </span>
          </div>
        </div>

        {/* Active Fields */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">{d.activeFields}</span>
            <span className="material-symbols-outlined text-[#006b20] text-lg">stadium</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-gray-900">{data.approvedFields}</span>
            <span className="text-[10px] font-bold text-[#006b20] bg-[#f0fdf4] px-1.5 py-0.5 rounded border border-green-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> {d.live}
            </span>
          </div>
        </div>

        {/* Bookings Today */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">{d.bookingsToday}</span>
            <span className="material-symbols-outlined text-orange-500 text-lg">event_available</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-gray-900">{data.bookingsToday}</span>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
              {d.today}
            </span>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">{d.revenue}</span>
            <span className="material-symbols-outlined text-yellow-500 text-lg">payments</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-gray-900">${data.totalRevenue.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center">
              <span className="material-symbols-outlined text-[10px]">trending_up</span> +18%
            </span>
          </div>
        </div>

        {/* Open Disputes */}
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-5 shadow-sm flex flex-col justify-between text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-100">{d.openDisputes}</span>
            <span className="material-symbols-outlined text-white text-lg">warning</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-white">3</span>
            <span className="text-[10px] font-bold text-red-600 bg-white px-2 py-0.5 rounded shadow-sm">
              {d.requiresAction}
            </span>
          </div>
        </div>

      </div>

      {/* ── Charts + Pending Actions ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Snapshot */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-base font-black text-gray-900">{d.revenueSnapshot}</h2>
              <p className="text-xs text-gray-500 font-semibold">{d.weeklyEarnings}</p>
            </div>
            <select className="text-xs font-bold border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 outline-none">
              <option>{d.thisWeek}</option>
              <option>{d.lastWeek}</option>
            </select>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 px-2 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
              <div className="border-b border-gray-900 w-full"></div>
              <div className="border-b border-gray-900 w-full"></div>
              <div className="border-b border-gray-900 w-full"></div>
              <div className="border-b border-gray-900 w-full"></div>
            </div>
            {data.revenueTrend?.map((item, idx) => {
              const heightPct = maxRev > 0 ? (item.revenue / maxRev) * 100 : 0;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group z-10">
                  <div className="w-full flex justify-center h-full items-end">
                    <div
                      className="w-full max-w-[40px] bg-gradient-to-t from-[#004d17] to-[#006b20] rounded-t-md transition-all duration-300 group-hover:opacity-80 group-hover:from-green-500 group-hover:to-green-400 relative"
                      style={{ height: `${Math.max(heightPct, 5)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        ${item.revenue}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="text-base font-black text-gray-900 mb-6">{d.pendingActions}</h2>

          <div className="space-y-4 flex-1">
            {/* Field Approvals */}
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-orange-100 bg-orange-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-600">
                  <span className="material-symbols-outlined text-sm">stadium</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{d.fieldApprovals}</p>
                  <p className="text-xs text-gray-500">{data.pendingFieldApprovals} {d.venuesWaiting}</p>
                </div>
                <button className="text-xs font-bold text-orange-600 bg-white px-3 py-1.5 rounded-lg border border-orange-200 shadow-sm hover:bg-orange-50 transition-colors">
                  {d.review}
                </button>
              </div>
            </div>

            {/* Payment Reviews */}
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                  <span className="material-symbols-outlined text-sm">payments</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{d.paymentReviews}</p>
                  <p className="text-xs text-gray-500">{data.pendingPaymentReviews} {d.receiptsPending}</p>
                </div>
                <button className="text-xs font-bold text-blue-600 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm hover:bg-blue-50 transition-colors">
                  {d.review}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Recent Audit Logs ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-black text-gray-900">{d.recentAuditLogs}</h2>
          <button className="text-xs font-bold text-[#006b20] hover:text-green-800">{d.viewAll}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-wider font-bold text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3">{d.colAction}</th>
                <th className="px-6 py-3">{d.colResource}</th>
                <th className="px-6 py-3">{d.colUser}</th>
                <th className="px-6 py-3 text-right">{d.colTimestamp}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {auditLogs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${log.bg.replace('bg-', 'bg-').replace('50', '500')}`}></span>
                    <span className="text-sm font-bold text-gray-900">{log.action}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 font-medium">{log.resource}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{log.user}</td>
                  <td className="px-6 py-3 text-xs text-gray-400 font-semibold text-right">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
