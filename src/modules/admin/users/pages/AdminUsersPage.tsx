// src/modules/admin/users/pages/AdminUsersPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAdminApi } from '../api/users.api';
import type { AdminUserListItem } from '../types/users.types';
import {
    Users, UserCheck, ShieldAlert, Ban, Search,
    Filter, Eye, ShieldX, Download, ChevronLeft, ChevronRight, X
} from 'lucide-react';

export default function AdminUsersPage() {
    const navigate = useNavigate();
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
        if (!banReason) return alert("Please provide a reason");
        try {
            await usersAdminApi.banUser(selectedUserForAction.id, selectedUserForAction.role, { reason: banReason });
            alert("User banned successfully");
            setSelectedUserForAction(null);
            setBanReason('');
            fetchUsers();
        } catch (error) {
            console.error("Failed to ban user:", error);
            alert("Failed to ban user");
        }
    };

    // Calculate pagination details
    const totalPages = Math.ceil(totalUsers / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize + 1;
    const MathMin = Math.min;
    const endIndex = MathMin(currentPage * pageSize, totalUsers);

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Governance</h1>
                    <p className="text-sm text-slate-500 mt-1">Monitor compliance, manage accounts, and enforce platform regulations across all users.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
                        <Download size={16} /> Export Audit Log
                    </button>
                    <button className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:bg-slate-800 transition-all">
                        Platform Policies
                    </button>
                </div>
            </div>

            {/* Premium Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12% this week</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">12,482</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Total Active Users</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl"><ShieldAlert size={20} /></div>
                        <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">High Risk</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">1.4%</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Non-show Rate</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><UserCheck size={20} /></div>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-full">Last 7 days</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">42</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Active Warnings</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110"><Ban size={80} /></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl"><Ban size={20} /></div>
                        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Review All</button>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">18</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Banned Accounts</p>
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
                                {tab === 'All' ? 'All Users' : tab + 's'}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search Identity, Email..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full lg:w-72 bg-slate-50 transition-all"
                            />
                        </div>
                        <button className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                            <Filter size={16} /> Filters
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="p-5 font-semibold">User Details</th>
                                <th className="p-5 font-semibold">Contact Info</th>
                                <th className="p-5 font-semibold">Role</th>
                                <th className="p-5 font-semibold">Platform Stats</th>
                                <th className="p-5 font-semibold">Status</th>
                                <th className="p-5 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400 font-medium">Loading Governance Data...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400 font-medium">No users match your criteria.</td></tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">UID: #{user.id.toString().padStart(5, '0')}</p>
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
                                                <div className="flex justify-between w-24"><span>Fields:</span> <span className="font-bold text-slate-900">{user.fieldsCount ?? 0}</span></div>
                                                <div className="flex justify-between w-24"><span>Bookings:</span> <span className="font-bold text-slate-900">{user.totalBookings ?? 0}</span></div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between w-24"><span>Points:</span> <span className="font-bold text-indigo-600">{user.points ?? 0}</span></div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        {user.isBanned ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 shadow-[0_0_10px_rgba(225,29,72,0.1)]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                                Banned
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => navigate(`/admin/users/${user.id}?role=${user.role}`)}
                                                className="p-2 hover:bg-white border border-transparent hover:border-slate-200 shadow-sm rounded-lg text-slate-600 hover:text-indigo-600 transition-all bg-slate-50" 
                                                title="View 360 Profile"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => setSelectedUserForAction(user)}
                                                className="p-2 hover:bg-rose-50 border border-transparent hover:border-rose-100 shadow-sm rounded-lg text-slate-600 hover:text-rose-600 transition-all bg-slate-50"
                                                title="Restrict User"
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
                        Showing <span className="font-bold text-slate-900">{totalUsers === 0 ? 0 : startIndex}</span> to <span className="font-bold text-slate-900">{endIndex}</span> of <span className="font-bold text-slate-900">{totalUsers}</span> users
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
                                    <h3 className="font-bold text-slate-900">Enforce Restriction</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Disciplinary Action Panel</p>
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
                                <label className="text-sm font-bold text-slate-700 block mb-2">Reason for Ban <span className="text-rose-500">*</span></label>
                                <textarea
                                    rows={4}
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    placeholder="Provide a detailed, professional reason for this enforcement..."
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition-all shadow-sm"
                                />
                                <p className="text-xs text-slate-400 mt-2">This reason will be logged in the permanent audit trail.</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
                            <button
                                onClick={() => setSelectedUserForAction(null)}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBan}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-200 transition-all flex items-center gap-2"
                            >
                                <Ban size={16} /> Confirm Ban
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}