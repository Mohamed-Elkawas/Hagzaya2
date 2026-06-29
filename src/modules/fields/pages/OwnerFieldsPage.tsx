'use client'

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fieldsApi } from '../api/fields.api';
import { type Field, ApprovalStatus } from '../types/fields.types';
import { toast } from 'sonner';

export function OwnerFieldsPage() {
    const navigate = useNavigate();
    const [myFields, setMyFields] = useState<Field[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fieldsApi.getFieldsByOwner(1)
            .then((data) => {
                const cleanData = Array.isArray(data) ? data : (data as any)?.data || [];
                setMyFields(cleanData);
            })
            .catch(() => toast.error('فشل جلب ملاعبك الشخصية'))
            .finally(() => setIsLoading(false));
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الملعب نهائياً؟')) {
            try {
                await fieldsApi.deleteField(id);
                setMyFields(myFields.filter(f => f.id !== id));
                toast.success('تم حذف الملعب بنجاح.');
            } catch {
                toast.error('فشل حذف الملعب.');
            }
        }
    };

    const getStatusBadge = (status: ApprovalStatus) => {
        if (status === ApprovalStatus.Approved) return <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold">معتمد</span>;
        if (status === ApprovalStatus.Pending) return <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold">قيد المراجعة</span>;
        return <span className="bg-rose-50 text-rose-700 text-xs px-2.5 py-1 rounded-full font-bold">مرفوض</span>;
    };

    return (
        <div className="min-h-screen bg-[#f6f8f7] font-ar pb-16" dir="rtl">
            <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-[#191c1c]">إدارة ملاعبي</h1>
                        <p className="text-xs text-[#3e4a3c] mt-0.5">تابع حالات الملاعب المعتمدة والمعلقة وتتبع الأرباح والحجوزات.</p>
                    </div>
                    <button
                        onClick={() => navigate('/owner/fields/create')}
                        className="bg-[#006b20] hover:bg-[#005318] text-white px-5 h-11 rounded-xl text-xs font-bold flex items-center space-x-1.5 space-x-reverse transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        <span>إضافة ملعب جديد</span>
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined animate-spin text-3xl text-[#006b20]">progress_activity</span>
                    </div>
                ) : myFields.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-[#e1e3e1] text-[#3e4a3c]/60">
                        <span className="material-symbols-outlined text-4xl mb-2">stadium</span>
                        <p className="text-sm font-bold text-[#191c1c]">لم تقم بإضافة أي ملاعب حتى الآن!</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-[#e1e3e1] overflow-hidden shadow-sm">
                        <table className="w-full text-right border-collapse text-xs font-bold text-[#191c1c]">
                            <thead className="bg-[#f0f2f0] text-[#3e4a3c]">
                                <tr>
                                    <th className="p-4">اسم الملعب</th>
                                    <th className="p-4">الموقع</th>
                                    <th className="p-4">السعر بالساعة</th>
                                    <th className="p-4">الحالة</th>
                                    <th className="p-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f0f2f0]">
                                {myFields.map((field) => (
                                    <tr key={field.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-extrabold">{field.name}</td>
                                        <td className="p-4 text-[#3e4a3c]/80">{field.city}، {field.governorate}</td>
                                        <td className="p-4">EGP {field.pricePm ?? field.priceAm ?? 150}</td>
                                        <td className="p-4">{getStatusBadge(field.approvalStatus as any)}</td>
                                        <td className="p-4 flex items-center justify-center gap-2">
                                            <button onClick={() => navigate(`/owner/fields/edit/${field.id}`)} className="p-2 border border-[#e1e3e1] rounded-lg hover:border-[#006b20] hover:text-[#006b20] transition-colors">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(field.id)} className="p-2 border border-transparent bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors">
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}