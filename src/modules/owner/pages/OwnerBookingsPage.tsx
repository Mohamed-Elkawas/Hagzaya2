import React, { useEffect, useState } from 'react';
import { ownerApi } from '../api/owner.api';
import type { BookingRequest, DailyOperations } from '../api/owner.api';
import { toast } from 'sonner';
import { 
    CreditCard, Calendar, Clock, MapPin, 
    CheckCircle2, User, Activity, CheckCircle, Smartphone
} from 'lucide-react';

import { useLanguage } from '../../../core/context/LanguageContext';

export function OwnerBookingsPage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'requests' | 'operations'>('requests');
    
    // Data states
    const [requests, setRequests] = useState<BookingRequest[]>([]);
    const [operations, setOperations] = useState<DailyOperations | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState<number | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'requests') {
                const reqs = await ownerApi.getBookingRequests();
                // Ensure it's an array
                setRequests(Array.isArray(reqs) ? reqs : (reqs as any)?.data || []);
            } else {
                const ops = await ownerApi.getDailyOperations();
                setOperations(ops);
            }
        } catch (error) {
            toast.error('فشل جلب البيانات. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleApprove = async (bookingId: number) => {
        setIsActionLoading(bookingId);
        try {
            await ownerApi.approveBookingRequest(bookingId, { notes: 'تم التأكيد من قبل المالك' });
            toast.success('تم تأكيد الحجز بنجاح!');
            await fetchData();
        } catch (error) {
            toast.error('حدث خطأ أثناء تأكيد الحجز.');
        } finally {
            setIsActionLoading(null);
        }
    };

    return (
        <div className="p-4 md:p-8">
            
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-8 mb-8 rounded-2xl">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('owner.bookings.title')}</h1>
                    <p className="text-sm font-medium text-slate-500 mt-2">
                        {t('owner.bookings.subtitle')}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                
                {/* ── Custom Tabs ── */}
                <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-xl border border-slate-200 w-fit shadow-sm">
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        {t('owner.bookings.tab.requests')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('operations')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'operations' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        {t('owner.bookings.tab.operations')}
                    </button>
                </div>

                {/* ── Tab Content ── */}
                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200" />)}
                    </div>
                ) : activeTab === 'requests' ? (
                    
                    /* ── Requests Tab ── */
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-slate-300">
                                <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-black text-slate-800 mb-2">{t('owner.bookings.empty.requests')}</h3>
                                <p className="text-slate-500 font-medium">{t('owner.bookings.empty.requests.sub')}</p>
                            </div>
                        ) : (
                            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                                        <tr>
                                            <th className="px-5 py-3.5 text-right">{t('owner.bookings.col.player')}</th>
                                            <th className="px-5 py-3.5 text-right">{t('owner.bookings.col.field')}</th>
                                            <th className="px-5 py-3.5 text-right">{t('owner.bookings.col.date')} / {t('owner.bookings.col.time')}</th>
                                            <th className="px-5 py-3.5 text-right">{t('owner.bookings.col.price')}</th>
                                            <th className="px-5 py-3.5 text-center">{t('owner.bookings.col.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {requests.map((req) => (
                                            <tr key={req.id}>
                                                <td className="px-5 py-4 font-bold text-slate-900">{req.playerName}</td>
                                                <td className="px-5 py-4 text-slate-600">{req.fieldName}</td>
                                                <td className="px-5 py-4 text-slate-600">
                                                    {req.date} <br/> {req.timeRange}
                                                </td>
                                                <td className="px-5 py-4 font-black text-emerald-600">{req.amount} {t('currency.egp')}</td>
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button 
                                                            onClick={() => handleApprove(req.id)}
                                                            disabled={isActionLoading === req.id}
                                                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                        >
                                                            {isActionLoading === req.id ? t('loading') : t('owner.bookings.action.confirm')}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                ) : (
                    
                    /* ── Operations Tab ── */
                    <div className="space-y-8">
                        {operations ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
                                        <h4 className="text-sm font-bold text-slate-500 mb-2">{t('owner.bookings.ops.pending')}</h4>
                                        <p className="text-3xl font-black text-slate-900">{operations.pending?.length || 0}</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
                                        <h4 className="text-sm font-bold text-slate-500 mb-2">{t('owner.bookings.ops.checkedIn')}</h4>
                                        <p className="text-3xl font-black text-slate-900">{operations.checkedIn?.length || 0}</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                                        <h4 className="text-sm font-bold text-slate-500 mb-2">{t('owner.bookings.ops.completed')}</h4>
                                        <p className="text-3xl font-black text-slate-900">{operations.completed?.length || 0}</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                                        <h3 className="font-black text-slate-800">{t('owner.bookings.ops.log')}</h3>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-sm font-medium text-slate-500">{t('owner.bookings.ops.summary')} ({operations.totalToday}) {t('owner.bookings.ops.summary2')}</p>
                                        {/* You can map operations.checkedIn or others here as a timeline */}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-slate-500 font-medium">{t('owner.bookings.ops.noData')}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
