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
import { useLanguage } from '../../../core/context/LanguageContext';

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
  const { t } = useLanguage();
  switch (status) {
    case PaymentRequestStatus.Pending:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
          {t('owner.payments.filter.pending')}
        </span>
      );
    case PaymentRequestStatus.Approved:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          {t('owner.payments.filter.approved')}
        </span>
      );
    case PaymentRequestStatus.Rejected:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
          <XCircle className="w-3 h-3" />
          {t('owner.payments.filter.rejected')}
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
  const { t } = useLanguage();
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
              <h3 className="text-white font-black text-sm">{t('owner.payments.reject.title')}</h3>
              <p className="text-red-100 text-[11px]">{t('owner.payments.reject.subtitle')}</p>
            </div>
          </div>
        </div>
        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              {t('owner.payments.reject.reasonLabel')} <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={inputRef}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('owner.payments.reject.placeholder') as string}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none transition-all"
            />
            {reason.length > 0 && reason.trim().length < 5 && (
              <p className="text-[11px] text-red-500">{t('owner.payments.reject.errorLength')}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 h-10 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              {t('owner.payments.reject.cancel')}
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
                  {t('owner.payments.reject.confirm')}
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
  const { t } = useLanguage();
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
                {t('owner.payments.action.viewProof')}
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
              {t('owner.payments.action.approve')}
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
              {t('owner.payments.action.reject')}
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">{t('owner.payments.action.noActions')}</span>
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



// ── Main Page ─────────────────────────────────────────────────────────────────

export function OwnerTournamentPaymentsPage() {
  const { t } = useLanguage();
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
      setError(err instanceof Error ? err.message : t('owner.payments.alert.fetchError'));
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
      toast.success(t('owner.payments.toast.approveSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('owner.payments.toast.approveError'));
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
      toast.success(t('owner.payments.toast.rejectSuccess'));
      setRejectTargetId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('owner.payments.toast.rejectError'));
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
      label: t('owner.payments.kpi.total'),
      value: requests.length,
      icon: <ClipboardList className="w-5 h-5" />,
      color: 'bg-slate-50 text-slate-600',
    },
    {
      label: t('owner.payments.kpi.pending'),
      value: pending.length,
      icon: <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: t('owner.payments.kpi.approved'),
      value: approved.length,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: t('owner.payments.kpi.revenue'),
      value: formatEGP(totalRevenue),
      icon: <BadgeDollarSign className="w-5 h-5" />,
      color: 'bg-indigo-50 text-indigo-700',
    },
  ];

  const STATUS_FILTER_OPTIONS = [
    { value: 'all', label: t('owner.payments.filter.all') },
    { value: 'pending', label: t('owner.payments.filter.pending') },
    { value: 'approved', label: t('owner.payments.filter.approved') },
    { value: 'rejected', label: t('owner.payments.filter.rejected') },
  ] as const;

  return (
    <div className="p-4 md:p-8">
      {/* Page Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6 rounded-2xl mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <BadgeDollarSign className="w-6 h-6 text-indigo-600" />
              {t('owner.payments.title')}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {t('owner.payments.subtitle')}
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            {t('owner.payments.refresh')}
          </button>
        </div>
      </header>

      <div className="space-y-6">
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
              <p className="text-xs text-amber-600 mt-0.5">{t('owner.payments.alert.errorData')}</p>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-black text-slate-900">
              {t('owner.payments.title')} ({filtered.length})
            </h2>
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
                <p className="text-sm font-bold text-slate-700">{t('owner.payments.empty.noRequests')}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {statusFilter === 'all'
                    ? t('owner.payments.empty.all')
                    : `${t('owner.payments.empty.filter')} "${STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label}"`}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs font-medium text-slate-700 whitespace-nowrap">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5 text-right">{t('owner.payments.table.team')}</th>
                    <th className="px-5 py-3.5 text-right">{t('owner.payments.table.captain')}</th>
                    <th className="px-5 py-3.5 text-right">{t('owner.payments.table.amount')}</th>
                    <th className="px-5 py-3.5 text-right">{t('owner.payments.table.method')}</th>
                    <th className="px-5 py-3.5 text-right">{t('owner.payments.table.status')}</th>
                    <th className="px-5 py-3.5 text-right">{t('owner.payments.table.date')}</th>
                    <th className="px-5 py-3.5 text-center">{t('owner.payments.table.actions')}</th>
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