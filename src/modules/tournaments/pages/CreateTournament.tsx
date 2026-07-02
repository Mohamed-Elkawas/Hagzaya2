// ─────────────────────────────────────────────────────────────────────────────
// CreateTournament — Multi-field form for Owners to create a new tournament
// Rich validation, date constraints, field picker, team count selector
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Trophy,
  Users,
  CalendarDays,
  DollarSign,
  FileText,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Shield,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { tournamentsApi } from '../api/api';
import { fieldsApi } from '../../fields/api/fields.api';
import { useLanguage } from '../../../core/context/LanguageContext';
import type { Field } from '../../fields/types/fields.types';
import type { CreateTournamentPayload } from '../types/tournament';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormErrors {
  name?: string;
  numberOfTeams?: string;
  prize?: string;
  description?: string;
  price?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  fieldId?: string;
}

interface FormData {
  name: string;
  numberOfTeams: 8 | 16 | 32;
  prize: string;
  description: string;
  price: string;
  type: string;
  startDate: string;
  endDate: string;
  fieldId: string;
}

const getTournamentTypes = (d: any) => [
  { value: 'FiveASide', label: d.type5, icon: '⚽' },
  { value: 'SevenASide', label: d.type7, icon: '🏟️' },
  { value: 'ElevenASide', label: d.type11, icon: '🏆' },
];

const TEAM_COUNTS: (8 | 16 | 32)[] = [8, 16, 32];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Decode ownerId from a stored JWT without external libraries */
function parseOwnerIdFromToken(): number | null {
  try {
    const token = localStorage.getItem('hagzaya_token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const raw =
      payload.sub ||
      payload.id ||
      payload.userId ||
      payload.ownerId ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const parsed = Number(raw);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

function validate(data: FormData, d: typeof DICT['ar']): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim() || data.name.length < 3) {
    errors.name = d.errName;
  }
  if (!data.prize.trim()) errors.prize = d.errPrize;
  if (!data.description.trim() || data.description.length < 10) {
    errors.description = d.errDesc;
  }
  if (!data.price || isNaN(Number(data.price)) || Number(data.price) < 0) {
    errors.price = d.errPrice;
  }
  if (!data.type) errors.type = d.errType;
  if (!data.startDate) errors.startDate = d.errStartDate;
  if (!data.endDate) errors.endDate = d.errEndDate;
  if (data.startDate && data.endDate && data.startDate >= data.endDate) {
    errors.endDate = d.errEndDateAfter;
  }
  if (!data.fieldId.trim()) errors.fieldId = d.errFieldId;
  return errors;
}

// ── Step components ───────────────────────────────────────────────────────────

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e1e3e1] p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-[#f0f2f0]">
        <div className="w-8 h-8 rounded-xl bg-[#e8f5e9] flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="font-bold text-sm text-[#191c1c]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FormField({
  label,
  error,
  required,
  children,
  hint,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-1">
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-on-surface-variant/60 flex items-center gap-1">
          <Info className="w-3 h-3" /> {hint}
        </p>
      )}
      {error && (
        <p className="text-[11px] text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────


// ─── Local Dictionary ────────────────────────────────────────────────────────
const DICT = {
  ar: {
    type5: 'كرة 5 (خماسي)',
    type7: 'كرة 7 (سباعي)',
    type11: 'كرة 11 (مفتوح)',
    errName: 'اسم البطولة يجب أن يكون 3 أحرف على الأقل',
    errPrize: 'الجائزة مطلوبة',
    errDesc: 'الوصف يجب أن يكون 10 أحرف على الأقل',
    errPrice: 'أدخل رسوم تسجيل صحيحة',
    errType: 'اختر نوع البطولة',
    errStartDate: 'تاريخ البداية مطلوب',
    errEndDate: 'تاريخ النهاية مطلوب',
    errEndDateAfter: 'تاريخ النهاية يجب أن يكون بعد البداية',
    errFieldId: 'معرّف الملعب مطلوب',
    errSubmit: 'حدث خطأ أثناء إنشاء البطولة',
    successTitle: 'تم إنشاء البطولة! 🎉',
    successDesc: 'تم إنشاء البطولة "{name}" بنجاح. يمكنك الآن إدارتها وقبول تسجيلات الفرق.',
    btnView: 'عرض البطولة',
    btnBack: 'العودة للقائمة',
    btnBackTop: 'العودة للبطولات',
    title: 'إنشاء بطولة جديدة',
    subtitle: 'أنشئ بطولتك واستقبل تسجيلات الفرق',
    secBasic: 'معلومات البطولة الأساسية',
    lblName: 'اسم البطولة',
    plhName: 'مثال: October Weekend League',
    lblDesc: 'وصف البطولة',
    hintDesc: 'أضف تفاصيل تساعد الفرق على معرفة طبيعة البطولة',
    plhDesc: 'اكتب وصفاً شاملاً يحتوي على قواعد البطولة والتفاصيل الهامة...',
    lblType: 'نوع البطولة',
    secTeams: 'إعدادات الفرق',
    lblTeamsCount: 'عدد الفرق المشاركة',
    teamWord: 'فريق',
    groupsWord: 'مجموعات',
    teamsDesc1: 'مع {count} فريق: {groups} مجموعات × 4 فرق',
    teamsDesc2: '— أعلى فريقين من كل مجموعة يتأهلان للدور الإقصائي',
    secPrizes: 'الجوائز والرسوم',
    lblPrize: 'الجائزة الكبرى',
    plhPrize: 'مثال: EGP 15,000',
    lblPrice: 'رسوم التسجيل (جنيه)',
    secDateLoc: 'الموعد والمكان',
    lblStartDate: 'تاريخ البداية',
    lblEndDate: 'تاريخ النهاية',
    secField: 'الملعب',
    lblField: 'اختر الملعب',
    hintNoFields: 'لا توجد ملاعب مسجلة — أضف ملعبك أولاً من صفحة الملاعب',
    loadingFields: 'جار تحميل ملاعبك...',
    optSelectField: '-- اختر الملعب --',
    plhFieldId: 'أدخل معرّف الملعب يدوياً...',
    previewTitle: 'معاينة البطولة',
    lblPrevName: 'الاسم',
    lblPrevType: 'النوع',
    lblPrevTeams: 'عدد الفرق',
    lblPrevPrize: 'الجائزة',
    lblPrevPrice: 'الاشتراك',
    lblPrevField: 'الملعب',
    valFree: 'مجاناً',
    valEgp: 'ج.م',
    valNone: '—',
    valSelected: 'محدد',
    valNotSelected: 'غير محدد',
    btnCreate: 'إنشاء البطولة',
    btnCreating: 'جاري الإنشاء...',
    btnCancel: 'إلغاء'
  },
  en: {
    type5: '5-a-side',
    type7: '7-a-side',
    type11: '11-a-side',
    errName: 'Tournament name must be at least 3 characters',
    errPrize: 'Prize is required',
    errDesc: 'Description must be at least 10 characters',
    errPrice: 'Enter valid registration fee',
    errType: 'Select tournament type',
    errStartDate: 'Start date is required',
    errEndDate: 'End date is required',
    errEndDateAfter: 'End date must be after start date',
    errFieldId: 'Field ID is required',
    errSubmit: 'An error occurred while creating tournament',
    successTitle: 'Tournament Created! 🎉',
    successDesc: 'Tournament "{name}" created successfully. You can now manage it and accept registrations.',
    btnView: 'View Tournament',
    btnBack: 'Back to List',
    btnBackTop: 'Back to Tournaments',
    title: 'Create New Tournament',
    subtitle: 'Create your tournament and accept team registrations',
    secBasic: 'Basic Tournament Information',
    lblName: 'Tournament Name',
    plhName: 'e.g., October Weekend League',
    lblDesc: 'Tournament Description',
    hintDesc: 'Add details to help teams understand the tournament',
    plhDesc: 'Write a comprehensive description with rules and important details...',
    lblType: 'Tournament Type',
    secTeams: 'Teams Settings',
    lblTeamsCount: 'Number of Participating Teams',
    teamWord: 'Team',
    groupsWord: 'Groups',
    teamsDesc1: 'With {count} teams: {groups} groups × 4 teams',
    teamsDesc2: '— Top two teams from each group qualify to knockouts',
    secPrizes: 'Prizes & Fees',
    lblPrize: 'Grand Prize',
    plhPrize: 'e.g., 15,000 EGP',
    lblPrice: 'Registration Fee (EGP)',
    secDateLoc: 'Date & Location',
    lblStartDate: 'Start Date',
    lblEndDate: 'End Date',
    secField: 'Field',
    lblField: 'Select Field',
    hintNoFields: 'No registered fields — add your field first from Fields page',
    loadingFields: 'Loading your fields...',
    optSelectField: '-- Select Field --',
    plhFieldId: 'Enter Field ID manually...',
    previewTitle: 'Tournament Preview',
    lblPrevName: 'Name',
    lblPrevType: 'Type',
    lblPrevTeams: 'Teams',
    lblPrevPrize: 'Prize',
    lblPrevPrice: 'Fee',
    lblPrevField: 'Field',
    valFree: 'Free',
    valEgp: 'EGP',
    valNone: '—',
    valSelected: 'Selected',
    valNotSelected: 'Not Selected',

    btnCreate: 'Create Tournament',
    btnCreating: 'Creating...',
    btnCancel: 'Cancel'
  }
};

export function CreateTournament() {
    const { lang } = useLanguage();
    const d = DICT[lang];
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    name: '',
    numberOfTeams: 16,
    prize: '',
    description: '',
    price: '',
    type: '',
    startDate: '',
    endDate: '',
    fieldId: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  // ── Owner Fields Dropdown ────────────────────────────────────────────────
  const [ownerFields, setOwnerFields] = useState<Field[]>([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);

  useEffect(() => {
    const ownerId = parseOwnerIdFromToken();
    if (!ownerId) return;
    setIsLoadingFields(true);
    fieldsApi
      .getFieldsByOwner(ownerId)
      .then((fields) => setOwnerFields(Array.isArray(fields) ? fields : []))
      .catch(() => setOwnerFields([]))
      .finally(() => setIsLoadingFields(false));
  }, []);

  // Validate on change if field was touched
  useEffect(() => {
    if (touched.size > 0) {
      setErrors(validate(form, d));
    }
  }, [form, touched, d]);

  const touch = (field: string) => setTouched((prev) => new Set([...prev, field]));

  const handleChange = (
    field: keyof FormData,
    value: string | number
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-3 h-11 rounded-xl border text-sm text-[#191c1c] font-medium placeholder-on-surface-variant/40 focus:outline-none transition-all ${
      errors[field] && touched.has(field)
        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
        : 'border-[#e1e3e1] focus:border-primary focus:ring-2 focus:ring-primary/20'
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allFields = Object.keys(form) as (keyof FormData)[];
    setTouched(new Set(allFields));

    const validationErrors = validate(form, d);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload: CreateTournamentPayload = {
      name: form.name.trim(),
      numberOfTeams: form.numberOfTeams,
      prize: form.prize.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      fieldId: form.fieldId.trim(),
    };

    try {
      const created = await tournamentsApi.create(payload);
      setCreatedId(created?.id ?? '1');
      setIsSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : d.errSubmit
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success State ────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <div
        className="min-h-screen bg-[#f6f8f7] flex items-center justify-center p-4"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-20 h-20 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#191c1c]">{d.successTitle}</h2>
            <p className="text-sm text-on-surface-variant/70">
              {d.successDesc.replace('{name}', form.name)}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/tournaments/${createdId}`)}
              className="w-full h-11 bg-primary hover:bg-[#005318] text-white font-bold rounded-xl text-sm transition-all"
            >
              {d.btnView}
            </button>
            <button
              onClick={() => navigate('/tournaments')}
              className="w-full h-11 border border-[#e1e3e1] text-on-surface-variant font-bold rounded-xl text-sm hover:bg-[#f0f2f0] transition-all"
            >
              {d.btnBack}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  const isFormValid = Object.keys(validate(form, d)).length === 0;

  return (
    <div className="min-h-screen bg-[#f6f8f7] pb-16" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-linear-to-br from-[#002b0e] via-primary to-[#00a336] pt-12 pb-8 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="max-w-2xl mx-auto relative z-10">
          <button
            onClick={() => navigate('/tournaments')}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-bold mb-4 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" /> {d.btnBackTop}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{d.title}</h1>
              <p className="text-white/70 text-xs mt-0.5">
                {d.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 md:px-0 -mt-4 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Section 1: Basic Info ── */}
          <FormSection title={d.secBasic} icon={<Info className="w-4 h-4" />}>
            <FormField label={d.lblName} required error={touched.has('name') ? errors.name : undefined}>
              <div className="relative">
                <Trophy className="absolute inset-s-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input
                  type="text"
                  placeholder={d.plhName}
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => touch('name')}
                  className={`${inputClass('name')} ps-10`}
                />
              </div>
            </FormField>

            <FormField
              label={d.lblDesc}
              required
              error={touched.has('description') ? errors.description : undefined}
              hint={d.hintDesc}
            >
              <textarea
                rows={4}
                placeholder={d.plhDesc}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                onBlur={() => touch('description')}
                className={`${inputClass('description')} h-auto py-3 resize-none`}
              />
            </FormField>

            {/* Tournament Type */}
            <FormField label={d.lblType} required error={touched.has('type') ? errors.type : undefined}>
              <div className="grid grid-cols-3 gap-3">
                {getTournamentTypes(d).map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => { handleChange('type', t.value); touch('type'); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                      form.type === t.value
                        ? 'border-primary bg-[#e8f5e9] ring-2 ring-primary/20'
                        : 'border-[#e1e3e1] hover:border-primary/40 hover:bg-[#f6f8f7]'
                    }`}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <span className="text-[11px] font-bold text-[#191c1c] leading-tight">
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </FormField>
          </FormSection>

          {/* ── Section 2: Teams ── */}
          <FormSection title={d.secTeams} icon={<Users className="w-4 h-4" />}>
            <FormField label={d.lblTeamsCount} required>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TEAM_COUNTS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleChange('numberOfTeams', count)}
                    className={`flex flex-col items-center gap-1 p-4 rounded-xl border font-black text-sm transition-all ${
                      form.numberOfTeams === count
                        ? 'border-primary bg-[#e8f5e9] text-primary ring-2 ring-primary/20'
                        : 'border-[#e1e3e1] text-on-surface-variant hover:border-primary/40 hover:bg-[#f6f8f7]'
                    }`}
                  >
                    <span className="text-2xl font-black">{count}</span>
                    <span className="text-[10px] font-bold">{d.teamWord}</span>
                    <span className="text-[9px] text-on-surface-variant/60">
                      {count / 4} {d.groupsWord}
                    </span>
                  </button>
                ))}
              </div>
              <div className="bg-[#f6f8f7] rounded-xl p-3 border border-[#e1e3e1] mt-2">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    {d.teamsDesc1.replace('{count}', String(form.numberOfTeams)).replace('{groups}', String(form.numberOfTeams / 4))}
                    {d.teamsDesc2}
                  </span>
                </div>
              </div>
            </FormField>
          </FormSection>

          {/* ── Section 3: Prizes & Fees ── */}
          <FormSection title={d.secPrizes} icon={<DollarSign className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={d.lblPrize}
                required
                error={touched.has('prize') ? errors.prize : undefined}
              >
                <div className="relative">
                  <Trophy className="absolute inset-s-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                  <input
                    type="text"
                    placeholder={d.plhPrize}
                    value={form.prize}
                    onChange={(e) => handleChange('prize', e.target.value)}
                    onBlur={() => touch('prize')}
                    className={`${inputClass('prize')} ps-10`}
                  />
                </div>
              </FormField>

              <FormField
                label={d.lblPrice}
                required
                error={touched.has('price') ? errors.price : undefined}
              >
                <div className="relative">
                  <DollarSign className="absolute inset-s-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="number"
                    min={0}
                    step={50}
                    placeholder="500"
                    value={form.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    onBlur={() => touch('price')}
                    className={`${inputClass('price')} ps-10`}
                  />
                </div>
              </FormField>
            </div>
          </FormSection>

          {/* ── Section 4: الموعد والمكان ── */}
          <FormSection title={d.secDateLoc} icon={<CalendarDays className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={d.lblStartDate}
                required
                error={touched.has('startDate') ? errors.startDate : undefined}
              >
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  onBlur={() => touch('startDate')}
                  className={inputClass('startDate')}
                />
              </FormField>

              <FormField
                label={d.lblEndDate}
                required
                error={touched.has('endDate') ? errors.endDate : undefined}
              >
                <input
                  type="datetime-local"
                  value={form.endDate}
                  min={form.startDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  onBlur={() => touch('endDate')}
                  className={inputClass('endDate')}
                />
              </FormField>
            </div>
          </FormSection>

          {/* ── Section 5: Field ── */}
          <FormSection title={d.secField} icon={<MapPin className="w-4 h-4" />}>
            <FormField
              label={d.lblField}
              required
              error={touched.has('fieldId') ? errors.fieldId : undefined}
              hint={ownerFields.length === 0 && !isLoadingFields ? d.hintNoFields : undefined}
            >
              <div className="relative">
                <MapPin className="absolute inset-s-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary z-10 pointer-events-none" />
                {isLoadingFields ? (
                  <div className={`${inputClass('fieldId')} ps-10 flex items-center gap-2 text-on-surface-variant/50`}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {d.loadingFields}
                  </div>
                ) : ownerFields.length > 0 ? (
                  <div className="relative">
                    <select
                      value={form.fieldId}
                      onChange={(e) => { handleChange('fieldId', e.target.value); touch('fieldId'); }}
                      onBlur={() => touch('fieldId')}
                      className={`${inputClass('fieldId')} ps-10 pe-8 appearance-none cursor-pointer`}
                    >
                      <option value="">{d.optSelectField}</option>
                      {ownerFields.map((f) => (
                        <option key={f.id} value={String(f.id)}>
                          {f.name} — {f.city}{f.governorate ? ` (${f.governorate})` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute inset-e-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder={d.plhFieldId}
                    value={form.fieldId}
                    onChange={(e) => handleChange('fieldId', e.target.value)}
                    onBlur={() => touch('fieldId')}
                    className={`${inputClass('fieldId')} ps-10`}
                  />
                )}
              </div>
            </FormField>
          </FormSection>

          {/* ── Preview Summary ── */}
          {form.name && (
            <div className="bg-linear-to-br from-[#003d12] to-primary rounded-2xl p-5 space-y-3">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" /> {d.previewTitle}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: d.lblPrevName, value: form.name },
                  { label: d.lblPrevType, value: getTournamentTypes(d).find((t) => t.value === form.type)?.label ?? d.valNone },
                  { label: d.lblPrevTeams, value: `${form.numberOfTeams} ${d.teamWord}` },
                  { label: d.lblPrevPrize, value: form.prize || d.valNone },
                  { label: d.lblPrevPrice, value: form.price ? `${form.price} ${d.valEgp}` : d.valNone },
                ].map((item) => (
                  <div key={item.label} className="bg-white/10 rounded-lg px-3 py-2">
                    <p className="text-white/60 font-medium">{item.label}</p>
                    <p className="text-white font-bold truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm font-bold text-red-600">⚠️ {submitError}</p>
            </div>
          )}

          {/* Submit & Cancel */}
          <div className="flex gap-3 pb-4">
            <button
              type="button"
              onClick={() => navigate('/tournaments')}
              className="flex-1 h-12 border border-[#e1e3e1] text-on-surface-variant font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#f0f2f0] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
              {d.btnCancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="flex-2 h-12 bg-primary hover:bg-[#005318] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  {isSubmitting ? d.btnCreating : d.btnCreate}
                  <ChevronLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}