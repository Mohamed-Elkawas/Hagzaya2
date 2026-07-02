// src/modules/admin/users/pages/AdminUsersPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAdminApi } from '../api/users.api';
import type { AdminUserListItem } from '../types/users.types';
import {
    Users, UserCheck, ShieldAlert, Ban, Search,
    Filter, Eye, ShieldX, Download, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useLanguage } from '../../../../core/context/LanguageContext';

const DICT = {
    ar: {
        pageTitle: 'إدارة المستخدمين',
        pageSubtitle: 'مراقبة الامتثال وإدارة الحسابات وتطبيق لوائح المنصة على جميع المستخدمين.',
        exportAudit: 'تصدير سجل التدقيق',
        platformPolicies: 'سياسات المنصة',
        totalUsers: 'إجمالي المستخدمين النشطين',
        thisWeek: 'هذا الأسبوع',
        highRisk: 'مخاطر عالية',
        nonShowRate: 'معدل عدم الحضور',
        last7Days: 'آخر 7 أيام',
        activeWarnings: 'الإنذارات النشطة',
        reviewAll: 'مراجعة الكل',
        bannedAccounts: 'الحسابات المحظورة',
        allUsers: 'كل المستخدمين',
        tabOwners: 'ملاك',
        tabPlayers: 'لاعبين',
        tabBanned: 'محظورين',
        searchPlh: 'ابحث بالهوية، البريد...',
        filters: 'فلاتر',
        colUser: 'تفاصيل المستخدم',
        colContact: 'معلومات الاتصال',
        colRole: 'الدور',
        colStats: 'إحصائيات المنصة',
        colStatus: 'الحالة',
        colActions: 'الإجراءات',
        loadingData: 'جاري تحميل بيانات الإدارة...',
        noUsers: 'لا يوجد مستخدمون يطابقون معاييرك.',
        uid: 'معرف',
        lblFields: 'الملاعب:',
        lblBookings: 'الحجوزات:',
        lblPoints: 'النقاط:',
        lblActive: 'نشط',
        lblBanned: 'محظور',
        viewProfile: 'عرض الملف الشخصي',
        restrictUser: 'تقييد المستخدم',
        showing: 'عرض',
        to: 'إلى',
        of: 'من',
        usersWord: 'مستخدمين',
        enforceRes: 'تطبيق التقييد',
        disciplinePanel: 'لوحة الإجراءات التأديبية',
        banReason: 'سبب الحظر',
        banReasonPlh: 'قدم سبباً مفصلاً واحترافياً لهذا الإجراء...',
        auditLogMsg: 'سيتم تسجيل هذا السبب في سجل التدقيق الدائم.',
        cancel: 'إلغاء',
        confirmBan: 'تأكيد الحظر',
        errNoReason: 'يرجى تقديم سبب',
        msgBanSuccess: 'تم حظر المستخدم بنجاح',
        msgBanFailed: 'فشل حظر المستخدم'
    },
    en: {
        pageTitle: 'User Governance',
        pageSubtitle: 'Monitor compliance, manage accounts, and enforce platform regulations across all users.',
        exportAudit: 'Export Audit Log',
        platformPolicies: 'Platform Policies',
        totalUsers: 'Total Active Users',
        thisWeek: 'this week',
        highRisk: 'High Risk',
        nonShowRate: 'Non-show Rate',
        last7Days: 'Last 7 days',
        activeWarnings: 'Active Warnings',
        reviewAll: 'Review All',
        bannedAccounts: 'Banned Accounts',
        allUsers: 'All Users',
        tabOwners: 'Owners',
        tabPlayers: 'Players',
        tabBanned: 'Banned',
        searchPlh: 'Search Identity, Email...',
        filters: 'Filters',
        colUser: 'User Details',
        colContact: 'Contact Info',
        colRole: 'Role',
        colStats: 'Platform Stats',
        colStatus: 'Status',
        colActions: 'Actions',
        loadingData: 'Loading Governance Data...',
        noUsers: 'No users match your criteria.',
        uid: 'UID',
        lblFields: 'Fields:',
        lblBookings: 'Bookings:',
        lblPoints: 'Points:',
        lblActive: 'Active',
        lblBanned: 'Banned',
        viewProfile: 'View 360 Profile',
        restrictUser: 'Restrict User',
        showing: 'Showing',
        to: 'to',
        of: 'of',
        usersWord: 'users',
        enforceRes: 'Enforce Restriction',
        disciplinePanel: 'Disciplinary Action Panel',
        banReason: 'Reason for Ban',
        banReasonPlh: 'Provide a detailed, professional reason for this enforcement...',
        auditLogMsg: 'This reason will be logged in the permanent audit trail.',
        cancel: 'Cancel',
        confirmBan: 'Confirm Ban',
        errNoReason: 'Please provide a reason',
        msgBanSuccess: 'User banned successfully',
        msgBanFailed: 'Failed to ban user'
    }
};

export default function AdminUsersPage() {
    const navigate = useNavigate();
    const { lang } = useLanguage();
    const d = DICT[lang];
    const isAr = lang === 'ar';
    const [users, setUsers] = useState<AdminUserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'All' | 'Owner' | 'Player' | 'Banned'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    
    // Ban Modal state
    const [selectedUserForAction, setSelectedUserForAction] = useState<AdminUserListItem | null>(null);
    const [banReason, setBanReason] = useState('');

    useEffect(() => {
        fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, searchTerm, currentPage]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const roleParam = activeTab === 'Owner' || activeTab === 'Player' ? activeTab : undefined;
            const bannedParam = activeTab === 'Banned' ? true : undefined;

            const data = await usersAdminApi.getUsers({
                search: searchTerm,
                role: roleParam,
                isBanned: bannedParam,
                page: currentPage,
                pageSize: pageSize
            });
            setUsers(data.items || []);
            setTotalUsers(data.total || 0); // Using data.total as per contract
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async () => {
        if (!selectedUserForAction) return;
        if (!banReason) return alert(d.errNoReason);
        try {
            await usersAdminApi.banUser(selectedUserForAction.id, selectedUserForAction.role, { reason: banReason });
            alert(d.msgBanSuccess);
            setSelectedUserForAction(null);
            setBanReason('');
            fetchUsers();
        } catch (error) {
            console.error("Failed to ban user:", error);
            alert(d.msgBanFailed);
        }
    };

    // Calculate pagination details
    const totalPages = Math.ceil(totalUsers / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize + 1;
    const MathMin = Math.min;
    const endIndex = MathMin(currentPage * pageSize, totalUsers);

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{d.pageTitle}</h1>
                    <p className="text-sm text-slate-500 mt-1">{d.pageSubtitle}</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
                        <Download size={16} /> {d.exportAudit}
                    </button>
                    <button className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:bg-slate-800 transition-all">
                        {d.platformPolicies}
                    </button>
                </div>
            </div>

            {/* Premium Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12% {d.thisWeek}</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">12,482</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">{d.totalUsers}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl"><ShieldAlert size={20} /></div>
                        <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">{d.highRisk}</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">1.4%</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">{d.nonShowRate}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><UserCheck size={20} /></div>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-full">{d.last7Days}</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">42</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">{d.activeWarnings}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110"><Ban size={80} /></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl"><Ban size={20} /></div>
                        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">{d.reviewAll}</button>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">18</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">{d.bannedAccounts}</p>
                    </div>
                </div>
            </div>

            {/* Main Data Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                {/* Filters Bar */}
                <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm">
                    <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1 self-start">
                        {(['All', 'Owner', 'Player', 'Banned'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab 
                                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                    }`}
                            >
                                {tab === 'All' ? d.allUsers : tab === 'Owner' ? d.tabOwners : tab === 'Player' ? d.tabPlayers : d.tabBanned}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder={d.searchPlh}
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full lg:w-72 bg-slate-50 transition-all"
                            />
                        </div>
                        <button className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                            <Filter size={16} /> {d.filters}
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="p-5 font-semibold">{d.colUser}</th>
                                <th className="p-5 font-semibold">{d.colContact}</th>
                                <th className="p-5 font-semibold">{d.colRole}</th>
                                <th className="p-5 font-semibold">{d.colStats}</th>
                                <th className="p-5 font-semibold">{d.colStatus}</th>
                                <th className="p-5 font-semibold text-right">{d.colActions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400 font-medium">{d.loadingData}</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400 font-medium">{d.noUsers}</td></tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">{d.uid}: #{user.id.toString().padStart(5, '0')}</p>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <p className="font-medium text-slate-700">{user.email}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{user.phone}</p>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${user.role === 'Owner' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-purple-50 text-purple-700 border border-purple-100'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-5 font-medium text-xs text-slate-600">
                                        {user.role === 'Owner' ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between w-24"><span>{d.lblFields}</span> <span className="font-bold text-slate-900">{user.fieldsCount ?? 0}</span></div>
                                                <div className="flex justify-between w-24"><span>{d.lblBookings}</span> <span className="font-bold text-slate-900">{user.totalBookings ?? 0}</span></div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between w-24"><span>{d.lblPoints}</span> <span className="font-bold text-indigo-600">{user.points ?? 0}</span></div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        {user.isBanned ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 shadow-[0_0_10px_rgba(225,29,72,0.1)]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                                {d.lblBanned}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                {d.lblActive}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => navigate(`/admin/users/${user.id}?role=${user.role}`)}
                                                className="p-2 hover:bg-white border border-transparent hover:border-slate-200 shadow-sm rounded-lg text-slate-600 hover:text-indigo-600 transition-all bg-slate-50" 
                                                title={d.viewProfile}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => setSelectedUserForAction(user)}
                                                className="p-2 hover:bg-rose-50 border border-transparent hover:border-rose-100 shadow-sm rounded-lg text-slate-600 hover:text-rose-600 transition-all bg-slate-50"
                                                title={d.restrictUser}
                                            >
                                                <ShieldX size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-600 font-medium">
                        {d.showing} <span className="font-bold text-slate-900">{totalUsers === 0 ? 0 : startIndex}</span> {d.to} <span className="font-bold text-slate-900">{endIndex}</span> {d.of} <span className="font-bold text-slate-900">{totalUsers}</span> {d.usersWord}
                    </p>
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Modal for Ban Action */}
            {selectedUserForAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><ShieldAlert size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{d.enforceRes}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{d.disciplinePanel}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedUserForAction(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                                    {selectedUserForAction.firstName[0]}{selectedUserForAction.lastName[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{selectedUserForAction.firstName} {selectedUserForAction.lastName}</p>
                                    <p className="text-xs text-slate-500 font-medium">{selectedUserForAction.email}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-2">{d.banReason} <span className="text-rose-500">*</span></label>
                                <textarea
                                    rows={4}
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    placeholder={d.banReasonPlh}
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition-all shadow-sm"
                                />
                                <p className="text-xs text-slate-400 mt-2">{d.auditLogMsg}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
                            <button
                                onClick={() => setSelectedUserForAction(null)}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors"
                            >
                                {d.cancel}
                            </button>
                            <button
                                onClick={handleBan}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-200 transition-all flex items-center gap-2"
                            >
                                <Ban size={16} /> {d.confirmBan}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}