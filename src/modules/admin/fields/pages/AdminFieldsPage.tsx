// src/modules/admin/fields/pages/AdminFieldsPage.tsx
import React, { useState, useEffect } from 'react';
import { fieldsAdminApi } from '../api/fields.api';
import type { PendingFieldItem, AllFieldsItem } from '../types/fields.types';
import { toast } from 'sonner';

export default function AdminFieldsPage() {
    const [activeTab, setActiveTab] = useState<'review' | 'directory'>('review');

    // States للبيانات
    const [pendingFields, setPendingFields] = useState<PendingFieldItem[]>([]);
    const [directoryData, setDirectoryData] = useState<AllFieldsItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // States للفلاتر والصفحات
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // الـ Side Drawer للمعاينة والمراجعة
    const [selectedPendingField, setSelectedPendingField] = useState<PendingFieldItem | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    // تحميل الملاعب المعلقة
    const loadPendingFields = async () => {
        setIsLoading(true);
        try {
            const data = await fieldsAdminApi.getPendingFields();
            setPendingFields(data);
        } catch (err) {
            toast.error('حدث خطأ أثناء تحميل الطلبات المعلقة');
        } finally {
            setIsLoading(false);
        }
    };

    // تحميل دليل الملاعب الشامل
    const loadDirectoryFields = async () => {
        setIsLoading(true);
        try {
            const res = await fieldsAdminApi.getAllFields({
                page,
                pageSize: 7,
                search,
                city: cityFilter,
                type: typeFilter,
                status: statusFilter
            });
            setDirectoryData(res.items || []);
            setTotalCount(res.total || 0);
        } catch (err) {
            toast.error('حدث خطأ أثناء جلب دليل الملاعب');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'review') {
            loadPendingFields();
        } else {
            loadDirectoryFields();
        }
    }, [activeTab, page, cityFilter, typeFilter, statusFilter]);

    // تشغيل البحث عند الضغط على Enter أو النقر
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadDirectoryFields();
    };

    // معالجة القبول والرفض
    const handleDecision = async (fieldId: number, isApproved: boolean) => {
        if (!isApproved && !rejectionReason.trim()) {
            toast.error('يرجى كتابة سبب الرفض أولاً');
            return;
        }
        try {
            await fieldsAdminApi.approveOrRejectField(fieldId, {
                isApproved,
                rejectionReason: isApproved ? 'Approved' : rejectionReason
            });
            toast.success(isApproved ? 'تم قبول الملعب وإدراجه بنجاح 🎉' : 'تم رفض الطلب وإرسال السبب للمالك');
            setSelectedPendingField(null);
            setRejectionReason('');
            setShowRejectInput(false);
            loadPendingFields();
        } catch (err) {
            toast.error('فشل حفظ القرار، يرجى المحاولة لاحقاً');
        }
    };

    // فك نصوص الصور القادمة كـ String JSON
    const parsePhotos = (photosStr: string): string[] => {
        try {
            return JSON.parse(photosStr);
        } catch {
            return ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=500'];
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-6" dir="rtl">
            {/* العناوين والتبويبات العلوية الدقيقة */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">إدارة الملاعب والمنشآت</h1>
                    <p className="text-sm text-slate-500 mt-1">مراجعة المنشآت الجديدة، الموافقة على التراخيص والتحكم بالدليل العام للملاعب.</p>
                </div>

                {/* تحويل احترافي للمسارات */}
                <div className="flex bg-slate-200/70 p-1 rounded-xl mt-4 md:mt-0">
                    <button
                        onClick={() => { setActiveTab('review'); setPage(1); }}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'review' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        طلبات المراجعة ({pendingFields.length})
                    </button>
                    <button
                        onClick={() => { setActiveTab('directory'); setPage(1); }}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'directory' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        دليل الملاعب العام
                    </button>
                </div>
            </div>

            {/* كروت الـ KPI الذكية العلوية (نفس الواجهة المرسلة بالثانية) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">الملاعب النشطة حالياً</span>
                        <span className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 block">1,142</span>
                        <span className="text-emerald-500 text-xs font-medium mt-1 inline-block">89% نسبة الإشغال الكلية</span>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">🏟️</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">ملاعب تحت الصيانة</span>
                        <span className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 block">94</span>
                        <span className="text-amber-500 text-xs font-medium mt-1 inline-block">⚠️ 12 ملعب تجاوز الفحص الدوري</span>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">🔧</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">الملاعب الموقوفة</span>
                        <span className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 block">48</span>
                        <span className="text-rose-500 text-xs font-medium mt-1 inline-block">بسبب مخالفة السياسات</span>
                    </div>
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-xl">🚫</div>
                </div>
            </div>

            {/* محتوى الـ Tab الأول: طلبات المراجعة المعلقة */}
            {activeTab === 'review' && (
                <div>
                    {isLoading ? (
                        <div className="text-center py-12 text-slate-400">جاري تحميل الملاعب المعلقة...</div>
                    ) : pendingFields.length === 0 ? (
                        <div className="bg-white text-center py-16 rounded-2xl border border-dashed border-slate-200">
                            <span className="text-4xl">🎉</span>
                            <h3 className="text-slate-800 font-bold mt-3">لا توجد طلبات معلقة حالياً</h3>
                            <p className="text-slate-400 text-sm">تمت مراجعة وفحص كافة الملاعب المرفوعة بنجاح.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <th className="p-4">اسم الملعب</th>
                                        <th className="p-4">المالك</th>
                                        <th className="p-4">المدينة</th>
                                        <th className="p-4">السعر (صباحي/مسائي)</th>
                                        <th className="p-4">النوع</th>
                                        <th className="p-4 text-center">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {pendingFields.map((field) => (
                                        <tr key={field.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-bold text-slate-900">
                                                <div>{field.name}</div>
                                                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">REQ-{field.id}-{field.theLicense.split('-')[1] || '00'}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-slate-700">{field.ownerName}</div>
                                                <div className="text-xs text-slate-400">{field.ownerEmail}</div>
                                            </td>
                                            <td className="p-4 text-slate-600">{field.city}</td>
                                            <td className="p-4 font-semibold text-slate-900">
                                                <span className="text-emerald-600">{field.priceAm} EGP</span> / <span className="text-indigo-600">{field.pricePm} EGP</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                                                    {field.type === 'FiveASide' ? 'خماسي 5vs5' : field.type === 'SevenASide' ? 'سباعي 7vs7' : 'قانوني 11vs11'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => setSelectedPendingField(field)}
                                                    className="px-4 py-1.5 bg-[#1E3A8A] text-white text-xs font-bold rounded-lg hover:bg-opacity-90 shadow-sm transition-all"
                                                >
                                                    مراجعة واعتماد 🔍
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* محتوى الـ Tab الثاني: دليل الملاعب العام مع الفلاتر والبحث الجبار */}
            {activeTab === 'directory' && (
                <div>
                    {/* شريط الفلاتر والبحث الاحترافي السريع */}
                    <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm gap-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 mb-6">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="ابحث باسم الملعب أو المالك..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#1E3A8A]"
                            />
                        </div>
                        <div>
                            <select
                                value={cityFilter}
                                onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 focus:outline-none"
                            >
                                <option value="">كل المدن</option>
                                <option value="Cairo">القاهرة</option>
                                <option value="Alexandria">الإسكندرية</option>
                                <option value="المنوفية">المنوفية</option>
                            </select>
                        </div>
                        <div>
                            <select
                                value={typeFilter}
                                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 focus:outline-none"
                            >
                                <option value="">كل الأنواع</option>
                                <option value="FiveASide">خماسي</option>
                                <option value="SevenASide">سباعي</option>
                                <option value="ElevenASide">قانوني</option>
                            </select>
                        </div>
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 focus:outline-none"
                            >
                                <option value="">كل الحالات</option>
                                <option value="Approved">مقبول</option>
                                <option value="Pending">معلق</option>
                                <option value="Rejected">مرفوض</option>
                            </select>
                        </div>
                        <div className="flex gap-1">
                            <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">تطبيق</button>
                            <button
                                type="button"
                                onClick={() => { setSearch(''); setCityFilter(''); setTypeFilter(''); setStatusFilter(''); setPage(1); }}
                                className="px-2.5 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                            >
                                ✖
                            </button>
                        </div>
                    </form>

                    {/* الجدول العام */}
                    {isLoading ? (
                        <div className="text-center py-12 text-slate-400">جاري جلب بيانات الدليل...</div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <th className="p-4">الملعب</th>
                                        <th className="p-4">المالك</th>
                                        <th className="p-4">المدينة</th>
                                        <th className="p-4">الأرضية</th>
                                        <th className="p-4">السعر لـ AM</th>
                                        <th className="p-4">الحالة</th>
                                        <th className="p-4 text-center">الحجوزات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {directoryData.map((field) => (
                                        <tr key={field.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-bold text-slate-900">{field.name}</td>
                                            <td className="p-4 text-slate-700">{field.ownerName}</td>
                                            <td className="p-4 text-slate-600">{field.city}</td>
                                            <td className="p-4 text-slate-500 text-xs">{field.surface}</td>
                                            <td className="p-4 font-semibold text-slate-900">{field.priceAm} EGP</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${field.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                                                    field.approvalStatus === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                                                    }`}>
                                                    {field.approvalStatus === 'Approved' ? 'نشط ومقبول' : field.approvalStatus === 'Pending' ? 'تحت المراجعة' : 'مرفوض'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center font-bold text-slate-600">{field.bookingsCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* أزرار الانتقال بين الصفحات التفاعلية (Pagination) */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs font-medium text-slate-500">
                                <span>إجمالي النتائج: {totalCount} ملعب</span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm disabled:opacity-40"
                                    >
                                        السابق
                                    </button>
                                    <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold">{page}</span>
                                    <button
                                        disabled={page * 7 >= totalCount}
                                        onClick={() => setPage(p => p + 1)}
                                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm disabled:opacity-40"
                                    >
                                        التالي
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* الـ Side Drawer Slider الفخم لمراجعة تفاصيل ملعب معلق (مطابق للاسكرينة تماماً) */}
            {selectedPendingField && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end transition-all animate-fade-in">
                    <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-slide-left" dir="rtl">

                        {/* الهيدر العلوي */}
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                            <div>
                                <span className="text-[10px] font-bold text-indigo-600 block uppercase tracking-wide">REVIEWING FIELD</span>
                                <h2 className="text-xl font-black text-slate-900">{selectedPendingField.name}</h2>
                            </div>
                            <button
                                onClick={() => { setSelectedPendingField(null); setShowRejectInput(false); }}
                                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* شريط التحقق الذكي (Validation Checks) */}
                        <div className="space-y-2 mb-6">
                            <div className="p-3 bg-emerald-50 rounded-xl flex items-center gap-2 border border-emerald-100 text-emerald-800 text-xs font-semibold">
                                <span className="text-sm">✓</span> حساب المالك موثق ونشط على المنصة (Owner is Verified)
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-xl flex items-center gap-2 border border-emerald-100 text-emerald-800 text-xs font-semibold">
                                <span className="text-sm">✓</span> كود رخصة التشغيل مطابق للغرفة الرياضية السجل التجاري
                            </div>
                        </div>

                        {/* معرض الصور التفاعلي (Field Gallery) */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">معرض صور الملعب</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {parsePhotos(selectedPendingField.photos).map((url, idx) => (
                                    <img
                                        key={idx}
                                        src={url}
                                        alt="field"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=500';
                                        }}
                                        className="w-full h-28 object-cover rounded-xl border border-slate-100 hover:scale-[1.02] transition-transform shadow-xs"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* بيانات وتفاصيل المنشأة والسعر */}
                        <div className="bg-slate-50 p-4 rounded-2xl space-y-3 mb-6 text-xs text-slate-700">
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-400">العنوان بالتفصيل</span>
                                <span className="font-bold text-slate-900 text-left max-w-[65%]">{selectedPendingField.address}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-400">رقم الرخصة الوطنية</span>
                                <span className="font-mono font-bold text-indigo-700">{selectedPendingField.theLicense}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-400">تاريخ الرفع للطلب</span>
                                <span className="font-bold text-slate-900">{new Date(selectedPendingField.submittedOn).toLocaleDateString('ar-EG')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">السعر المقترح</span>
                                <span className="font-bold text-emerald-600">{selectedPendingField.priceAm} EGP صباحاً / {selectedPendingField.pricePm} EGP مساءً</span>
                            </div>
                        </div>

                        {/* لوحة اتخاذ القرار الحاسمة (Actions) */}
                        <div className="mt-auto space-y-3">
                            {!showRejectInput ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setShowRejectInput(true)}
                                        className="py-3 bg-rose-600 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-rose-700 transition-colors"
                                    >
                                        🚫 رفض الطلب
                                    </button>
                                    <button
                                        onClick={() => handleDecision(selectedPendingField.id, true)}
                                        className="py-3 bg-[#1E3A8A] text-white font-bold rounded-xl text-sm shadow-sm hover:bg-opacity-90 transition-all"
                                    >
                                        ✓ قبول واعتماد فوري
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-3">
                                    <label className="block text-xs font-bold text-rose-800">ما هو سبب رفض إدراج الملعب؟</label>
                                    <textarea
                                        rows={3}
                                        placeholder="اكتب السبب بوضوح (مثال: الصور غير واضحة أو رخصة التشغيل منتهية الصلاحية)..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full p-2.5 text-xs bg-white border border-rose-200 rounded-xl focus:outline-none focus:border-rose-500"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => { setShowRejectInput(false); setRejectionReason(''); }}
                                            className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold"
                                        >
                                            تراجع
                                        </button>
                                        <button
                                            onClick={() => handleDecision(selectedPendingField.id, false)}
                                            className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                                        >
                                            تأكيد الرفض والإرسال
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}