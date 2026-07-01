'use client'

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fieldsApi } from '../api/fields.api';
import { FieldType, FieldSurface } from '../types/fields.types';
import type { CreateFieldPayload } from '../types/fields.types';
import { toast } from 'sonner';
import {
    MapPin, Info, Tag, Settings, Clock, Save,
    Building, Upload, FileCheck, ImageIcon, X, Loader2, CheckCircle2
} from 'lucide-react';

// ─── Submit step type for granular UX feedback ────────────────────────────────
type SubmitStep = 'idle' | 'uploading-license' | 'uploading-photo' | 'saving' | 'done';

// ─── FilePicker — self-contained file selector with preview ──────────────────
interface FilePickerProps {
    label: string;
    hint: string;
    icon: React.ElementType;
    accept: string;
    file: File | null;
    onChange: (f: File | null) => void;
    required?: boolean;
    uploading?: boolean;
    uploaded?: boolean;
}

function FilePicker({ label, hint, icon: Icon, accept, file, onChange, required, uploading, uploaded }: FilePickerProps) {
    const ref = useRef<HTMLInputElement>(null);

    const borderColor = uploaded
        ? 'border-emerald-400 bg-emerald-50/60'
        : file
        ? 'border-indigo-300 bg-indigo-50/40'
        : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/20';

    const iconBg = uploaded
        ? 'bg-emerald-100 text-emerald-600'
        : file
        ? 'bg-indigo-100 text-indigo-600'
        : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-500';

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <div
                onClick={() => !uploading && ref.current?.click()}
                className={`relative flex items-center gap-4 p-4 border-2 border-dashed rounded-xl transition-all duration-200 group ${borderColor} ${uploading ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
            >
                <div className={`p-3 rounded-xl shrink-0 transition-all ${iconBg}`}>
                    {uploading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : uploaded ? (
                        <CheckCircle2 size={20} />
                    ) : file ? (
                        <FileCheck size={20} />
                    ) : (
                        <Icon size={20} />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    {uploading ? (
                        <>
                            <p className="text-sm font-bold text-indigo-700">جاري الرفع...</p>
                            <div className="h-1.5 bg-indigo-200 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full w-2/3 animate-pulse" />
                            </div>
                        </>
                    ) : uploaded ? (
                        <p className="text-sm font-bold text-emerald-700">تم الرفع بنجاح ✓</p>
                    ) : file ? (
                        <>
                            <p className="text-sm font-bold text-indigo-800 truncate">{file.name}</p>
                            <p className="text-xs text-indigo-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB — جاهز للرفع</p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-semibold text-slate-600">اضغط لاختيار ملف</p>
                            <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
                        </>
                    )}
                </div>
                {file && !uploading && !uploaded && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onChange(null); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                    >
                        <X size={16} />
                    </button>
                )}
                <input
                    ref={ref}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => { onChange(e.target.files?.[0] ?? null); e.target.value = ''; }}
                />
            </div>
        </div>
    );
}

// ─── Styled Amenity Checkbox ──────────────────────────────────────────────────
function AmenityCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label
            onClick={() => onChange(!checked)}
            className="flex items-center gap-3 cursor-pointer group select-none"
        >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0
                ${checked ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}
            >
                {checked && <span className="text-white text-xs font-black leading-none">✓</span>}
            </div>
            <span className="text-sm font-semibold text-slate-700">{label}</span>
        </label>
    );
}

// ─── Shared input class ───────────────────────────────────────────────────────
const inputCls = "w-full text-sm font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50";

// ─── Main Component ───────────────────────────────────────────────────────────
export function CreateFieldPage() {
    const navigate = useNavigate();
    const [submitStep, setSubmitStep] = useState<SubmitStep>('idle');
    const isSubmitting = submitStep !== 'idle' && submitStep !== 'done';

    // ── File states ──────────────────────────────────────────────────────────
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    // Track which files have been uploaded already (for visual feedback)
    const [licenseUploaded, setLicenseUploaded] = useState(false);
    const [photoUploaded, setPhotoUploaded] = useState(false);

    // ── Text form data ───────────────────────────────────────────────────────
    const [form, setForm] = useState({
        name: '',
        city: '',
        village: '',
        address: '',
        governorate: '',
        type: FieldType.FiveASide as string,
        surface: FieldSurface.ArtificialTurf as string,
        priceAm: 150,
        pricePm: 200,
        latitude: '30.0444',
        longitude: '31.2357',
        capacity: 10,
        openingTime: '08:00',
        closingTime: '23:00',
        amenities: {
            hasLight: true,
            hasChangingRooms: false,
            hasShowers: false,
            hasParking: false,
            hasCafeteria: false,
        }
    });

    const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

    // ── Sequential Submission Pipeline ───────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let licenseUrl = '';
        let photoUrl = '';

        try {
            // ── Step 1: Upload license ───────────────────────────────────────
            if (licenseFile) {
                setSubmitStep('uploading-license');
                const res = await fieldsApi.uploadLicense(licenseFile);
                licenseUrl = res.fileUrl;
                setLicenseUploaded(true);
                console.log('[Pipeline] ✓ License uploaded:', licenseUrl);
            }

            // ── Step 2: Upload field photo ───────────────────────────────────
            if (photoFile) {
                setSubmitStep('uploading-photo');
                const res = await fieldsApi.uploadFieldPhoto(photoFile);
                photoUrl = res.fileUrl;
                setPhotoUploaded(true);
                console.log('[Pipeline] ✓ Photo uploaded:', photoUrl);
            }

            // ── Step 3: Build payload and POST /api/fields ───────────────────
            setSubmitStep('saving');

            // Map boolean amenities to string[]
            const amenities: string[] = [];
            if (form.amenities.hasLight) amenities.push('Lighting');
            if (form.amenities.hasChangingRooms) amenities.push('Changing Rooms');
            if (form.amenities.hasShowers) amenities.push('Showers');
            if (form.amenities.hasParking) amenities.push('Parking');
            if (form.amenities.hasCafeteria) amenities.push('Cafeteria');

            const payload: CreateFieldPayload = {
                name: form.name.trim(),
                city: form.city.trim(),
                village: form.village.trim(),
                address: form.address.trim(),
                governorate: form.governorate.trim(),
                theLicense: licenseUrl,                              // Absolute URL from Step 1
                photos: photoUrl,                                    // Absolute URL from Step 2
                type: form.type as CreateFieldPayload['type'],       // Strict enum: "FiveASide" etc.
                surface: form.surface as CreateFieldPayload['surface'], // Strict enum: "NaturalGrass" etc.
                priceAm: Number(form.priceAm),
                pricePm: Number(form.pricePm),
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
                capacity: Number(form.capacity),
                openingTime: form.openingTime,
                closingTime: form.closingTime,
                amenities,
            };

            await fieldsApi.createField(payload);

            setSubmitStep('done');
            toast.success('تم إنشاء الملعب بنجاح! بانتظار موافقة الإدارة.');
            navigate('/owner/fields');

        } catch (err: any) {
            console.error('[CreateField] Pipeline error:', err.message);
            toast.error(err.message || 'حدث خطأ أثناء إنشاء الملعب');
            setSubmitStep('idle');
            // Reset uploaded flags so picker shows correct state if user retries
            setLicenseUploaded(false);
            setPhotoUploaded(false);
        }
    };

    // ── Button label ─────────────────────────────────────────────────────────
    const buttonLabel = {
        idle: 'تقديم طلب إدراج الملعب',
        'uploading-license': 'جاري رفع رخصة الملعب...',
        'uploading-photo': 'جاري رفع صورة الملعب...',
        saving: 'جاري حفظ بيانات الملعب...',
        done: 'تم!',
    }[submitStep];

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans py-12" dir="rtl">
            <div className="max-w-4xl mx-auto px-6">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">إضافة ملعب جديد</h1>
                    <p className="text-sm font-medium text-slate-500 mt-2">
                        قم بإدخال مواصفات ملعبك بدقة ليتم عرضه للاعبين في النظام.
                    </p>
                </div>

                {/* Progress strip — shown when actively submitting */}
                {isSubmitting && (
                    <div className="mb-6 bg-white rounded-2xl border border-indigo-100 shadow-sm p-4 flex items-center gap-4">
                        <Loader2 size={20} className="text-indigo-600 animate-spin shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-bold text-indigo-900">{buttonLabel}</p>
                            <div className="h-1.5 bg-indigo-100 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                                    style={{
                                        width: submitStep === 'uploading-license' ? '30%'
                                            : submitStep === 'uploading-photo' ? '60%'
                                            : submitStep === 'saving' ? '85%'
                                            : '100%'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ── 1. Basic Info & File Uploads ──────────────────────── */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-center gap-2">
                            <Info size={18} className="text-indigo-600" />
                            <h2 className="font-bold text-slate-800">المعلومات الأساسية والمستندات</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    اسم الملعب <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => set('name', e.target.value)}
                                    placeholder="مثال: ملعب سانتياغو الخماسي"
                                    className={inputCls}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FilePicker
                                    label="رخصة الملعب"
                                    hint="PDF, JPG, PNG — يُرفع قبل الحفظ تلقائياً"
                                    icon={Upload}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    file={licenseFile}
                                    onChange={(f) => { setLicenseFile(f); setLicenseUploaded(false); }}
                                    uploading={submitStep === 'uploading-license'}
                                    uploaded={licenseUploaded}
                                />
                                <FilePicker
                                    label="الصورة الرئيسية للملعب"
                                    hint="JPG, PNG, WEBP — حجم أقصى 5MB"
                                    icon={ImageIcon}
                                    accept=".jpg,.jpeg,.png,.webp"
                                    file={photoFile}
                                    onChange={(f) => { setPhotoFile(f); setPhotoUploaded(false); }}
                                    uploading={submitStep === 'uploading-photo'}
                                    uploaded={photoUploaded}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── 2. Location ───────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-center gap-2">
                            <MapPin size={18} className="text-indigo-600" />
                            <h2 className="font-bold text-slate-800">تفاصيل الموقع</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">المحافظة <span className="text-rose-500">*</span></label>
                                <input type="text" required value={form.governorate} onChange={(e) => set('governorate', e.target.value)} placeholder="المنوفية" className={inputCls} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">المدينة <span className="text-rose-500">*</span></label>
                                <input type="text" required value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="مدينة السادات" className={inputCls} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">القرية / المنطقة</label>
                                <input type="text" value={form.village} onChange={(e) => set('village', e.target.value)} placeholder="المنطقة الرابعة" className={inputCls} />
                            </div>
                            <div className="space-y-2 md:col-span-3">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">العنوان بالتفصيل <span className="text-rose-500">*</span></label>
                                <input type="text" required value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="شارع الجامعة، بجوار السنتر" className={inputCls} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">خط العرض (Latitude)</label>
                                <input type="text" required value={form.latitude} onChange={(e) => set('latitude', e.target.value)} dir="ltr" className={`${inputCls} font-mono text-left`} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">خط الطول (Longitude)</label>
                                <input type="text" required value={form.longitude} onChange={(e) => set('longitude', e.target.value)} dir="ltr" className={`${inputCls} font-mono text-left`} />
                            </div>
                        </div>
                    </div>

                    {/* ── 3. Specs & Pricing ────────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-center gap-2">
                            <Tag size={18} className="text-indigo-600" />
                            <h2 className="font-bold text-slate-800">المواصفات والأسعار</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">سعر الساعة — صباحاً (ج.م)</label>
                                <input type="number" required min={0} value={form.priceAm}
                                    onChange={(e) => set('priceAm', Number(e.target.value))} className={inputCls} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">سعر الساعة — مساءً (ج.م)</label>
                                <input type="number" required min={0} value={form.pricePm}
                                    onChange={(e) => set('pricePm', Number(e.target.value))} className={inputCls} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">حجم الملعب</label>
                                <select value={form.type} onChange={(e) => set('type', e.target.value)}
                                    className={`${inputCls} appearance-none`}>
                                    <option value={FieldType.FiveASide}>خماسي (5-a-side)</option>
                                    <option value={FieldType.SevenASide}>سباعي (7-a-side)</option>
                                    <option value={FieldType.ElevenASide}>قانوني (11-a-side)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">نوع الأرضية</label>
                                <select value={form.surface} onChange={(e) => set('surface', e.target.value)}
                                    className={`${inputCls} appearance-none`}>
                                    <option value={FieldSurface.ArtificialTurf}>نجيل صناعي</option>
                                    <option value={FieldSurface.NaturalGrass}>نجيل طبيعي</option>
                                    <option value={FieldSurface.HybridTurf}>هجين</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">السعة (عدد اللاعبين)</label>
                                <input type="number" required min={2} value={form.capacity}
                                    onChange={(e) => set('capacity', Number(e.target.value))} className={inputCls} />
                            </div>
                        </div>
                    </div>

                    {/* ── 4. Schedule & Amenities ───────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-center gap-2">
                            <Settings size={18} className="text-indigo-600" />
                            <h2 className="font-bold text-slate-800">الإعدادات والمرافق</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Times */}
                            <div className="space-y-5">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Clock size={16} className="text-slate-500" /> مواعيد العمل
                                </h3>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">وقت الفتح</label>
                                    <input type="time" required value={form.openingTime}
                                        onChange={(e) => set('openingTime', e.target.value)} className={inputCls} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">وقت الإغلاق</label>
                                    <input type="time" required value={form.closingTime}
                                        onChange={(e) => set('closingTime', e.target.value)} className={inputCls} />
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Building size={16} className="text-slate-500" /> المرافق والخدمات المتاحة
                                </h3>
                                <div className="flex flex-col gap-4 pt-1">
                                    <AmenityCheck label="إضاءة كاشفة ليلية" checked={form.amenities.hasLight}
                                        onChange={(v) => setForm(f => ({ ...f, amenities: { ...f.amenities, hasLight: v } }))} />
                                    <AmenityCheck label="موقف سيارات آمن" checked={form.amenities.hasParking}
                                        onChange={(v) => setForm(f => ({ ...f, amenities: { ...f.amenities, hasParking: v } }))} />
                                    <AmenityCheck label="غرف تغيير ملابس" checked={form.amenities.hasChangingRooms}
                                        onChange={(v) => setForm(f => ({ ...f, amenities: { ...f.amenities, hasChangingRooms: v } }))} />
                                    <AmenityCheck label="حمامات ودش واستحمام" checked={form.amenities.hasShowers}
                                        onChange={(v) => setForm(f => ({ ...f, amenities: { ...f.amenities, hasShowers: v } }))} />
                                    <AmenityCheck label="بوفيه / كافتيريا مشروبات" checked={form.amenities.hasCafeteria}
                                        onChange={(v) => setForm(f => ({ ...f, amenities: { ...f.amenities, hasCafeteria: v } }))} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Submit Button ─────────────────────────────────────── */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl
                                shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]
                                hover:bg-indigo-700 hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)]
                                hover:-translate-y-0.5 transition-all duration-200
                                flex items-center gap-2.5 min-w-[260px] justify-center
                                disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSubmitting ? (
                                <><Loader2 size={18} className="animate-spin" />{buttonLabel}</>
                            ) : (
                                <><Save size={18} />{buttonLabel}</>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}