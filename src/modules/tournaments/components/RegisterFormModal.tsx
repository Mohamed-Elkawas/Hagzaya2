// ─────────────────────────────────────────────────────────────────────────────
// RegisterFormModal — 3-step modal for joining a tournament
// Step 1: Team name | Step 2: Add members via search | Step 3: Payment method
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  UserPlus,
  UserMinus,
  Smartphone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Shield,
} from 'lucide-react';
import { useTournamentState } from '../hooks/useTournamentState';
import { tournamentsApi } from '../api/api';
import type { PlayerProfile } from '../types/tournament';
import { PaymentMethod } from '../types/tournament';

interface RegisterFormModalProps {
  tournamentId: string;
  tournamentName: string;
  price: number;
  onSuccess?: () => void;
}

// ── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'بيانات الفريق' },
    { num: 2, label: 'إضافة الأعضاء' },
    { num: 3, label: 'طريقة الدفع' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                step.num < currentStep
                  ? 'bg-primary text-white'
                  : step.num === currentStep
                  ? 'bg-primary text-white ring-4 ring-primary/20'
                  : 'bg-[#f0f2f0] text-on-surface-variant/50'
              }`}
            >
              {step.num < currentStep ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                step.num
              )}
            </div>
            <span
              className={`text-[10px] font-semibold whitespace-nowrap ${
                step.num === currentStep ? 'text-primary' : 'text-on-surface-variant/50'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`h-0.5 w-12 mx-1 mb-4 transition-all ${
                step.num < currentStep ? 'bg-primary' : 'bg-[#e1e3e1]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Team Name ────────────────────────────────────────────────────────

function Step1({ onNext }: { onNext: () => void }) {
  const { registrationData, setTeamName } = useTournamentState();
  const isValid = registrationData.teamName.trim().length >= 2;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-[#191c1c] mb-1">اسم الفريق</h3>
        <p className="text-xs text-on-surface-variant/70">
          اختر اسماً مميزاً يعبر عن فريقك في البطولة
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-on-surface-variant">
          اسم الفريق <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-s-3 top-1/2 -translate-y-1/2">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <input
            type="text"
            placeholder="مثال: النسور الذهبية"
            value={registrationData.teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full ps-10 pe-4 h-11 rounded-xl border border-[#e1e3e1] text-sm font-medium text-[#191c1c] placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        {registrationData.teamName.length > 0 &&
          registrationData.teamName.length < 2 && (
            <p className="text-[11px] text-red-500">الاسم يجب أن يكون حرفين على الأقل</p>
          )}
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full h-11 bg-primary hover:bg-[#005318] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
      >
        التالي
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Step 2: Add Members ──────────────────────────────────────────────────────

function Step2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const {
    registrationData,
    addMember,
    removeMember,
    playerSearchQuery,
    setPlayerSearchQuery,
    playerSearchResults,
    setPlayerSearchResults,
    isSearchingPlayers,
    setSearchingPlayers,
  } = useTournamentState();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playerSearchQuery.trim()) {
      setPlayerSearchResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchingPlayers(true);
      try {
        const allPlayers = await tournamentsApi.getAllPlayers();
        const playersArray = Array.isArray(allPlayers) ? allPlayers : [];
        const query = playerSearchQuery.toLowerCase();
        
        const filtered = playersArray.filter(p => {
            const usernameMatch = p.username?.toLowerCase().includes(query);
            const fullNameMatch = p.fullName?.toLowerCase().includes(query);
            const firstNameMatch = (p as any).firstName?.toLowerCase().includes(query);
            const lastNameMatch = (p as any).lastName?.toLowerCase().includes(query);
            return usernameMatch || fullNameMatch || firstNameMatch || lastNameMatch;
        });

        setPlayerSearchResults(filtered);
      } catch {
        setPlayerSearchResults([]);
      } finally {
        setSearchingPlayers(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [playerSearchQuery]);

  const isAlreadyAdded = (id: string) => registrationData.memberIds.includes(id);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#191c1c] mb-1">إضافة أعضاء الفريق</h3>
        <p className="text-xs text-on-surface-variant/70">ابحث عن اللاعبين بالاسم وأضفهم للفريق</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
        <input
          type="text"
          placeholder="ابحث باسم المستخدم..."
          value={playerSearchQuery}
          onChange={(e) => setPlayerSearchQuery(e.target.value)}
          className="w-full ps-10 pe-4 h-10 rounded-xl border border-[#e1e3e1] text-sm text-[#191c1c] placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {isSearchingPlayers && (
          <Loader2 className="absolute inset-e-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
        )}
      </div>

      {/* Search Results */}
      {playerSearchResults.length > 0 && (
        <div className="border border-[#e1e3e1] rounded-xl overflow-hidden max-h-44 overflow-y-auto divide-y divide-[#f0f2f0] shadow-lg">
          {playerSearchResults.map((player: PlayerProfile) => (
            <div
              key={player.id}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f6f8f7] transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-[#00a336] flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm">
                {(player.fullName ?? player.username).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#191c1c] truncate">
                  {player.fullName ?? (`${(player as any).firstName || ''} ${(player as any).lastName || ''}`.trim() || player.username)}
                </p>
                <p className="text-[10px] text-on-surface-variant/60 truncate">
                  @{player.username}
                  {player.position ? ` · ${player.position}` : ''}
                </p>
              </div>
              <button
                onClick={() =>
                  isAlreadyAdded(player.id) ? removeMember(player.id) : addMember(player)
                }
                className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  isAlreadyAdded(player.id)
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-[#e8f5e9] text-primary hover:bg-[#c8e6c9]'
                }`}
              >
                {isAlreadyAdded(player.id) ? (
                  <><UserMinus className="w-3 h-3" /> إزالة</>
                ) : (
                  <><UserPlus className="w-3 h-3" /> إضافة</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Added Members */}
      {registrationData.selectedPlayers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-on-surface-variant">
            أعضاء الفريق ({registrationData.selectedPlayers.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {registrationData.selectedPlayers.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1.5 bg-[#e8f5e9] border border-[#c8e6c9] rounded-full px-2.5 py-1"
              >
                <span className="text-xs font-semibold text-primary">
                  {p.fullName ?? (`${(p as any).firstName || ''} ${(p as any).lastName || ''}`.trim() || p.username)}
                </span>
                <button
                  onClick={() => removeMember(p.id)}
                  className="text-primary/60 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 h-11 border border-[#e1e3e1] text-on-surface-variant font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#f6f8f7] transition-all"
        >
          <ChevronRight className="w-4 h-4" />
          السابق
        </button>
        <button
          onClick={onNext}
          className="flex-1 h-11 bg-primary hover:bg-[#005318] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
        >
          التالي
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Payment Method ───────────────────────────────────────────────────

function Step3({
  tournamentId,
  price,
  onBack,
  onSuccess,
}: {
  tournamentId: string;
  price: number;
  onBack: () => void;
  onSuccess?: () => void;
}) {
  const { registrationData, setPaymentMethod, resetRegistration } =
    useTournamentState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const paymentOptions = [
    {
      method: PaymentMethod.VodafoneCash,
      label: 'Vodafone Cash',
      desc: 'ادفع عبر Vodafone Cash بسهولة وأمان',
      icon: <Smartphone className="w-5 h-5 text-red-500" />,
      color: 'border-red-200 bg-red-50/50',
      active: 'border-red-400 bg-red-50 ring-2 ring-red-200',
    },
    {
      method: PaymentMethod.InstaPay,
      label: 'InstaPay',
      desc: 'ادفع عبر تطبيق InstaPay فورياً',
      icon: <CreditCard className="w-5 h-5 text-blue-500" />,
      color: 'border-blue-200 bg-blue-50/50',
      active: 'border-blue-400 bg-blue-50 ring-2 ring-blue-200',
    },
  ];

  const handleSubmit = async () => {
    if (!registrationData.paymentMethod) return;
    if (!proofFile) {
        setSubmitError('يرجى إرفاق صورة تحويل (إيصال الدفع)');
        return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      let paymentProofUrl = '';
      if (proofFile) {
          // Read the file as a data URL to pass to the backend payload
          paymentProofUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(proofFile);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = error => reject(error);
          });
      }

      await tournamentsApi.joinTournament(tournamentId, {
        teamName: registrationData.teamName,
        memberIds: registrationData.memberIds.map(String),
        paymentMethod: registrationData.paymentMethod as PaymentMethod,
        paymentProofUrl: paymentProofUrl || undefined,
      });
      setSubmitted(true);
      setTimeout(() => {
        resetRegistration();
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'حدث خطأ. أعد المحاولة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
        <div className="w-16 h-16 bg-[#e8f5e9] rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-black text-[#191c1c]">تم التسجيل بنجاح! 🎉</h3>
          <p className="text-xs text-on-surface-variant/70 mt-1">
            طلب تسجيل فريقك قيد المراجعة. انتظر موافقة المنظم.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#191c1c] mb-1">طريقة الدفع</h3>
        <p className="text-xs text-on-surface-variant/70">
          رسوم التسجيل:{' '}
          <strong className="text-primary">
            {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(price)}
          </strong>
        </p>
      </div>

      <div className="space-y-3">
        {paymentOptions.map((opt) => {
          const isSelected = registrationData.paymentMethod === opt.method;
          return (
            <div key={opt.method} className="space-y-2">
                <button
                  onClick={() => setPaymentMethod(opt.method)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-start transition-all ${
                    isSelected ? opt.active : `${opt.color} hover:opacity-80`
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#191c1c]">{opt.label}</p>
                    <p className="text-[11px] text-on-surface-variant/70">{opt.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-[#e1e3e1]'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </button>
                {isSelected && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-bold text-slate-800 mb-2">إرفاق صورة تحويل (إيصال الدفع) <span className="text-red-500">*</span></label>
                        <input 
                            type="file" 
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 focus:outline-none"
                        />
                        {proofFile && (
                            <p className="text-xs text-green-600 mt-2 font-medium">تم إرفاق الملف: {proofFile.name}</p>
                        )}
                    </div>
                )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-[#f6f8f7] rounded-xl p-3.5 space-y-2 border border-[#e1e3e1]">
        <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-wide mb-1">ملخص التسجيل</p>
        <div className="flex justify-between text-xs text-on-surface-variant">
          <span>اسم الفريق:</span>
          <span className="font-bold text-[#191c1c]">{registrationData.teamName}</span>
        </div>
        <div className="flex justify-between text-xs text-on-surface-variant">
          <span>عدد الأعضاء:</span>
          <span className="font-bold text-[#191c1c]">
            {registrationData.selectedPlayers.length} لاعب
          </span>
        </div>
        <div className="border-t border-[#e1e3e1] pt-2 flex justify-between text-xs">
          <span className="text-on-surface-variant">رسوم التسجيل:</span>
          <span className="font-black text-primary text-sm">
            {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(price)}
          </span>
        </div>
      </div>

      {submitError && (
        <p className="text-[11px] text-red-500 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
          {submitError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 h-11 border border-[#e1e3e1] text-on-surface-variant font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#f6f8f7] transition-all disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
          السابق
        </button>
        <button
          onClick={handleSubmit}
          disabled={!registrationData.paymentMethod || isSubmitting}
          className="flex-1 h-11 bg-primary hover:bg-[#005318] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'تأكيد التسجيل'
          )}
        </button>
      </div>
    </div>
  );
}

// ── Modal Shell ──────────────────────────────────────────────────────────────

export function RegisterFormModal({
  tournamentId,
  tournamentName,
  price,
  onSuccess,
}: RegisterFormModalProps) {
  const {
    isRegisterModalOpen,
    closeRegisterModal,
    registerStep,
    nextStep,
    prevStep,
    resetRegistration,
  } = useTournamentState();

  if (!isRegisterModalOpen) return null;

  const handleClose = () => {
    resetRegistration();
    closeRegisterModal();
  };

  return (
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Panel */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#e1e3e1] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e1e3e1] bg-linear-to-r from-[#003d12] to-primary">
          <div>
            <h2 className="text-white font-black text-base">الانضمام للبطولة</h2>
            <p className="text-white/70 text-xs mt-0.5 truncate max-w-60">
              {tournamentName}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <StepIndicator currentStep={registerStep} />

          {registerStep === 1 && <Step1 onNext={nextStep} />}
          {registerStep === 2 && (
            <Step2 onNext={nextStep} onBack={prevStep} />
          )}
          {registerStep === 3 && (
            <Step3
              tournamentId={tournamentId}
              price={price}
              onBack={prevStep}
              onSuccess={onSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
}