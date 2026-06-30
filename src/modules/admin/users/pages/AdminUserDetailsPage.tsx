// src/modules/admin/users/pages/AdminUserDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, Calendar, Mail, Phone, Ban, User, ArrowLeft, Activity, Target, Star, FileText } from 'lucide-react';
import { usersAdminApi } from '../api/users.api';
import type { AdminUserListItem } from '../types/users.types';

export default function AdminUserDetailsPage() {
    const { userId } = useParams<{ userId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const role = searchParams.get('role') as 'Owner' | 'Player' | null;

    const [user, setUser] = useState<AdminUserListItem | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal State for banning
    const [showBanModal, setShowBanModal] = useState(false);
    const [banReason, setBanReason] = useState('');

    useEffect(() => {
        if (userId && role) {
            fetchUser();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, role]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const data = await usersAdminApi.getUserById(Number(userId), role!);
            setUser(data);
        } catch (error) {
            console.error("Error fetching user details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBanUser = async () => {
        if (!user || !banReason) return alert("Please provide a reason");
        try {
            await usersAdminApi.banUser(user.id, user.role, { reason: banReason });
            alert("User banned successfully");
            setShowBanModal(false);
            setBanReason('');
            fetchUser();
        } catch (error) {
            console.error("Failed to ban user:", error);
            alert("Failed to ban user");
        }
    };

    const handleUnbanUser = async () => {
        if (!user) return;
        try {
            await usersAdminApi.unbanUser(user.id, user.role);
            alert("User unbanned successfully");
            fetchUser();
        } catch (error) {
            console.error("Failed to unban user:", error);
            alert("Failed to unban user");
        }
    };

    if (loading) {
        return (
            <div className="p-8 bg-[#f8fafc] min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Retrieving Profile Matrix...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-8 bg-[#f8fafc] min-h-screen flex flex-col items-center justify-center">
                <ShieldAlert size={48} className="text-rose-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
                <p className="text-slate-500 mb-6">The requested user identity could not be located or has invalid role parameters.</p>
                <button onClick={() => navigate('/admin/users')} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-all">
                    Return to Directory
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans space-y-6">
            {/* Top Navigation */}
            <button 
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
            >
                <ArrowLeft size={16} /> Back to Directory
            </button>

            {/* Hero Profile Header */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
                {/* Background Pattern */}
                <div className="h-32 bg-gradient-to-r from-slate-900 to-indigo-900 w-full relative">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                </div>
                
                <div className="px-8 pb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-12 relative z-10">
                    <div className="flex items-end gap-6">
                        <div className="w-28 h-28 rounded-2xl bg-white p-1.5 shadow-lg border border-slate-100">
                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-4xl shadow-inner">
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                        </div>
                        <div className="mb-2">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user.firstName} {user.lastName}</h1>
                                {user.isBanned ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 shadow-[0_0_10px_rgba(225,29,72,0.1)]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Banned
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                <span className="flex items-center gap-1.5"><User size={14} /> @{user.username}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="flex items-center gap-1.5"><Activity size={14} /> UID: #{user.id.toString().padStart(5, '0')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className={`px-4 py-1.5 rounded-lg text-sm font-bold uppercase tracking-widest shadow-sm ${user.role === 'Owner' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                            {user.role} Account
                        </span>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: Identity & Contact */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-base">
                        <FileText size={18} className="text-indigo-600" /> Identity & Contact
                    </h3>
                    <div className="space-y-5">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                            <p className="flex items-center gap-2 text-slate-800 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <Mail size={16} className="text-slate-400" /> {user.email}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                            <p className="flex items-center gap-2 text-slate-800 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <Phone size={16} className="text-slate-400" /> {user.phone}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Registration Date</p>
                            <p className="flex items-center gap-2 text-slate-800 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <Calendar size={16} className="text-slate-400" /> {new Date(user.createdOn).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Platform Performance */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-base">
                            <Target size={18} className="text-indigo-600" /> Platform Performance
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {user.role === 'Owner' ? (
                                <>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Facilities</p>
                                        <h4 className="text-4xl font-black text-slate-900">{user.fieldsCount ?? 0}</h4>
                                        <p className="text-xs text-slate-500 font-medium mt-2">Active registered fields</p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bookings Volume</p>
                                        <h4 className="text-4xl font-black text-indigo-600">{user.totalBookings ?? 0}</h4>
                                        <p className="text-xs text-slate-500 font-medium mt-2">Lifetime reservations</p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Average Rating</p>
                                        <h4 className="text-4xl font-black text-amber-500 flex items-center gap-2">
                                            {user.averageRating ?? 0} <Star size={24} className="fill-amber-500 text-amber-500" />
                                        </h4>
                                        <p className="text-xs text-slate-500 font-medium mt-2">Customer satisfaction</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Loyalty Points</p>
                                        <h4 className="text-4xl font-black text-indigo-600">{user.points ?? 0}</h4>
                                        <p className="text-xs text-slate-500 font-medium mt-2">Earned through activity</p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Team Affiliation</p>
                                        <h4 className="text-4xl font-black text-slate-900">{user.teamId ?? 'None'}</h4>
                                        <p className="text-xs text-slate-500 font-medium mt-2">Current active roster</p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System Standing</p>
                                        <h4 className={`text-2xl font-black mt-2 flex items-center gap-2 ${user.isBanned ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {user.isBanned ? <><Ban size={24} /> Banned</> : <><ShieldAlert size={24} className="opacity-0" /> Good Standing</>}
                                        </h4>
                                        <p className="text-xs text-slate-500 font-medium mt-2">No active warnings</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Danger Zone / Disciplinary Action */}
                    <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
                        <div className="bg-rose-50/50 p-6 border-b border-rose-100">
                            <h3 className="font-bold text-rose-800 flex items-center gap-2 text-base">
                                <ShieldAlert size={18} /> Disciplinary Actions
                            </h3>
                            <p className="text-sm text-rose-600/80 mt-1 font-medium">Manage platform access and review restriction history.</p>
                        </div>
                        
                        <div className="p-6 bg-white">
                            {user.isBanned ? (
                                <div className="space-y-4">
                                    <div className="bg-rose-50 rounded-xl p-4 border border-rose-100 flex items-start gap-4">
                                        <div className="bg-rose-200 p-2 rounded-lg text-rose-700 shrink-0"><Ban size={20} /></div>
                                        <div>
                                            <h4 className="font-bold text-rose-900 text-sm">Active Restriction</h4>
                                            <p className="text-sm text-rose-700 mt-1 font-medium">{user.banReason || 'No specific reason was provided during enforcement.'}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleUnbanUser}
                                        className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-md hover:bg-slate-800 transition-all"
                                    >
                                        Revoke Ban & Restore Access
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">Restrict Account Access</h4>
                                        <p className="text-sm text-slate-500 font-medium mt-1">Suspend this user from accessing platform services.</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowBanModal(true)}
                                        className="bg-rose-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] hover:bg-rose-700 hover:shadow-[0_6px_20px_rgba(225,29,72,0.23)] hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        Enforce Ban
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ban Modal Overlay */}
            {showBanModal && (
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
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 mb-2">
                                <p className="text-sm font-semibold text-rose-800">You are about to ban <span className="font-black">{user.firstName} {user.lastName}</span>.</p>
                                <p className="text-xs text-rose-600 mt-1">This will immediately revoke their access to the platform.</p>
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
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowBanModal(false)}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBanUser}
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
