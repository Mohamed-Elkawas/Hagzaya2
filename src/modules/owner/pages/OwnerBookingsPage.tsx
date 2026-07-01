import React, { useEffect, useState } from 'react';
import { ownerApi } from '../api/owner.api';
import type { BookingRequest, DailyOperations } from '../api/owner.api';
import { toast } from 'sonner';
import { 
    CreditCard, Calendar, Clock, MapPin, 
    CheckCircle2, User, Activity, CheckCircle, Smartphone
} from 'lucide-react';

export function OwnerBookingsPage() {
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
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-16" dir="rtl">
            
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-8 mb-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">إدارة الحجوزات والعمليات</h1>
                    <p className="text-sm font-medium text-slate-500 mt-2">
                        مراجعة وتأكيد مدفوعات فودافون كاش، ومتابعة حركة العمليات اليومية في الملاعب.
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
                        طلبات الحجز (تحتاج تأكيد)
                    </button>
                    <button 
                        onClick={() => setActiveTab('operations')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'operations' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        العمليات اليومية (التشغيل)
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
                                <h3 className="text-xl font-black text-slate-800 mb-2">لا توجد طلبات معلقة</h3>
                                <p className="text-slate-500 font-medium">جميع الحجوزات مؤكدة، لا يوجد شيء يحتاج لتدخلك الآن.</p>
                            </div>
                        ) : (
                            requests.map((req) => {
                                // Highlight logic
                                const isVfCashPending = req.paymentMethod === 'VodafoneCash' && req.status === 'PaymentSubmitted';
                                
                                return (
                                    <div key={req.id} className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${isVfCashPending ? 'border-amber-400 bg-amber-50/10' : 'border-slate-200'}`}>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-lg font-black text-slate-900">{req.playerName}</h3>
                                                {isVfCashPending && (
                                                    <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-2.5 py-1 rounded-md flex items-center gap-1.5">
                                                        <Smartphone size={12} /> فودافون كاش
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-600">
                                                <div className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" /> {req.fieldName}</div>
                                                <div className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-400" /> {req.date}</div>
                                                <div className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400" /> {req.timeRange}</div>
                                                <div className="flex items-center gap-1.5"><CreditCard size={16} className="text-slate-400" /> <span className="text-emerald-600 font-black">{req.amount} ج.م</span></div>
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            {isVfCashPending ? (
                                                <button 
                                                    onClick={() => handleApprove(req.id)}
                                                    disabled={isActionLoading === req.id}
                                                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-all disabled:opacity-70"
                                                >
                                                    {isActionLoading === req.id ? 'جاري التأكيد...' : 'تأكيد واستلام الدفع'}
                                                </button>
                                            ) : (
                                                <div className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-bold text-center">
                                                    {req.status}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                ) : (
                    
                    /* ── Operations Tab ── */
                    <div className="space-y-8">
                        {operations ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
                                        <h4 className="text-sm font-bold text-slate-500 mb-2">قادم (Pending)</h4>
                                        <p className="text-3xl font-black text-slate-900">{operations.pending?.length || 0}</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
                                        <h4 className="text-sm font-bold text-slate-500 mb-2">تم الحضور (Checked In)</h4>
                                        <p className="text-3xl font-black text-slate-900">{operations.checkedIn?.length || 0}</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                                        <h4 className="text-sm font-bold text-slate-500 mb-2">مكتمل (Completed)</h4>
                                        <p className="text-3xl font-black text-slate-900">{operations.completed?.length || 0}</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                                        <h3 className="font-black text-slate-800">سجل عمليات اليوم</h3>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-sm font-medium text-slate-500">تم جلب إجمالي ({operations.totalToday}) عملية للتشغيل اليوم.</p>
                                        {/* You can map operations.checkedIn or others here as a timeline */}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-slate-500 font-medium">لم يتم العثور على بيانات تشغيل لليوم.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
