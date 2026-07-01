// ─────────────────────────────────────────────────────────────────────────────
// OwnerTournamentPaymentsPage
// Displays pending tournament payment requests for the authenticated owner.
// Owner can approve or reject each request. Rejection requires a reason.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle,
  Trophy,
  LayoutDashboard,
  CalendarDays,
  Activity,
  FileText,
  Settings,
  LogOut,
  ClipboardList,
  BadgeDollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { tournamentsApi } from '../api/api';
import type { PaymentRequest } from '../types/tournament';
import { PaymentMethod, PaymentRequestStatus } from '../types/tournament';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatEGP(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case PaymentRequestStatus.Pending:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
          بانتظار المراجعة
        </span>
      );
    case PaymentRequestStatus.Approved:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          مُعتمد
        </span>
      );
    case PaymentRequestStatus.Rejected:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
          <XCircle className="w-3 h-3" />
          مرفوض
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {status}
        </span>
      );
  }
}

// ── Reject Reason Dialog ──────────────────────────────────────────────────────

interface RejectDialogProps {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function RejectDialog({ onConfirm, onCancel, isSubmitting }: RejectDialogProps) {
  const [reason, setReason] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const canSubmit = reason.trim().length >= 5;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-red-600 to-red-700 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <XCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-sm">رفض طلب الدفع</h3>
              <p className="text-red-100 text-[11px]">يجب تقديم سبب واضح</p>
            </div>
          </div>
        </div>
        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              سبب الرفض <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={inputRef}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: إيصال الدفع غير واضح أو المبلغ غير مطابق..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none transition-all"
            />
            {reason.length > 0 && reason.trim().length < 5 && (
              <p className="text-[11px] text-red-500">السبب يجب أن يكون 5 أحرف على الأقل</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 h-10 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              onClick={() => onConfirm(reason.trim())}
              disabled={!canSubmit || isSubmitting}
              className="flex-1 h-10 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  تأكيد الرفض
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Payment Request Row ───────────────────────────────────────────────────────

interface PaymentRowProps {
  request: PaymentRequest;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  actionLoadingId: number | null;
}

function PaymentRow({ request, onApprove, onReject, actionLoadingId }: PaymentRowProps) {
  const isLoading = actionLoadingId === request.id;
  const isPending = request.status === PaymentRequestStatus.Pending;

  return (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
      {/* Team */}
      <td className="px-5 py-4">
        <div className="font-bold text-sm text-primary">{request.teamName}</div>
        {request.tournamentName && (
          <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-45">
            {request.tournamentName}
          </div>
        )}
      </td>

      {/* Captain */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#e8f5e9] flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
            {request.captainName.charAt(0)}
          </div>
          <span className="text-sm font-semibold text-slate-800">{request.captainName}</span>
        </div>
      </td>

      {/* Amount */}
      <td className="px-5 py-4">
        <span className="text-sm font-black text-slate-900">{formatEGP(request.amountDue)}</span>
      </td>

      {/* Payment Method */}
      <td className="px-5 py-4">
        <div className="space-y-1.5">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              request.paymentMethod === PaymentMethod.VodafoneCash
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            {request.paymentMethod === PaymentMethod.VodafoneCash ? '📱' : '💳'}{' '}
            {request.paymentMethod}
          </span>
          {/* Show proof link for VodafoneCash */}
          {request.paymentMethod === PaymentMethod.VodafoneCash &&
            request.paymentProofUrl && (
              <a
                href={request.paymentProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
                عرض الإيصال
              </a>
            )}
        </div>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <StatusBadge status={request.status} />
      </td>

      {/* Date */}
      <td className="px-5 py-4 text-[11px] text-slate-500 whitespace-nowrap">
        {formatDate(request.createdAt)}
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        {isPending ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onApprove(request.id)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              اعتماد الدفعة
            </button>
            <button
              onClick={() => onReject(request.id)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              رفض الدفع
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">لا إجراءات</span>
        )}
      </td>
    </tr>
  );
}

// ── Skeleton Row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 animate-pulse">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-slate-100 rounded-lg" style={{ width: `${60 + (i % 3) * 20}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ── Owner Sidebar (shared layout pattern) ─────────────────────────────────────

function OwnerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'لوحة البيانات', icon: LayoutDashboard, path: '/owner/dashboard' },
    { name: 'إدارة ملاعبي', icon: Activity, path: '/owner/fields' },
    { name: 'طلبات الحجز', icon: CalendarDays, path: '/owner/bookings' },
    { name: 'البطولات', icon: Trophy, path: '/owner/tournaments' },
    { name: 'مدفوعات البطولات', icon: BadgeDollarSign, path: '/owner/tournaments/payments' },
    { name: 'التقارير', icon: FileText, path: '/owner/reports' },
    { name: 'الإعدادات', icon: Settings, path: '/owner/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span className="text-indigo-400">Hagzaya</span> Owner
        </h2>
      </div>
      <nav className="flex-1 p-4 space-y-1 mt-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => {
            localStorage.removeItem('hagzaya_token');
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-semibold transition-all text-sm"
        >
          <LogOut size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function OwnerTournamentPaymentsPage() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Reject dialog state
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tournamentsApi.getPaymentRequests();
      const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
      setRequests(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تحميل طلبات الدفع');
      // Fallback to mock data for development
      setRequests(MOCK_PAYMENT_REQUESTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ── Approve handler ──────────────────────────────────────────────────────
  const handleApprove = async (id: number) => {
    setActionLoadingId(id);
    try {
      await tournamentsApi.approvePayment(id);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: PaymentRequestStatus.Approved } : r
        )
      );
      toast.success('تم اعتماد الدفعة بنجاح ✅');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل اعتماد الدفعة');
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Reject handler ───────────────────────────────────────────────────────
  const handleRejectConfirm = async (reason: string) => {
    if (rejectTargetId === null) return;
    setIsRejecting(true);
    try {
      await tournamentsApi.rejectPayment(rejectTargetId, reason);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === rejectTargetId ? { ...r, status: PaymentRequestStatus.Rejected } : r
        )
      );
      toast.success('تم رفض الدفعة وإبلاغ الفريق');
      setRejectTargetId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل رفض الدفعة');
    } finally {
      setIsRejecting(false);
    }
  };

  // ── Filter logic ─────────────────────────────────────────────────────────
  const filtered = requests.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status.toLowerCase() === statusFilter;
  });

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const pending = requests.filter((r) => r.status === PaymentRequestStatus.Pending);
  const approved = requests.filter((r) => r.status === PaymentRequestStatus.Approved);
  const totalRevenue = approved.reduce((s, r) => s + r.amountDue, 0);

  const kpis = [
    {
      label: 'إجمالي الطلبات',
      value: requests.length,
      icon: <ClipboardList className="w-5 h-5" />,
      color: 'bg-slate-50 text-slate-600',
    },
    {
      label: 'بانتظار المراجعة',
      value: pending.length,
      icon: <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'تم الاعتماد',
      value: approved.length,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'الإيرادات المحصّلة',
      value: formatEGP(totalRevenue),
      icon: <BadgeDollarSign className="w-5 h-5" />,
      color: 'bg-indigo-50 text-indigo-700',
    },
  ];

  const STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'الكل' },
    { value: 'pending', label: 'بانتظار المراجعة' },
    { value: 'approved', label: 'معتمد' },
    { value: 'rejected', label: 'مرفوض' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex" dir="rtl">
      {/* Sidebar */}
      <OwnerSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Page Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <BadgeDollarSign className="w-6 h-6 text-indigo-600" />
                مدفوعات البطولات
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                راجع واعتمد أو ارفض طلبات تسجيل الفرق في بطولاتك
              </p>
            </div>
            <button
              onClick={fetchRequests}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث
            </button>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                  {kpi.icon}
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900">{kpi.value}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">⚠️ {error}</p>
                <p className="text-xs text-amber-600 mt-0.5">يتم عرض بيانات تجريبية</p>
              </div>
            </div>
          )}

          {/* Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Toolbar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-900">
                طلبات الدفع ({filtered.length})
              </h2>
              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5">
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all ${
                      statusFilter === opt.value
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <table className="w-full text-right">
                <tbody>
                  {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                  <ClipboardList className="w-7 h-7 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">لا توجد طلبات</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {statusFilter === 'all'
                      ? 'لم يتم استلام أي طلبات دفع حتى الآن'
                      : `لا توجد طلبات بحالة "${STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label}"`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs font-medium text-slate-700 whitespace-nowrap">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5 text-right">الفريق / البطولة</th>
                      <th className="px-5 py-3.5 text-right">قائد الفريق</th>
                      <th className="px-5 py-3.5 text-right">المبلغ المطلوب</th>
                      <th className="px-5 py-3.5 text-right">طريقة الدفع</th>
                      <th className="px-5 py-3.5 text-right">الحالة</th>
                      <th className="px-5 py-3.5 text-right">تاريخ الطلب</th>
                      <th className="px-5 py-3.5 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((request) => (
                      <PaymentRow
                        key={request.id}
                        request={request}
                        onApprove={handleApprove}
                        onReject={(id) => setRejectTargetId(id)}
                        actionLoadingId={actionLoadingId}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reject Dialog Overlay */}
      {rejectTargetId !== null && (
        <RejectDialog
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTargetId(null)}
          isSubmitting={isRejecting}
        />
      )}
    </div>
  );
}

// ── Mock Data (fallback when API is unavailable) ───────────────────────────────

const MOCK_PAYMENT_REQUESTS: PaymentRequest[] = [
  {
    id: 1,
    tournamentId: '1',
    tournamentName: 'October Weekend League',
    teamName: 'النسور الذهبية',
    captainName: 'محمد أحمد',
    amountDue: 500,
    paymentMethod: PaymentMethod.VodafoneCash,
    paymentProofUrl: 'https://via.placeholder.com/400x600?text=Payment+Receipt',
    status: PaymentRequestStatus.Pending,
    createdAt: '2026-07-01T10:30:00Z',
  },
  {
    id: 2,
    tournamentId: '1',
    tournamentName: 'October Weekend League',
    teamName: 'الأسود السود',
    captainName: 'خالد محمود',
    amountDue: 500,
    paymentMethod: PaymentMethod.InstaPay,
    status: PaymentRequestStatus.Pending,
    createdAt: '2026-07-01T11:15:00Z',
  },
  {
    id: 3,
    tournamentId: '2',
    tournamentName: 'Hagzaya Summer Cup',
    teamName: 'نجوم الغد',
    captainName: 'عمر إبراهيم',
    amountDue: 300,
    paymentMethod: PaymentMethod.VodafoneCash,
    paymentProofUrl: 'https://via.placeholder.com/400x600?text=Receipt+2',
    status: PaymentRequestStatus.Approved,
    createdAt: '2026-06-28T09:00:00Z',
  },
  {
    id: 4,
    tournamentId: '2',
    tournamentName: 'Hagzaya Summer Cup',
    teamName: 'الصقور البيضاء',
    captainName: 'أحمد سالم',
    amountDue: 300,
    paymentMethod: PaymentMethod.InstaPay,
    status: PaymentRequestStatus.Rejected,
    createdAt: '2026-06-27T16:45:00Z',
  },
];