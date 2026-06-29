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
} from 'lucide-react';
import { tournamentsApi } from '../api/api';
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

const TOURNAMENT_TYPES = [
  { value: 'FiveASide', label: 'كرة 5 (خماسي)', icon: '⚽' },
  { value: 'SevenASide', label: 'كرة 7 (سباعي)', icon: '🏟️' },
  { value: 'ElevenASide', label: 'كرة 11 (مفتوح)', icon: '🏆' },
];

const TEAM_COUNTS: (8 | 16 | 32)[] = [8, 16, 32];

// ── Validation ────────────────────────────────────────────────────────────────

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim() || data.name.length < 3) {
    errors.name = 'اسم البطولة يجب أن يكون 3 أحرف على الأقل';
  }
  if (!data.prize.trim()) errors.prize = 'الجائزة مطلوبة';
  if (!data.description.trim() || data.description.length < 10) {
    errors.description = 'الوصف يجب أن يكون 10 أحرف على الأقل';
  }
  if (!data.price || isNaN(Number(data.price)) || Number(data.price) < 0) {
    errors.price = 'أدخل رسوم تسجيل صحيحة';
  }
  if (!data.type) errors.type = 'اختر نوع البطولة';
  if (!data.startDate) errors.startDate = 'تاريخ البداية مطلوب';
  if (!data.endDate) errors.endDate = 'تاريخ النهاية مطلوب';
  if (data.startDate && data.endDate && data.startDate >= data.endDate) {
    errors.endDate = 'تاريخ النهاية يجب أن يكون بعد البداية';
  }
  if (!data.fieldId.trim()) errors.fieldId = 'معرّف الملعب مطلوب';
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
        <div className="w-8 h-8 rounded-xl bg-[#e8f5e9] flex items-center justify-center text-[#006b20]">
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
      <label className="text-sm font-semibold text-[#3e4a3c] flex items-center gap-1">
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-[#3e4a3c]/60 flex items-center gap-1">
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

export function CreateTournament() {
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

  // Validate on change if field was touched
  useEffect(() => {
    if (touched.size > 0) {
      setErrors(validate(form));
    }
  }, [form, touched]);

  const touch = (field: string) => setTouched((prev) => new Set([...prev, field]));

  const handleChange = (
    field: keyof FormData,
    value: string | number
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-3 h-11 rounded-xl border text-sm text-[#191c1c] font-medium placeholder-[#3e4a3c]/40 focus:outline-none transition-all ${
      errors[field] && touched.has(field)
        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
        : 'border-[#e1e3e1] focus:border-[#006b20] focus:ring-2 focus:ring-[#006b20]/20'
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Touch all fields to show errors
    const allFields = Object.keys(form) as (keyof FormData)[];
    setTouched(new Set(allFields));

    const validationErrors = validate(form);
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
        err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء البطولة'
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
        dir="rtl"
      >
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-20 h-20 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-[#006b20]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#191c1c]">تم إنشاء البطولة! 🎉</h2>
            <p className="text-sm text-[#3e4a3c]/70">
              تم إنشاء البطولة "{form.name}" بنجاح. يمكنك الآن إدارتها وقبول تسجيلات الفرق.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/tournaments/${createdId}`)}
              className="w-full h-11 bg-[#006b20] hover:bg-[#005318] text-white font-bold rounded-xl text-sm transition-all"
            >
              عرض البطولة
            </button>
            <button
              onClick={() => navigate('/tournaments')}
              className="w-full h-11 border border-[#e1e3e1] text-[#3e4a3c] font-bold rounded-xl text-sm hover:bg-[#f0f2f0] transition-all"
            >
              العودة للقائمة
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  const isFormValid = Object.keys(validate(form)).length === 0;

  return (
    <div className="min-h-screen bg-[#f6f8f7] pb-16" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#002b0e] via-[#006b20] to-[#00a336] pt-12 pb-8 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="max-w-2xl mx-auto relative z-10">
          <button
            onClick={() => navigate('/tournaments')}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-bold mb-4 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" /> العودة للبطولات
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">إنشاء بطولة جديدة</h1>
              <p className="text-white/70 text-xs mt-0.5">
                أنشئ بطولتك واستقبل تسجيلات الفرق
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 md:px-0 -mt-4 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Section 1: Basic Info ── */}
          <FormSection title="معلومات البطولة الأساسية" icon={<Info className="w-4 h-4" />}>
            <FormField label="اسم البطولة" required error={touched.has('name') ? errors.name : undefined}>
              <div className="relative">
                <Trophy className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#006b20]" />
                <input
                  type="text"
                  placeholder="مثال: October Weekend League"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => touch('name')}
                  className={`${inputClass('name')} ps-10`}
                />
              </div>
            </FormField>

            <FormField
              label="وصف البطولة"
              required
              error={touched.has('description') ? errors.description : undefined}
              hint="أضف تفاصيل تساعد الفرق على معرفة طبيعة البطولة"
            >
              <textarea
                rows={4}
                placeholder="اكتب وصفاً شاملاً يحتوي على قواعد البطولة والتفاصيل الهامة..."
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                onBlur={() => touch('description')}
                className={`${inputClass('description')} h-auto py-3 resize-none`}
              />
            </FormField>

            {/* Tournament Type */}
            <FormField label="نوع البطولة" required error={touched.has('type') ? errors.type : undefined}>
              <div className="grid grid-cols-3 gap-3">
                {TOURNAMENT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => { handleChange('type', t.value); touch('type'); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                      form.type === t.value
                        ? 'border-[#006b20] bg-[#e8f5e9] ring-2 ring-[#006b20]/20'
                        : 'border-[#e1e3e1] hover:border-[#006b20]/40 hover:bg-[#f6f8f7]'
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
          <FormSection title="إعدادات الفرق" icon={<Users className="w-4 h-4" />}>
            <FormField label="عدد الفرق المشاركة" required>
              <div className="grid grid-cols-3 gap-3">
                {TEAM_COUNTS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleChange('numberOfTeams', count)}
                    className={`flex flex-col items-center gap-1 p-4 rounded-xl border font-black text-sm transition-all ${
                      form.numberOfTeams === count
                        ? 'border-[#006b20] bg-[#e8f5e9] text-[#006b20] ring-2 ring-[#006b20]/20'
                        : 'border-[#e1e3e1] text-[#3e4a3c] hover:border-[#006b20]/40 hover:bg-[#f6f8f7]'
                    }`}
                  >
                    <span className="text-2xl font-black">{count}</span>
                    <span className="text-[10px] font-bold">فريق</span>
                    <span className="text-[9px] text-[#3e4a3c]/60">
                      {count / 4} مجموعات
                    </span>
                  </button>
                ))}
              </div>
              <div className="bg-[#f6f8f7] rounded-xl p-3 border border-[#e1e3e1] mt-2">
                <div className="flex items-center gap-2 text-xs text-[#3e4a3c]">
                  <Shield className="w-3.5 h-3.5 text-[#006b20] shrink-0" />
                  <span>
                    مع {form.numberOfTeams} فريق: {form.numberOfTeams / 4} مجموعات × 4 فرق
                    — أعلى فريقين من كل مجموعة يتأهلان للدور الإقصائي
                  </span>
                </div>
              </div>
            </FormField>
          </FormSection>

          {/* ── Section 3: Prizes & Fees ── */}
          <FormSection title="الجوائز والرسوم" icon={<DollarSign className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="الجائزة الكبرى"
                required
                error={touched.has('prize') ? errors.prize : undefined}
              >
                <div className="relative">
                  <Trophy className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                  <input
                    type="text"
                    placeholder="مثال: EGP 15,000"
                    value={form.prize}
                    onChange={(e) => handleChange('prize', e.target.value)}
                    onBlur={() => touch('prize')}
                    className={`${inputClass('prize')} ps-10`}
                  />
                </div>
              </FormField>

              <FormField
                label="رسوم التسجيل (جنيه)"
                required
                error={touched.has('price') ? errors.price : undefined}
              >
                <div className="relative">
                  <DollarSign className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#006b20]" />
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

          {/* ── Section 4: Dates ── */}
          <FormSection title="تواريخ البطولة" icon={<CalendarDays className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="تاريخ البداية"
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
                label="تاريخ النهاية"
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
          <FormSection title="الملعب" icon={<MapPin className="w-4 h-4" />}>
            <FormField
              label="معرّف الملعب"
              required
              error={touched.has('fieldId') ? errors.fieldId : undefined}
              hint="أدخل ID الملعب المسجل في منصة حجززايا"
            >
              <div className="relative">
                <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#006b20]" />
                <input
                  type="text"
                  placeholder="مثال: field-123"
                  value={form.fieldId}
                  onChange={(e) => handleChange('fieldId', e.target.value)}
                  onBlur={() => touch('fieldId')}
                  className={`${inputClass('fieldId')} ps-10`}
                />
              </div>
            </FormField>
          </FormSection>

          {/* ── Preview Summary ── */}
          {form.name && (
            <div className="bg-gradient-to-br from-[#003d12] to-[#006b20] rounded-2xl p-5 space-y-3">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" /> معاينة البطولة
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'الاسم', value: form.name },
                  { label: 'النوع', value: TOURNAMENT_TYPES.find((t) => t.value === form.type)?.label ?? '—' },
                  { label: 'الفرق', value: `${form.numberOfTeams} فريق` },
                  { label: 'الجائزة', value: form.prize || '—' },
                  { label: 'رسوم التسجيل', value: form.price ? `${form.price} جنيه` : '—' },
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
              className="flex-1 h-12 border border-[#e1e3e1] text-[#3e4a3c] font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#f0f2f0] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="flex-[2] h-12 bg-[#006b20] hover:bg-[#005318] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  إنشاء البطولة
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
