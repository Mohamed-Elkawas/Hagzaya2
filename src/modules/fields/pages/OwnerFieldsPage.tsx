'use client'

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fieldsApi } from '../api/fields.api';
import { type Field, ApprovalStatus, FieldType, FieldSurface } from '../types/fields.types';
import type { CreateFieldPayload } from '../types/fields.types';
import { toast } from 'sonner';
import { 
    Plus, Building, Activity, Clock, Trash2, Edit3, 
    MapPin, CheckCircle2, AlertCircle, XCircle, ChevronDown, Save, X, Loader2
} from 'lucide-react';

export function OwnerFieldsPage() {
    const navigate = useNavigate();
    const [fields, setFields] = useState<Field[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Extract ownerId from JWT
    const getOwnerIdFromToken = (): number | null => {
        try {
            const token = localStorage.getItem('hagzaya_token');
            if (!token) return null;
            const payload = token.split('.')[1];
            // Fix for base64url encoding
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(atob(base64));
            const idStr = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
            return idStr ? parseInt(idStr, 10) : null;
        } catch (e) {
            console.error('Error decoding token', e);
            return null;
        }
    };

    const ownerId = getOwnerIdFromToken();

    // Modals state
    const [fieldToDelete, setFieldToDelete] = useState<Field | null>(null);
    const [fieldToEdit, setFieldToEdit] = useState<Field | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchFields = async (id: number) => {
        setIsLoading(true);
        try {
            const data = await fieldsApi.getFieldsByOwner(id);
            const cleanData = Array.isArray(data) ? data : (data as any)?.data || [];
            setFields(cleanData);
        } catch (err) {
            toast.error('فشل جلب ملاعبك الشخصية');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (ownerId) {
            fetchFields(ownerId);
        } else {
            setIsLoading(false); // Stop loading if no token
        }
    }, [ownerId]);

    // ─── ACTIONS ─────────────────────────────────────────────────────────────
    
    const handleToggleAvailability = async (field: Field) => {
        try {
            // Optimistic update
            setFields(prev => prev.map(f => f.id === field.id ? { ...f, isAvailable: !f.isAvailable } : f));
            await fieldsApi.updateField(field.id, { isAvailable: !field.isAvailable });
            toast.success(`تم ${!field.isAvailable ? 'تفعيل' : 'إيقاف'} الملعب بنجاح.`);
        } catch (err) {
            // Revert on failure
            setFields(prev => prev.map(f => f.id === field.id ? { ...f, isAvailable: field.isAvailable } : f));
            toast.error('فشل تحديث حالة الملعب.');
        }
    };

    const confirmDelete = async () => {
        if (!fieldToDelete) return;
        setIsActionLoading(true);
        try {
            await fieldsApi.deleteField(fieldToDelete.id);
            setFields(prev => prev.filter(f => f.id !== fieldToDelete.id));
            toast.success('تم حذف الملعب بنجاح.');
            setFieldToDelete(null);
        } catch (err) {
            toast.error('فشل حذف الملعب.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fieldToEdit) return;
        setIsActionLoading(true);

        try {
            // Note: Update payload strictly matching the backend schema
            const payload: Partial<CreateFieldPayload> = {
                name: fieldToEdit.name,
                city: fieldToEdit.city,
                address: fieldToEdit.address,
                governorate: fieldToEdit.governorate,
                type: fieldToEdit.type as any,
                surface: fieldToEdit.surface as any,
                priceAm: Number(fieldToEdit.priceAm),
                pricePm: Number(fieldToEdit.pricePm),
                capacity: Number(fieldToEdit.capacity),
                openingTime: fieldToEdit.openingTime || '08:00',
                closingTime: fieldToEdit.closingTime || '23:00',
                isAvailable: fieldToEdit.isAvailable
            };

            await fieldsApi.updateField(fieldToEdit.id, payload);
            toast.success('تم تحديث بيانات الملعب بنجاح.');
            if (ownerId) {
                await fetchFields(ownerId); // Refresh to get pristine updated data
            }
            setFieldToEdit(null);
        } catch (err) {
            toast.error('فشل تحديث بيانات الملعب.');
        } finally {
            setIsActionLoading(false);
        }
    };

    // ─── ANALYTICS ───────────────────────────────────────────────────────────
    
    const totalFields = fields.length;
    const activeFields = fields.filter(f => f.isAvailable && f.approvalStatus === ApprovalStatus.Approved).length;
    const pendingFields = fields.filter(f => f.approvalStatus === ApprovalStatus.Pending).length;

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    const getStatusBadge = (status: string) => {
        switch (status) {
            case ApprovalStatus.Approved:
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700">معتمد</span>
                    </div>
                );
            case ApprovalStatus.Pending:
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100">
                        <Clock size={14} className="text-amber-600" />
                        <span className="text-xs font-bold text-amber-700">قيد المراجعة</span>
                    </div>
                );
            case ApprovalStatus.Rejected:
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100">
                        <XCircle size={14} className="text-rose-600" />
                        <span className="text-xs font-bold text-rose-700">مرفوض</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                        <AlertCircle size={14} className="text-slate-500" />
                        <span className="text-xs font-bold text-slate-600">{status}</span>
                    </div>
                );
        }
    };

    const getImageUrl = (photoStr?: string) => {
        if (!photoStr) return 'https://images.unsplash.com/photo-1518605368461-1ee7e53f1f3a?q=80&w=800&auto=format&fit=crop';
        if (photoStr.startsWith('http')) return photoStr;
        return `https://hagzaya.runasp.net${photoStr}`;
    };

    // ─── RENDER ──────────────────────────────────────────────────────────────
    
    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-20" dir="rtl">
            
            {/* Header Area */}
            <div className="bg-white border-b border-slate-200 px-6 py-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">إدارة ملاعبي</h1>
                        <p className="text-sm font-medium text-slate-500 mt-2">
                            لوحة التحكم المركزية لإدارة ملاعبك ومتابعة حالتها ونشاطها.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/owner/fields/create')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        <span>إضافة ملعب جديد</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
                
                {/* ── Analytics Strip ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-500 mb-1">إجمالي الملاعب</p>
                            <h3 className="text-3xl font-black text-slate-900">{isLoading ? '-' : totalFields}</h3>
                        </div>
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Building size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-500 mb-1">ملاعب نشطة وتعمل</p>
                            <h3 className="text-3xl font-black text-emerald-600">{isLoading ? '-' : activeFields}</h3>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <Activity size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-500 mb-1">في انتظار الموافقة</p>
                            <h3 className="text-3xl font-black text-amber-600">{isLoading ? '-' : pendingFields}</h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <Clock size={24} />
                        </div>
                    </div>
                </div>

                {/* ── Grid List ── */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-[400px]" />
                        ))}
                    </div>
                ) : fields.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-slate-300">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">لا توجد ملاعب مسجلة</h3>
                        <p className="text-slate-500 font-medium">ابدأ الآن وأضف ملعبك الأول لبدء استقبال الحجوزات.</p>
                        <button
                            onClick={() => navigate('/owner/fields/create')}
                            className="mt-6 text-indigo-600 font-bold hover:text-indigo-700 underline underline-offset-4"
                        >
                            أضف ملعبك الأول الآن
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {fields.map((field) => (
                            <div key={field.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col">
                                {/* Cover Image */}
                                <div className="h-48 relative overflow-hidden bg-slate-100">
                                    <img 
                                        src={getImageUrl(field.photos)} 
                                        alt={field.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518605368461-1ee7e53f1f3a?q=80&w=800&auto=format&fit=crop';
                                        }}
                                    />
                                    <div className="absolute top-4 right-4">
                                        {getStatusBadge(field.approvalStatus)}
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-black text-slate-800 shadow-sm flex items-center gap-1.5">
                                        <Building size={14} className="text-indigo-600" />
                                        {field.type === '5-a-side' || field.type === FieldType.FiveASide ? 'خماسي' : 
                                         field.type === '7-a-side' || field.type === FieldType.SevenASide ? 'سباعي' : 'قانوني'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-black text-slate-900 line-clamp-1">{field.name}</h3>
                                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 whitespace-nowrap">
                                            <span className="text-indigo-700 font-black text-sm">{field.priceAm}</span>
                                            <span className="text-slate-400 text-xs font-bold">ج.م/س</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-6">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span className="line-clamp-1">{field.governorate}، {field.city}</span>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                                        {/* Availability Toggle */}
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold ${field.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {field.isAvailable ? 'متاح للحجز' : 'مغلق'}
                                            </span>
                                            <button 
                                                onClick={() => handleToggleAvailability(field)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${field.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${field.isAvailable ? '-translate-x-6' : '-translate-x-1'}`} />
                                            </button>
                                        </div>

                                        {/* Edit/Delete */}
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => setFieldToEdit(field)}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                                                title="تعديل"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => setFieldToDelete(field)}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                                                title="حذف"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── MODALS ───────────────────────────────────────────────────────────── */}

            {/* Delete Confirmation Modal */}
            {fieldToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={32} className="text-rose-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">حذف الملعب؟</h3>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            هل أنت متأكد من رغبتك في حذف <strong>{fieldToDelete.name}</strong> نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setFieldToDelete(null)}
                                disabled={isActionLoading}
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button 
                                onClick={confirmDelete}
                                disabled={isActionLoading}
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {isActionLoading ? <Loader2 size={18} className="animate-spin" /> : 'حذف نهائي'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal / Sheet */}
            {fieldToEdit && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">تعديل بيانات الملعب</h3>
                                <p className="text-xs font-bold text-slate-500">{fieldToEdit.name}</p>
                            </div>
                            <button 
                                onClick={() => setFieldToEdit(null)}
                                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <form id="edit-form" onSubmit={handleEditSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700">اسم الملعب</label>
                                    <input type="text" required value={fieldToEdit.name} 
                                        onChange={e => setFieldToEdit({...fieldToEdit, name: e.target.value})}
                                        className="w-full text-sm font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700">سعر الصباح</label>
                                        <input type="number" required value={fieldToEdit.priceAm} 
                                            onChange={e => setFieldToEdit({...fieldToEdit, priceAm: Number(e.target.value)})}
                                            className="w-full text-sm font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700">سعر المساء</label>
                                        <input type="number" required value={fieldToEdit.pricePm} 
                                            onChange={e => setFieldToEdit({...fieldToEdit, pricePm: Number(e.target.value)})}
                                            className="w-full text-sm font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700">وقت الفتح</label>
                                        <input type="time" required value={fieldToEdit.openingTime || '08:00'} 
                                            onChange={e => setFieldToEdit({...fieldToEdit, openingTime: e.target.value})}
                                            className="w-full text-sm font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700">وقت الإغلاق</label>
                                        <input type="time" required value={fieldToEdit.closingTime || '23:00'} 
                                            onChange={e => setFieldToEdit({...fieldToEdit, closingTime: e.target.value})}
                                            className="w-full text-sm font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700">المدينة</label>
                                    <input type="text" required value={fieldToEdit.city} 
                                        onChange={e => setFieldToEdit({...fieldToEdit, city: e.target.value})}
                                        className="w-full text-sm font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700">العنوان</label>
                                    <input type="text" required value={fieldToEdit.address} 
                                        onChange={e => setFieldToEdit({...fieldToEdit, address: e.target.value})}
                                        className="w-full text-sm font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50" />
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                            <button 
                                onClick={() => setFieldToEdit(null)}
                                disabled={isActionLoading}
                                className="flex-1 py-3.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button 
                                type="submit"
                                form="edit-form"
                                disabled={isActionLoading}
                                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {isActionLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> حفظ التعديلات</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}