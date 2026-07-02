'use client'

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fieldsApi } from '../api/fields.api';
import { useLanguage } from '../../../core/context/LanguageContext';
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

function FilePicker({ label, hint, accept, file, onChange, uploading, uploaded, icon: Icon }: { label: string; hint?: string; accept: string; file: File | null; onChange: (f: File | null) => void; uploading?: boolean; uploaded?: boolean; icon: any; }) {
    const { lang } = useLanguage();
    const fp = lang === 'ar'
        ? { uploading: 'جار الرفع...', uploadSuccess: 'تم الرفع بنجاح ✓', readyToUpload: 'جاهز للرفع', clickToChoose: 'اضغط لاختيار ملف' }
        : { uploading: 'Uploading...', uploadSuccess: 'Uploaded successfully ✓', readyToUpload: 'Ready to upload', clickToChoose: 'Click to choose file' };
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {label}
            </label>
            {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
            <div
                onClick={() => !uploading && ref.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 cursor-pointer transition-all
                    ${uploading ? 'border-indigo-300 bg-indigo-50 cursor-wait' : uploaded ? 'border-emerald-400 bg-emerald-50' : file ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300'}`}
            >
                {uploading ? (
                    <><Loader2 size={22} className="text-indigo-500 animate-spin" /><span className="text-xs font-semibold text-indigo-600">{fp.uploading}</span></>
                ) : uploaded ? (
                    <><CheckCircle2 size={22} className="text-emerald-500" /><span className="text-xs font-semibold text-emerald-600">{fp.uploadSuccess}</span></>
                ) : file ? (
                    <><FileCheck size={22} className="text-indigo-500" /><span className="text-xs font-semibold text-indigo-600 truncate max-w-[180px]">{file.name}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onChange(null); }} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500"><X size={14} /></button></>
                ) : (
                    <><Icon size={22} className="text-slate-400" />
                    <span className="text-xs text-slate-400">{fp.readyToUpload}</span>
                    <span className="text-[10px] text-indigo-500 font-semibold">{fp.clickToChoose}</span></>
                )}
            </div>
            <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
        </div>
    );
}

// ─── Shared input class ───────────────────────────────────────────────────────
const inputCls = "w-full text-sm font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50";


// ─── Local Dictionary ────────────────────────────────────────────────────────
const DICT = {
  ar: {
    successMsg: 'تم إنشاء الملعب بنجاح! في انتظار موافقة الإدارة.',
    errorMsg: 'حدث خطأ أثناء إنشاء الملعب',
    btnIdle: 'تقديم طلب إضافة الملعب',
    btnUploadingLicense: 'جار رفع الرخصة...',
    btnUploadingPhoto: 'جار رفع الصورة...',
    btnSaving: 'جار حفظ بيانات الملعب...',
    btnDone: 'تم!',
    title: 'إضافة ملعب جديد',
    subtitle: 'قم بإدخال مواصفات ملعبك بدقة ليتم عرضه للاعبين في النظام.',
    secBasic: 'المعلومات الأساسية والمستندات',
    lblName: 'اسم الملعب',
    plhName: 'مثال: ملعب سانتياغو الخماسي',
    lblLicense: 'رخصة الملعب',
    hintLicense: 'PDF, JPG, PNG — يُرفع قبل الحفظ تلقائياً',
    lblPhoto: 'الصورة الرئيسية للملعب',
    hintPhoto: 'JPG, PNG, WEBP — حجم أقصى 5MB',
    secLoc: 'تفاصيل الموقع',
    lblGov: 'المحافظة',
    plhGov: 'المنوفية',
    lblCity: 'المدينة',
    plhCity: 'مدينة السادات',
    lblVillage: 'القرية / المنطقة',
    plhVillage: 'المنطقة الرابعة',
    lblAddress: 'العنوان بالتفصيل',
    plhAddress: 'شارع الجامعة، بجوار السنتر',
    lblLat: 'خط العرض (Latitude)',
    lblLng: 'خط الطول (Longitude)',
    secPricing: 'المواصفات والأسعار',
    lblPriceAm: 'سعر الساعة — صباحاً (ج.م)',
    lblPricePm: 'سعر الساعة — مساءً (ج.م)',
    lblSize: 'حجم الملعب',
    size5: 'خماسي (5-a-side)',
    size7: 'سباعي (7-a-side)',
    size11: 'قانوني (11-a-side)',
    lblSurface: 'نوع الأرضية',
    surfaceArt: 'نجيل صناعي',
    surfaceNat: 'نجيل طبيعي',
    surfaceHyb: 'هجين',
    lblCapacity: 'السعة (عدد اللاعبين)',
    secSettings: 'الإعدادات والمرافق',
    lblTimes: 'مواعيد العمل',
    lblOpen: 'وقت الفتح',
    lblClose: 'وقت الإغلاق',
    lblAmenities: 'المرافق والخدمات المتاحة',
    amLight: 'إضاءة كاشفة ليلية',
    amPark: 'موقف سيارات آمن',
    amChange: 'غرف تغيير ملابس',
    amShower: 'حمامات ودش واستحمام',
    amCafe: 'بوفيه / كافتيريا مشروبات',
  },
  en: {
    uploading: 'Uploading...',
    uploadSuccess: 'Uploaded successfully ✓',
    readyToUpload: 'Ready to upload',
    clickToChoose: 'Click to choose file',
    successMsg: 'Field created successfully! Waiting for admin approval.',
    errorMsg: 'An error occurred while creating the field',
    btnIdle: 'Submit Field Application',
    btnUploadingLicense: 'Uploading License...',
    btnUploadingPhoto: 'Uploading Photo...',
    btnSaving: 'Saving Field Data...',
    btnDone: 'Done!',
    title: 'Add New Field',
    subtitle: 'Enter your field specifications accurately to display to players in the system.',
    secBasic: 'Basic Info & Documents',
    lblName: 'Field Name',
    plhName: 'e.g., Santiago 5-a-side',
    lblLicense: 'Field License',
    hintLicense: 'PDF, JPG, PNG — Auto uploaded before saving',
    lblPhoto: 'Main Field Photo',
    hintPhoto: 'JPG, PNG, WEBP — Max size 5MB',
    secLoc: 'Location Details',
    lblGov: 'Governorate',
    plhGov: 'Monufia',
    lblCity: 'City',
    plhCity: 'Sadat City',
    lblVillage: 'Village / Area',
    plhVillage: 'Fourth District',
    lblAddress: 'Detailed Address',
    plhAddress: 'University St, next to the center',
    lblLat: 'Latitude',
    lblLng: 'Longitude',
    secPricing: 'Specifications & Pricing',
    lblPriceAm: 'Price/Hour — AM (EGP)',
    lblPricePm: 'Price/Hour — PM (EGP)',
    lblSize: 'Field Size',
    size5: '5-a-side',
    size7: '7-a-side',
    size11: '11-a-side (Standard)',
    lblSurface: 'Surface Type',
    surfaceArt: 'Artificial Turf',
    surfaceNat: 'Natural Grass',
    surfaceHyb: 'Hybrid Turf',
    lblCapacity: 'Capacity (Players)',
    secSettings: 'Settings & Amenities',
    lblTimes: 'Working Hours',
    lblOpen: 'Opening Time',
    lblClose: 'Closing Time',
    lblAmenities: 'Available Amenities & Services',
    amLight: 'Floodlights (Night)',
    amPark: 'Secure Parking',
    amChange: 'Changing Rooms',
    amShower: 'Showers',
    amCafe: 'Cafeteria / Beverages',
  }
};

// ─── AmenityCheck — simple accessible checkbox toggle ────────────────────────
function AmenityCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void; }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div
                onClick={() => onChange(!checked)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0
                    ${checked ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}
            >
                {checked && <span className="text-white text-xs font-black leading-none">✓</span>}
            </div>
            <span className="text-sm font-semibold text-slate-700">{label}</span>
        </label>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CreateFieldPage() {
    const { lang } = useLanguage();
    const d = DICT[lang];
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
            toast.success(d.successMsg);
            navigate('/owner/fields');

        } catch (err: any) {
            console.error('[CreateField] Pipeline error:', err.message);
            toast.error(err.message || d.errorMsg);
            setSubmitStep('idle');
            // Reset uploaded flags so picker shows correct state if user retries
            setLicenseUploaded(false);
            setPhotoUploaded(false);
        }
    };

    // ── Button label ─────────────────────────────────────────────────────────
    const buttonLabel = {
        idle: d.btnIdle,
        'uploading-license': d.btnUploadingLicense,
        'uploading-photo': d.btnUploadingPhoto,
        saving: d.btnSaving,
        done: d.btnDone,
    }[submitStep];

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans py-12" dir={lang === "ar" ? "rtl" : "ltr"}>
            <div className="max-w-4xl mx-auto px-6">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{d.title}</h1>
                    <p className="text-sm font-medium text-slate-500 mt-2">{d.subtitle}</p>
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
                            <h2 className="font-bold text-slate-800">{d.secBasic}</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    {d.lblName} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => set('name', e.target.value)}
                                    placeholder={d.plhName}
                                    className={inputCls}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FilePicker
                                    label={d.lblLicense}
                                    hint={d.hintLicense}
                                    icon={Upload}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    file={licenseFile}
                                    onChange={(f) => { setLicenseFile(f); setLicenseUploaded(false); }}
                                    uploading={submitStep === 'uploading-license'}
                                    uploaded={licenseUploaded}
                                />
                                <FilePicker
                                    label={d.lblPhoto}
                                    hint={d.hintPhoto}
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
                            <h2 className="font-bold text-slate-800">{d.secLoc}</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{d.lblGov} <span className="text-rose-500">*</span></label>
                                <input type="text" required value={form.governorate} onChange={(e) => set('governorate', e.target.value)} placeholder={d.plhGov} className={inputCls} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{d.lblCity} <span className="text-rose-500">*</span></label>
                                <input type="text" required value={form.city} onChange={(e) => set('city', e.target.value)} placeholder={d.plhCity} className={inputCls} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{d.lblVillage}</label>
                                <input type="text" value={form.village} onChange={(e) => set('village', e.target.value)} placeholder={d.plhVillage} className={inputCls} />
                            </div>
                            <div className="space-y-2 md:col-span-3">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{d.lblAddress} <span className="text-rose-500">*</span></label>
                                <input type="text" required value={form.address} onChange={(e) => set('address', e.target.value)} placeholder={d.plhAddress} className={inputCls} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{d.lblLat}</label>
                                <input type="text" required value={form.latitude} onChange={(e) => set('latitude', e.target.value)} dir="ltr" className={`${inputCls} font-mono text-left`} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{d.lblLng}</label>
                                <input type="text" required value={form.longitude} onChange={(e) => set('longitude', e.target.value)} dir="ltr" className={`${inputCls} font-mono text-left`} />
                            </div>
                        </div>
                    </div>

                    {/* ── 3. Specs & Pricing ────────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-center gap-2">
                            <Tag size={18} className="text-indigo-600" />
                            <h2 className="font-bold text-slate-800">{d.secPricing}</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{d.lblPriceAm}</label>
                                <input type="number" required min={0} value={form.priceAm}
                                    onChange={(e) => set('priceAm', Number(e.target.value))} className={inputCls} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{d.lblPricePm}</label>
                                <input type="number" required min={0} value={form.pricePm}
                                    onChange={(e) => set('pricePm', Number(e.target.value))} className={inputCls} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{d.lblSize}</label>
                                <select value={form.type} onChange={(e) => set('type', e.target.value)}
                                    className={`${inputCls} appearance-none`}>
                                    <option value={FieldType.FiveASide}>{d.size5}</option>
                                    <option value={FieldType.SevenASide}>{d.size7}</option>
                                    <option value={FieldType.ElevenASide}>{d.size11}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{d.lblSurface}</label>
                                <select value={form.surface} onChange={(e) => set('surface', e.target.value)}
                                    className={`${inputCls} appearance-none`}>
                                    <option value={FieldSurface.ArtificialTurf}>{d.surfaceArt}</option>
                                    <option value={FieldSurface.NaturalGrass}>{d.surfaceNat}</option>
                                    <option value={FieldSurface.HybridTurf}>{d.surfaceHyb}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{d.lblCapacity}</label>
                                <input type="number" required min={2} value={form.capacity}
                                    onChange={(e) => set('capacity', Number(e.target.value))} className={inputCls} />
                            </div>
                        </div>
                    </div>

                    {/* ── 4. Schedule & Amenities ───────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-center gap-2">
                            <Settings size={18} className="text-indigo-600" />
                            <h2 className="font-bold text-slate-800">{d.secSettings}</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Times */}
                            <div className="space-y-5">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Clock size={16} className="text-slate-500" /> {d.lblTimes}
                                </h3>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{d.lblOpen}</label>
                                    <input type="time" required value={form.openingTime}
                                        onChange={(e) => set('openingTime', e.target.value)} className={inputCls} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{d.lblClose}</label>
                                    <input type="time" required value={form.closingTime}
                                        onChange={(e) => set('closingTime', e.target.value)} className={inputCls} />
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Building size={16} className="text-slate-500" /> {d.lblAmenities}
                                </h3>
                                <div className="flex flex-col gap-4 pt-1">
                                    <AmenityCheck label={d.amLight} checked={form.amenities.hasLight}
                                        onChange={(v) => setForm(f => ({ ...f, amenities: { ...f.amenities, hasLight: v } }))} />
                                    <AmenityCheck label={d.amPark} checked={form.amenities.hasParking}
                                        onChange={(v) => setForm(f => ({ ...f, amenities: { ...f.amenities, hasParking: v } }))} />
                                    <AmenityCheck label={d.amChange} checked={form.amenities.hasChangingRooms}
                                        onChange={(v) => setForm(f => ({ ...f, amenities: { ...f.amenities, hasChangingRooms: v } }))} />
                                    <AmenityCheck label={d.amShower} checked={form.amenities.hasShowers}
                                        onChange={(v) => setForm(f => ({ ...f, amenities: { ...f.amenities, hasShowers: v } }))} />
                                    <AmenityCheck label={d.amCafe} checked={form.amenities.hasCafeteria}
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