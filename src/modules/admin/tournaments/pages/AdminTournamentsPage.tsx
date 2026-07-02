import React, { useState, useEffect } from 'react';
import { adminTournamentsApi } from '../api/adminTournaments.api';
import type { AdminTournamentItem, PlatformReportResponse } from '../types/adminTournaments.types';
import { 
  Trash2, 
  Users, 
  DollarSign, 
  Trophy, 
  Activity, 
  Calendar,
  AlertCircle,
  CalendarCheck,
  TrendingUp,
  Star,
  MapPin,
  Building
} from 'lucide-react';
import { useLanguage } from '../../../../core/context/LanguageContext';

const DICT = {
  ar: {
    pageTitle: 'تقارير المنصة والبطولات',
    pageSubtitle: 'مراقبة التحليلات والإيرادات والبطولات النشطة في الوقت الفعلي.',
    tabReports: 'تقارير المنصة',
    tabTournaments: 'البطولات',
    errLoadData: 'فشل تحميل بيانات لوحة التحكم',
    confirmDelete: 'هل أنت متأكد من حذف هذه البطولة؟',
    errDelete: 'فشل حذف البطولة',
    revTotal: 'إجمالي إيرادات المنصة',
    usersTotal: 'إجمالي المستخدمين',
    thisMonth: 'هذا الشهر',
    bookingsTotal: 'إجمالي الحجوزات',
    tournamentsTotal: 'إجمالي البطولات',
    avgRating: 'متوسط تقييم الملاعب',
    topFields: 'الملاعب الأفضل أداءً',
    colFieldName: 'اسم الملعب',
    colBookings: 'الحجوزات',
    colRevenue: 'الإيرادات',
    noFieldsData: 'لا تتوفر بيانات الملاعب.',
    topOwners: 'أفضل الملاك',
    colOwnerName: 'اسم المالك',
    colFieldsCount: 'الملاعب',
    noOwnersData: 'لا تتوفر بيانات الملاك.',
    tournDirectory: 'دليل البطولات',
    filterAll: 'الكل',
    filterUpcoming: 'قادمة',
    filterOngoing: 'جارية',
    filterCompleted: 'مكتملة',
    filterCancelled: 'ملغاة',
    colTourn: 'البطولة',
    colFieldOwner: 'الملعب / المالك',
    colDateRange: 'التاريخ',
    colTeamsRatio: 'الفرق',
    colPrice: 'السعر',
    colStatus: 'الحالة',
    colActions: 'الإجراءات',
    noTournFound: 'لم يتم العثور على بطولات',
    tryAdjustFilter: 'جرب تعديل فلتر الحالة.',
    deleteTourn: 'حذف البطولة',
    unknown: 'غير معروف',
    statusUpcoming: 'قادمة',
    statusOngoing: 'جارية',
    statusCompleted: 'مكتملة',
    statusCancelled: 'ملغاة'
  },
  en: {
    pageTitle: 'Platform Reports & Tournaments',
    pageSubtitle: 'Monitor real-time analytics, revenue, and active tournaments.',
    tabReports: 'Platform Reports',
    tabTournaments: 'Tournaments',
    errLoadData: 'Failed to load dashboard data',
    confirmDelete: 'Are you sure you want to delete this tournament?',
    errDelete: 'Failed to delete tournament',
    revTotal: 'Total Platform Revenue',
    usersTotal: 'Total Users',
    thisMonth: 'this month',
    bookingsTotal: 'Total Bookings',
    tournamentsTotal: 'Total Tournaments',
    avgRating: 'Avg Field Rating',
    topFields: 'Top Performing Fields',
    colFieldName: 'Field Name',
    colBookings: 'Bookings',
    colRevenue: 'Revenue',
    noFieldsData: 'No fields data available.',
    topOwners: 'Top Owners',
    colOwnerName: 'Owner Name',
    colFieldsCount: 'Fields',
    noOwnersData: 'No owners data available.',
    tournDirectory: 'Tournaments Directory',
    filterAll: 'All',
    filterUpcoming: 'Upcoming',
    filterOngoing: 'Ongoing',
    filterCompleted: 'Completed',
    filterCancelled: 'Cancelled',
    colTourn: 'Tournament',
    colFieldOwner: 'Field / Owner',
    colDateRange: 'Date Range',
    colTeamsRatio: 'Teams Ratio',
    colPrice: 'Price',
    colStatus: 'Status',
    colActions: 'Actions',
    noTournFound: 'No tournaments found',
    tryAdjustFilter: 'Try adjusting your status filter.',
    deleteTourn: 'Delete Tournament',
    unknown: 'Unknown',
    statusUpcoming: 'Upcoming',
    statusOngoing: 'Ongoing',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled'
  }
};

export default function AdminTournamentsPage() {
  const { lang } = useLanguage();
  const d = DICT[lang];
  const isAr = lang === 'ar';
  
  const [activeTab, setActiveTab] = useState<'reports' | 'tournaments'>('reports');
  const [tournaments, setTournaments] = useState<AdminTournamentItem[]>([]);
  const [report, setReport] = useState<PlatformReportResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (status: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [tournamentsData, reportData] = await Promise.all([
        adminTournamentsApi.getAllTournaments(status),
        adminTournamentsApi.getPlatformReports()
      ]);
      setTournaments(tournamentsData || []);
      setReport(reportData || null);
    } catch (err: any) {
      console.error('Error fetching admin dashboard data:', err);
      setError(err.message || d.errLoadData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(statusFilter);
  }, [statusFilter]);

  const handleDeleteTournament = async (tournamentId: number) => {
    if (!window.confirm(d.confirmDelete)) return;
    
    try {
      await adminTournamentsApi.deleteTournament(tournamentId);
      // Optimistic update
      setTournaments(prev => prev.filter(t => t.id !== tournamentId));
    } catch (err) {
      console.error('Error deleting tournament:', err);
      alert(d.errDelete);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{d.pageTitle}</h1>
          <p className="text-slate-500 mt-1">{d.pageSubtitle}</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl shadow-sm border border-slate-200">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'reports' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Activity size={18} />
            {d.tabReports}
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'tournaments' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Trophy size={18} />
            {d.tabTournaments}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <AlertCircle size={20} className="shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* REPORTS TAB */}
      {/* ───────────────────────────────────────────────────────── */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {isLoading && !report ? (
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse h-32 lg:col-span-2"></div>
               ))}
             </div>
          ) : (
            <>
              {/* Stats Widgets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                  title={d.revTotal} 
                  value={`${report?.totalPlatformRevenue?.toLocaleString() ?? 0} EGP`} 
                  icon={<DollarSign className="text-emerald-500" size={24} />}
                />
                <StatCard 
                  title={d.usersTotal} 
                  value={report?.totalUsers?.toLocaleString() ?? 0} 
                  icon={<Users className="text-blue-500" size={24} />}
                  trend={`+${report?.newUsersThisMonth ?? 0} ${d.thisMonth}`}
                  trendUp={true}
                />
                <StatCard 
                  title={d.bookingsTotal} 
                  value={report?.totalBookingsAllTime?.toLocaleString() ?? 0} 
                  icon={<CalendarCheck className="text-indigo-500" size={24} />}
                />
                <StatCard 
                  title={d.tournamentsTotal} 
                  value={report?.totalTournamentsAllTime?.toLocaleString() ?? 0} 
                  icon={<Trophy className="text-orange-500" size={24} />}
                />
                <StatCard 
                  title={d.avgRating} 
                  value={`${report?.averageFieldRating?.toFixed(1) ?? '0.0'} / 5.0`} 
                  icon={<Star className="text-amber-400" size={24} />}
                />
              </div>

              {/* Data Tables for Fields & Owners */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                    <MapPin className="text-indigo-500" size={20} />
                    <h2 className="text-lg font-semibold text-slate-800">{d.topFields}</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className={`p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isAr ? 'text-right' : ''}`}>{d.colFieldName}</th>
                          <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">{d.colBookings}</th>
                          <th className={`p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isAr ? 'text-left' : 'text-right'}`}>{d.colRevenue}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(report?.topFields ?? []).length === 0 ? (
                          <tr><td colSpan={3} className="p-8 text-center text-slate-400 text-sm">{d.noFieldsData}</td></tr>
                        ) : (
                          report!.topFields.map((field, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className={`p-4 font-medium text-slate-800 ${isAr ? 'text-right' : ''}`}>{field.name ?? d.unknown}</td>
                              <td className="p-4 text-center text-slate-600 font-medium">{field.bookingsCount ?? 0}</td>
                              <td className={`p-4 text-emerald-600 font-semibold ${isAr ? 'text-left' : 'text-right'}`}>{field.revenue?.toLocaleString() ?? 0} EGP</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                    <Building className="text-blue-500" size={20} />
                    <h2 className="text-lg font-semibold text-slate-800">{d.topOwners}</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className={`p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isAr ? 'text-right' : ''}`}>{d.colOwnerName}</th>
                          <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">{d.colFieldsCount}</th>
                          <th className={`p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isAr ? 'text-left' : 'text-right'}`}>{d.colRevenue}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(report?.topOwners ?? []).length === 0 ? (
                          <tr><td colSpan={3} className="p-8 text-center text-slate-400 text-sm">{d.noOwnersData}</td></tr>
                        ) : (
                          report!.topOwners.map((owner, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className={`p-4 font-medium text-slate-800 ${isAr ? 'text-right' : ''}`}>{owner.ownerName ?? d.unknown}</td>
                              <td className="p-4 text-center text-slate-600 font-medium">{owner.fieldsCount ?? 0}</td>
                              <td className={`p-4 text-emerald-600 font-semibold ${isAr ? 'text-left' : 'text-right'}`}>{owner.totalRevenue?.toLocaleString() ?? 0} EGP</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* TOURNAMENTS TAB */}
      {/* ───────────────────────────────────────────────────────── */}
      {activeTab === 'tournaments' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50/50">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Trophy size={20} className="text-orange-500" />
              {d.tournDirectory}
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {[
                { val: 'All', label: d.filterAll },
                { val: 'Upcoming', label: d.filterUpcoming },
                { val: 'Ongoing', label: d.filterOngoing },
                { val: 'Completed', label: d.filterCompleted },
                { val: 'Cancelled', label: d.filterCancelled }
              ].map(statusObj => (
                <button
                  key={statusObj.val}
                  onClick={() => setStatusFilter(statusObj.val)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    statusFilter === statusObj.val 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {statusObj.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className={isAr ? 'text-right' : 'text-left'}>
                <tr className="bg-white text-slate-500 text-sm border-b border-slate-200">
                  <th className={`p-4 ${isAr ? 'pr-6' : 'pl-6'} font-medium`}>{d.colTourn}</th>
                  <th className="p-4 font-medium">{d.colFieldOwner}</th>
                  <th className="p-4 font-medium">{d.colDateRange}</th>
                  <th className="p-4 font-medium text-center">{d.colTeamsRatio}</th>
                  <th className={`p-4 font-medium ${isAr ? 'text-left' : 'text-right'}`}>{d.colPrice}</th>
                  <th className="p-4 font-medium text-center">{d.colStatus}</th>
                  <th className={`p-4 ${isAr ? 'pl-6' : 'pr-6'} font-medium ${isAr ? 'text-left' : 'text-right'}`}>{d.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      <div className="animate-pulse flex flex-col items-center gap-3">
                        <div className="h-4 w-32 bg-slate-200 rounded"></div>
                        <div className="h-3 w-24 bg-slate-100 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ) : tournaments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Trophy size={32} className="text-slate-300" />
                        <p className="font-medium text-slate-600">{d.noTournFound}</p>
                        <p className="text-sm">{d.tryAdjustFilter}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tournaments.map((tournament) => (
                    <tr key={tournament.id} className={`hover:bg-slate-50/80 transition-colors group ${isAr ? 'text-right' : 'text-left'}`}>
                      <td className={`p-4 ${isAr ? 'pr-6' : 'pl-6'}`}>
                        <p className="font-semibold text-slate-800">{tournament.name ?? d.unknown}</p>
                        <p className="text-xs text-slate-500 mt-0.5">ID: {tournament.id}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-700">{tournament.fieldName ?? '-'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{tournament.ownerName ?? '-'}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-slate-600 bg-slate-100/50 w-fit px-2 py-1.5 rounded-md">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-indigo-400" />
                            <span className="text-xs font-medium">
                              {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB') : '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CalendarCheck size={12} className="text-slate-400" />
                            <span className="text-xs text-slate-500">
                              {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB') : '-'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-sm font-medium text-slate-700">
                          {tournament.teamsJoined ?? 0} / {tournament.numberOfTeams ?? '-'}
                        </span>
                      </td>
                      <td className={`p-4 font-semibold text-slate-700 ${isAr ? 'text-left' : 'text-right'}`}>
                        {tournament.price?.toLocaleString() ?? 0} EGP
                      </td>
                      <td className="p-4 text-center">
                        <StatusBadge status={tournament.status} dict={d} />
                      </td>
                      <td className={`p-4 ${isAr ? 'pl-6' : 'pr-6'} ${isAr ? 'text-left' : 'text-right'}`}>
                        <button
                          onClick={() => handleDeleteTournament(tournament.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                          title={d.deleteTourn}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendUp }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3.5 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-slate-500 text-sm font-medium mb-1.5">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
        {trend && (
          <p className={`text-sm mt-3 font-medium flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-slate-500'}`}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, dict }: { status: string, dict: any }) {
  const styles: Record<string, string> = {
    Upcoming: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Ongoing: 'bg-blue-50 text-blue-700 border-blue-200',
    Completed: 'bg-slate-100 text-slate-700 border-slate-300',
    Cancelled: 'bg-red-50 text-red-700 border-red-200'
  };

  const labels: Record<string, string> = {
    Upcoming: dict.statusUpcoming,
    Ongoing: dict.statusOngoing,
    Completed: dict.statusCompleted,
    Cancelled: dict.statusCancelled
  };

  const defaultStyle = 'bg-slate-50 text-slate-700 border-slate-200';
  const style = styles[status] || defaultStyle;
  const label = labels[status] || status || dict.unknown;

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${style}`}>
      {label}
    </span>
  );
}
