import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  X,
  Search,
  UserPlus,
  UserMinus,
  UserCheck,
  Smartphone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Shield,
  AlertCircle,
  Users,
  Zap,
  ArrowRight,
  ArrowLeft,
  ChevronsLeft,
  ChevronsRight,
  Trophy,
  Upload
} from 'lucide-react';
import { useTournamentState } from '../hooks/useTournamentState';
import { tournamentsApi } from '../api/api';
import type { AvailablePlayer, PlayerProfile, Tournament } from '../types/tournament';
import { PaymentMethod } from '../types/tournament';
import { useLanguage } from '../../../core/context/LanguageContext';

// ── Bilingual Dictionary ───────────────────────────────────────────────────────
const DICT = {
  // Common / Shared
  back: { ar: 'رجوع', en: 'Back' },
  next: { ar: 'التالي', en: 'Next' },
  loading: { ar: 'جاري التحميل...', en: 'Loading...' },
  tourneyNotFound: { ar: 'البطولة غير موجودة', en: 'Tournament not found' },
  backToTourneys: { ar: 'العودة للبطولات', en: 'Back to Tournaments' },
  backToTourney: { ar: 'العودة للبطولة', en: 'Back to Tournament' },
  newTeamReg: { ar: 'تسجيل فريق جديد', en: 'Register New Team' },
  tourneyLabel: { ar: 'بطولة:', en: 'Tournament:' },
  entryFee: { ar: 'رسوم الاشتراك', en: 'Entry Fee' },
  currency: { ar: 'ج.م', en: 'EGP' },

  // Step Indicators
  step1: { ar: 'بيانات الفريق', en: 'Team Info' },
  step2: { ar: 'إضافة الأعضاء', en: 'Add Members' },
  step3: { ar: 'طريقة الدفع', en: 'Payment Method' },

  // Step 1: Team Name
  chooseName: { ar: 'اختر اسماً لفريقك', en: 'Choose a name for your team' },
  chooseNameSub: { ar: 'سيكون هذا الاسم هو الواجهة الخاصة بكم طوال مباريات البطولة.', en: 'This name will represent you throughout the tournament.' },
  teamNameLbl: { ar: 'اسم الفريق', en: 'Team Name' },
  teamNamePlaceholder: { ar: 'مثال: النسور الذهبية...', en: 'e.g. Golden Eagles...' },
  nameErr: { ar: 'الاسم يجب أن يكون حرفين على الأقل', en: 'Name must be at least 2 characters long' },
  continue: { ar: 'متابعة', en: 'Continue' },

  // Step 2: Add Members
  searchPlaceholder: { ar: 'ابحث عن اللاعبين بالاسم أو المعرّف...', en: 'Search players by name or username...' },
  selectedCount: { ar: 'تم اختيار', en: 'Selected' },
  fetchErr: { ar: 'تعذّر تحميل قائمة اللاعبين. حاول مرة أخرى.', en: 'Failed to load players. Try again.' },
  retry: { ar: 'أعد المحاولة', en: 'Retry' },
  noMatch: { ar: 'لا يوجد لاعبون مطابقون لبحثك.', en: 'No players match your search.' },
  noPlayers: { ar: 'لا يوجد لاعبون مسجّلون حتى الآن.', en: 'No registered players yet.' },
  selectedBtn: { ar: 'مختار', en: 'Selected' },
  addBtn: { ar: 'إضافة', en: 'Add' },
  firstPage: { ar: 'الصفحة الأولى', en: 'First Page' },
  lastPage: { ar: 'الصفحة الأخيرة', en: 'Last Page' },
  outOf: { ar: 'من أصل', en: 'out of' },
  pageLbl: { ar: 'صفحة', en: 'page' },
  minMembersErr: { ar: 'يجب اختيار {min} لاعبين على الأقل. لديك حالياً {current}.', en: 'You must select at least {min} players. You currently have {current}.' },

  // Step 3: Payment Method
  confirmPay: { ar: 'تأكيد التسجيل والدفع', en: 'Confirm Registration & Payment' },
  confirmPaySub: { ar: 'أكمل عملية الدفع لتأكيد حجز مقعد فريقك في البطولة.', en: 'Complete payment to confirm your team seat in the tournament.' },
  vodafoneDesc: { ar: 'ادفع عبر Vodafone Cash بسهولة وأمان', en: 'Pay via Vodafone Cash easily and securely' },
  instaPayDesc: { ar: 'ادفع عبر تطبيق InstaPay فورياً', en: 'Pay instantly via InstaPay app' },
  attachReceipt: { ar: 'إرفاق صورة الإيصال أو سكرين شوت للتحويل', en: 'Attach receipt image or transfer screenshot' },
  chooseFile: { ar: 'اختر ملف الصورة أو الإيصال (انقر هنا)', en: 'Choose image file or receipt (Click here)' },
  attached: { ar: 'تم إرفاق:', en: 'Attached:' },
  summaryHead: { ar: 'ملخص التسجيل والفاتورة', en: 'Registration & Invoice Summary' },
  summaryTeamName: { ar: 'اسم الفريق:', en: 'Team Name:' },
  summaryMembers: { ar: 'عدد الأعضاء:', en: 'Member Count:' },
  playersSuffix: { ar: 'لاعبين', en: 'players' },
  totalFees: { ar: 'إجمالي الرسوم المطلوبة:', en: 'Total Required Fees:' },
  missingReceipt: { ar: 'يرجى إرفاق صورة تحويل (إيصال الدفع)', en: 'Please attach a transfer proof (payment receipt)' },
  submitErr: { ar: 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.', en: 'Registration error occurred. Please try again.' },
  confirmAndPay: { ar: 'تأكيد ودفع الرسوم', en: 'Confirm and Pay Fees' },

  // Success
  successTitle: { ar: 'تم تسجيل فريقك بنجاح! 🎉', en: 'Your team is registered successfully! 🎉' },
  successSub: { ar: 'طلب الانضمام للبطولة قيد المراجعة الآن من قبل المنظم. سيتم توجيهك للصفحة الرئيسية قريباً.', en: 'Your join request is now under review by the organizer. You will be redirected soon.' },
} as const;

// Helper to translate backend API tournament names
function getLocalizedName(item: any, lang: 'ar' | 'en'): string {
    if (lang === 'ar' && item?.name_ar) return item.name_ar;
    if (lang === 'en' && item?.name_en) return item.name_en;
    return item?.name || '';
}

// ── Shared Utils ─────────────────────────────────────────────────────────────

function getVisiblePages(currentPage: number, totalPages: number, maxVisible = 5) {
  if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const half = Math.floor(maxVisible / 2);
  let start = currentPage - half;
  let end = currentPage + half;
  if (start < 1) {
    start = 1;
    end = maxVisible;
  }
  if (end > totalPages) {
    end = totalPages;
    start = totalPages - maxVisible + 1;
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// ── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep, lang }: { currentStep: number; lang: 'ar'|'en' }) {
  const d = (key: keyof typeof DICT) => DICT[key][lang];
  const steps = [
    { num: 1, label: d('step1') },
    { num: 2, label: d('step2') },
    { num: 3, label: d('step3') },
  ];
  return (
    <div className={`flex flex-col md:flex-row items-center justify-center gap-4 mb-8 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse md:flex-row'}`}>
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center w-full md:w-auto">
          <div className="flex flex-col items-center gap-2 flex-1 md:flex-none">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black transition-all ${
                step.num < currentStep
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : step.num === currentStep
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xl'
                  : 'bg-white text-slate-400 border-2 border-slate-200'
              }`}
            >
              {step.num < currentStep ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                step.num
              )}
            </div>
            <span
              className={`text-sm font-bold whitespace-nowrap ${
                step.num === currentStep ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`hidden md:block h-1 w-16 lg:w-32 mx-4 mt-[-24px] rounded-full transition-all ${
                step.num < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Team Name ────────────────────────────────────────────────────────

function Step1({ onNext, lang }: { onNext: () => void; lang: 'ar'|'en' }) {
  const { registrationData, setTeamName } = useTournamentState();
  const isValid = registrationData.teamName.trim().length >= 2;
  const isAr = lang === 'ar';
  const d = (key: keyof typeof DICT) => DICT[key][lang];

  return (
    <div className="space-y-6 max-w-lg mx-auto bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">{d('chooseName')}</h3>
        <p className="text-sm text-slate-500">
          {d('chooseNameSub')}
        </p>
      </div>

      <div className="space-y-2 mt-8">
        <label className="text-sm font-bold text-slate-700">
          {d('teamNameLbl')} <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder={d('teamNamePlaceholder')}
            value={registrationData.teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full px-5 h-14 rounded-2xl border-2 border-slate-200 text-lg font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
            dir={isAr ? 'rtl' : 'ltr'}
          />
        </div>
        {registrationData.teamName.length > 0 &&
          registrationData.teamName.length < 2 && (
            <p className="text-xs font-bold text-rose-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {d('nameErr')}
            </p>
          )}
      </div>

      <div className="pt-6">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-black rounded-2xl text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 disabled:shadow-none"
        >
          {d('continue')}
          {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Add Members ──────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 9; // Grid 3x3 works best
const MIN_MEMBERS = 5;

const AVATAR_COLOURS = [
  'from-emerald-500 to-green-700',
  'from-teal-500 to-emerald-700',
  'from-green-600 to-teal-700',
  'from-cyan-500 to-teal-600',
  'from-lime-500 to-green-600',
  'from-sky-500 to-cyan-600',
];
const avatarColour = (id: number) => AVATAR_COLOURS[id % AVATAR_COLOURS.length];

function PlayerSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse">
      <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-100 rounded w-1/3" />
      </div>
      <div className="w-20 h-10 bg-slate-200 rounded-xl shrink-0" />
    </div>
  );
}

function Step2({ onNext, onBack, lang }: { onNext: () => void; onBack: () => void; lang: 'ar'|'en' }) {
  const { registrationData, addMember, removeMember } = useTournamentState();
  const isAr = lang === 'ar';
  const d = (key: keyof typeof DICT) => DICT[key][lang];

  const [allPlayers, setAllPlayers]     = useState<AvailablePlayer[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [fetchError, setFetchError]     = useState<string | null>(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [currentPage, setCurrentPage]  = useState(1);
  const [validationErr, setValidationErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await tournamentsApi.getAllPlayers();
        if (!cancelled) setAllPlayers(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setFetchError(d('fetchErr'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lang]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allPlayers;
    return allPlayers.filter((p) =>
      p.username.toLowerCase().includes(q) ||
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q)
    );
  }, [allPlayers, searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pagePlayers = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isSelected = (id: number) =>
    registrationData.memberIds.some((mid) => mid.toString() === id.toString());

  const handleToggle = (player: AvailablePlayer) => {
    if (isSelected(player.id)) {
      removeMember(player.id);
    } else {
      addMember({
        id: String(player.id),
        username: player.username,
        fullName: `${player.firstName} ${player.lastName}`.trim(),
        position: player.position ?? undefined,
      } satisfies PlayerProfile);
    }
    setValidationErr(null);
  };

  const handleNext = () => {
    if (registrationData.memberIds.length < MIN_MEMBERS) {
      const msg = d('minMembersErr').replace('{min}', String(MIN_MEMBERS)).replace('{current}', String(registrationData.memberIds.length));
      setValidationErr(msg);
      return;
    }
    setValidationErr(null);
    onNext();
  };

  const selectedCount = registrationData.memberIds.length;
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Search & Header Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 pointer-events-none`} />
          <input
            type="text"
            placeholder={d('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 text-base font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all`}
            dir={isAr ? 'rtl' : 'ltr'}
          />
        </div>
        
        <div
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-black transition-all shrink-0 ${
            selectedCount >= MIN_MEMBERS
              ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300 shadow-inner'
              : selectedCount > 0
              ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300 shadow-inner'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Users className="w-5 h-5" />
          {d('selectedCount')} ({selectedCount} / {MIN_MEMBERS})
        </div>
      </div>

      {/* Grid Area */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <PlayerSkeleton key={i} />
            ))}
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-400" />
            <p className="text-lg font-bold text-slate-700">{fetchError}</p>
            <button
              onClick={() => {
                setFetchError(null);
                setIsLoading(true);
                tournamentsApi.getAllPlayers()
                  .then((dData) => setAllPlayers(Array.isArray(dData) ? dData : []))
                  .catch(() => setFetchError(d('fetchErr')))
                  .finally(() => setIsLoading(false));
              }}
              className="mt-2 px-6 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-full hover:bg-emerald-100 transition-colors"
            >
              {d('retry')}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Users className="w-12 h-12 text-slate-300" />
            <p className="text-lg font-bold text-slate-500">
              {searchQuery ? d('noMatch') : d('noPlayers')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagePlayers.map((player) => {
              const selected = isSelected(player.id);
              return (
                <div
                  key={player.id}
                  onClick={() => handleToggle(player)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selected 
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100' 
                        : 'border-slate-100 bg-white hover:border-emerald-200 hover:shadow-md'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColour(player.id)} flex items-center justify-center text-lg font-black text-white shrink-0 shadow-sm ring-2 ${
                      selected ? 'ring-emerald-400' : 'ring-transparent'
                    } transition-all`}
                  >
                    {player.firstName.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-slate-800 truncate">
                      {player.firstName} {player.lastName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-slate-500">@{player.username}</span>
                      {player.position && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                          {player.position}
                        </span>
                      )}
                      {player.currentElo > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          <Zap className="w-3 h-3" />
                          {player.currentElo}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Toggle button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggle(player); }}
                    className={`flex items-center justify-center gap-1.5 w-24 h-10 rounded-xl font-bold transition-all shrink-0 ${
                      selected
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-emerald-700'
                    }`}
                  >
                    {selected ? (
                      <><UserCheck className="w-4 h-4" /> {d('selectedBtn')}</>
                    ) : (
                      <><UserPlus className="w-4 h-4" /> {d('addBtn')}</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Condense Windowed Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className={`flex flex-wrap items-center justify-center gap-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-fit mx-auto ${isAr ? 'flex-row' : 'flex-row-reverse'}`}>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
            title={d('firstPage')}
          >
            {isAr ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
          >
            {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-1 mx-2">
            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                  page === currentPage
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
          >
            {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
            title={d('lastPage')}
          >
            {isAr ? <ChevronsLeft className="w-5 h-5" /> : <ChevronsRight className="w-5 h-5" />}
          </button>
          
          <span className="text-xs font-bold text-slate-400 mx-4">
             {d('outOf')} {totalPages} {d('pageLbl')}
          </span>
        </div>
      )}

      {/* Floating Selected Members Bar (Sticky Bottom) */}
      {registrationData.selectedPlayers.length > 0 && (
        <div className="sticky bottom-4 z-10 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
             {registrationData.selectedPlayers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 bg-slate-800 rounded-full pl-2 pr-3 py-1.5 shrink-0 border border-slate-700"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                    {(p.fullName ?? p.username).charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-200 max-w-[100px] truncate">
                    {p.fullName ?? p.username}
                  </span>
                  <button
                    onClick={() => removeMember(p.id)}
                    className="text-slate-400 hover:text-rose-400 transition-colors mx-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
          
          {validationErr && (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 rounded-xl shrink-0">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span className="text-sm font-bold text-rose-300">{validationErr}</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-4 border-t border-slate-200">
        <button
          onClick={onBack}
          className="flex-1 h-14 bg-white border-2 border-slate-200 text-slate-600 font-black rounded-2xl text-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
        >
          {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {d('back')}
        </button>
        <button
          onClick={handleNext}
          className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200"
        >
          {d('next')}
          {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Payment Method ───────────────────────────────────────────────────

function Step3({
  tournament,
  onBack,
  onSuccess,
  lang,
}: {
  tournament: Tournament;
  onBack: () => void;
  onSuccess?: () => void;
  lang: 'ar' | 'en';
}) {
  const { registrationData, setPaymentMethod, resetRegistration } = useTournamentState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAr = lang === 'ar';
  const d = (key: keyof typeof DICT) => DICT[key][lang];

  const paymentOptions = [
    {
      method: PaymentMethod.VodafoneCash,
      label: 'Vodafone Cash',
      desc: d('vodafoneDesc'),
      icon: <Smartphone className="w-6 h-6 text-red-500" />,
      color: 'border-red-200 bg-red-50/30',
      active: 'border-red-500 bg-red-50 ring-4 ring-red-100',
    },
    {
      method: PaymentMethod.InstaPay,
      label: 'InstaPay',
      desc: d('instaPayDesc'),
      icon: <CreditCard className="w-6 h-6 text-blue-500" />,
      color: 'border-blue-200 bg-blue-50/30',
      active: 'border-blue-500 bg-blue-50 ring-4 ring-blue-100',
    },
  ];

  const handleSubmit = async () => {
    if (!registrationData.paymentMethod) return;
    if (!proofFile) {
        setSubmitError(d('missingReceipt'));
        return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      let paymentProofUrl = '';
      if (proofFile) {
          paymentProofUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(proofFile);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = error => reject(error);
          });
      }

      await tournamentsApi.joinTournament(tournament.id, {
        teamName: registrationData.teamName,
        memberIds: registrationData.memberIds.map((id) => String(Number(id))),
        paymentMethod: registrationData.paymentMethod as PaymentMethod,
        paymentProofUrl: paymentProofUrl || undefined,
      });
      setSubmitted(true);
      setTimeout(() => {
        resetRegistration();
        onSuccess?.();
      }, 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : d('submitErr'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 text-center max-w-lg mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
          <Trophy className="w-12 h-12 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">{d('successTitle')}</h3>
          <p className="text-base font-medium text-slate-500 max-w-sm mx-auto">
            {d('successSub')}
          </p>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-US', { 
    style: 'currency', currency: 'EGP', minimumFractionDigits: 0 
  }).format(tournament.price).replace('EGP', d('currency'));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
         <div className="text-center mb-8">
            <h3 className="text-xl font-black text-slate-800 mb-2">{d('confirmPay')}</h3>
            <p className="text-sm text-slate-500">
            {d('confirmPaySub')}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {paymentOptions.map((opt) => {
            const isSelected = registrationData.paymentMethod === opt.method;
            return (
              <div key={opt.method} className="space-y-4">
                  <button
                    onClick={() => setPaymentMethod(opt.method)}
                    className={`w-full flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                      isSelected ? opt.active : `${opt.color} hover:border-slate-300 hover:bg-slate-50`
                    }`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                      {opt.icon}
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-slate-800">{opt.label}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{opt.desc}</p>
                    </div>
                  </button>
              </div>
            );
          })}
        </div>

        {registrationData.paymentMethod && (
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-black text-slate-800 mb-3">
                    {d('attachReceipt')} <span className="text-rose-500">*</span>
                </label>
                
                {/* ─── CUSTOM FILE INPUT (Task 4 Fix) ─── */}
                <label 
                    htmlFor="proof-upload" 
                    className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-slate-300 border-dashed rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 focus:outline-none"
                >
                    <span className="flex flex-col items-center space-y-2">
                        <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        <span className="font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">
                            {d('chooseFile')}
                        </span>
                    </span>
                    <input 
                        id="proof-upload"
                        type="file" 
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                        className="hidden" // Hides the default HTML "Choose File" button completely
                    />
                </label>

                {proofFile && (
                    <div className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg w-fit">
                        <CheckCircle2 className="w-4 h-4" />
                        {d('attached')} {proofFile.name}
                    </div>
                )}
            </div>
        )}

        <div className="bg-slate-900 rounded-2xl p-6 space-y-4 text-white">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{d('summaryHead')}</p>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300">{d('summaryTeamName')}</span>
            <span className="font-bold text-white text-lg">{registrationData.teamName}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300">{d('summaryMembers')}</span>
            <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded-lg">
              {registrationData.selectedPlayers.length} {d('playersSuffix')}
            </span>
          </div>
          <div className="border-t border-slate-700 pt-4 flex justify-between items-center mt-2">
            <span className="text-slate-300 text-base">{d('totalFees')}</span>
            <span className="font-black text-emerald-400 text-2xl" dir="ltr">
              {formattedPrice}
            </span>
          </div>
        </div>

        {submitError && (
          <div className="mt-6 flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4">
            <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
            <p className="text-sm font-bold text-rose-700">{submitError}</p>
          </div>
        )}

        <div className="flex gap-4 pt-8">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 h-14 bg-white border-2 border-slate-200 text-slate-600 font-black rounded-2xl text-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {d('back')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!registrationData.paymentMethod || !proofFile || isSubmitting}
            className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-black rounded-2xl text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 disabled:shadow-none"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                {d('confirmAndPay')} 
                {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Shell ──────────────────────────────────────────────────────────

export default function TournamentJoinPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { registerStep, nextStep, prevStep, resetRegistration } = useTournamentState();
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const d = (key: keyof typeof DICT) => DICT[key][lang];

  // Reset state on mount
  useEffect(() => {
    resetRegistration();
  }, [resetRegistration]);

  // Fetch tournament details
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    tournamentsApi.getById(id)
      .then(setTournament)
      .catch(() => setError(d('tourneyNotFound')))
      .finally(() => setIsLoading(false));
  }, [id, lang]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className={`min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 ${isAr ? 'font-ar' : 'font-en'}`} dir={isAr ? 'rtl' : 'ltr'}>
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">{error || d('tourneyNotFound')}</h2>
        <button
          onClick={() => navigate('/tournaments')}
          className="mt-4 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
        >
          {d('backToTourneys')}
        </button>
      </div>
    );
  }

  const handleSuccess = () => {
    navigate(`/tournaments/${id}`);
  };

  const formattedPrice = new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-US', { 
    style: 'currency', currency: 'EGP', minimumFractionDigits: 0 
  }).format(tournament.price).replace('EGP', d('currency'));

  return (
    <div className={`min-h-screen bg-slate-50/50 pb-20 ${isAr ? 'font-ar' : 'font-en'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="bg-slate-900 text-white pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <button 
                onClick={() => navigate(`/tournaments/${id}`)}
                className={`flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold mb-4 ${isAr ? 'flex-row' : 'flex-row-reverse w-fit'}`}
            >
                {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />} {d('backToTourney')}
            </button>
            <h1 className="text-3xl md:text-5xl font-black mb-3">{d('newTeamReg')}</h1>
            <p className="text-slate-400 text-lg md:text-xl font-semibold">
              {d('tourneyLabel')} <span className="text-emerald-400">{getLocalizedName(tournament, lang)}</span>
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[200px]">
            <p className="text-slate-300 text-sm font-bold mb-1">{d('entryFee')}</p>
            <p className="text-3xl font-black text-emerald-400" dir="ltr">
               {formattedPrice}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 md:p-10 min-h-[600px]">
            <StepIndicator currentStep={registerStep} lang={lang} />

            <div className="mt-8">
                {registerStep === 1 && <Step1 onNext={nextStep} lang={lang} />}
                {registerStep === 2 && (
                    <Step2 onNext={nextStep} onBack={prevStep} lang={lang} />
                )}
                {registerStep === 3 && (
                    <Step3
                        tournament={tournament}
                        onBack={prevStep}
                        onSuccess={handleSuccess}
                        lang={lang}
                    />
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
