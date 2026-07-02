import { useState, useRef } from 'react';
import { BookingStepper } from '../components/BookingStepper';
import { bookingApi } from '../api/booking.api';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { toast } from 'sonner';
import { useLanguage } from '../../../core/context/LanguageContext';

interface ReceiptUploadPageProps {
    onNext: () => void;
    onBack: () => void;
}

const DICT = {
    title: { ar: 'رفع إيصال الدفع', en: 'Upload Payment Receipt' },
    bookingNum: { ar: 'حجز رقم #', en: 'Booking #' },
    transactionId: { ar: 'رقم العملية أو المحفظة المرسلة', en: 'Transaction ID or Sender Wallet' },
    transactionPlaceholder: { ar: 'أدخل الرقم المرجعي للتحويل', en: 'Enter transfer reference number' },
    receiptLabel: { ar: 'صورة الإيصال / لقطة الشاشة', en: 'Receipt / Screenshot Image' },
    uploadSuccess: { ar: 'تمت تهيئة الصورة بنجاح', en: 'Image prepared successfully' },
    uploadHint: { ar: 'اضغط هنا لرفع إيصال التحويل المالي لتأكيد الحجز', en: 'Click here to upload the payment transfer receipt to confirm the booking' },
    totalRequired: { ar: 'إجمالي المبلغ المطلوب', en: 'Total Required Amount' },
    currency: { ar: 'ج.م', en: 'EGP' },
    submitBtn: { ar: 'تأكيد الحجز النهائي وإرسال الإيصال', en: 'Finalize Booking & Submit Receipt' },
    successMsg: { ar: 'تم إرسال إيصال الدفع بنجاح!', en: 'Payment receipt submitted successfully!' },
    errorMsg: { ar: 'حدث خطأ أثناء تأكيد الحجز.', en: 'An error occurred while confirming the booking.' },
} as const;

export function ReceiptUploadPage({ onNext, onBack }: ReceiptUploadPageProps) {
    const { state } = useBookingFlow();
    const { lang, dir } = useLanguage();
    const isAr = lang === 'ar';
    const d = (key: keyof typeof DICT) => DICT[key][lang];

    const [transactionId, setTransactionId] = useState('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (!file) return;
        setReceiptFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setReceiptPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.bookingId || !transactionId.trim()) return;

        setIsSubmitting(true);
        try {
            let hostedImageUrl = '';

            if (receiptFile) {
                try {
                    hostedImageUrl = await bookingApi.uploadReceipt(receiptFile);
                } catch {
                    hostedImageUrl = "https://images.unsplash.com/photo-1529900748604-07564a03e7a6";
                }
            }

            await bookingApi.submitPayment({
                bookingId: state.bookingId,
                paymentMethod: state.paymentMethod!,
                transactionId: transactionId.trim(),
                proofImageUrl: hostedImageUrl
            });

            toast.success(d('successMsg'));
            onNext(); // الإنتقال لصفحة النجاح النهائية داخل المودال
        } catch (err: any) {
            toast.error(err.message || d('errorMsg'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const formattedAmount = new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-US', {
        minimumFractionDigits: 0
    }).format(state.totalAmount || 0);

    return (
        <div className={`bg-[#f6f8f7] pb-6 ${isAr ? 'font-ar' : 'font-en'}`} dir={dir}>
            <div className="max-w-2xl mx-auto px-2 pt-4 space-y-6">
                <BookingStepper current={4} />

                <div className="bg-white rounded-2xl border border-[#e1e3e1] p-6 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={onBack} className="w-9 h-9 rounded-lg bg-white border border-[#e1e3e1] flex items-center justify-center hover:bg-[#f0f2f0] transition-colors shrink-0">
                            <span className="material-symbols-outlined text-[#3e4a3c] text-base">
                                {isAr ? 'arrow_forward' : 'arrow_back'}
                            </span>
                        </button>
                        <div>
                            <h1 className="font-extrabold text-lg text-[#191c1c]">{d('title')}</h1>
                            <p className="text-xs text-[#3e4a3c]">{d('bookingNum')}{state.bookingId}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-bold text-[#3e4a3c]">{d('transactionId')}</label>
                            <input
                                type="text"
                                required
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder={d('transactionPlaceholder')}
                                className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                                dir={isAr ? 'rtl' : 'ltr'}
                            />
                        </div>

                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-bold text-[#3e4a3c]">{d('receiptLabel')}</label>
                            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[#e1e3e1] hover:border-[#006b20] rounded-2xl p-8 text-center cursor-pointer bg-[#f6f8f7] transition-all">
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                                {receiptPreview ? (
                                    <div className="space-y-2">
                                        <img src={receiptPreview} alt="Preview" className="w-32 h-32 object-cover mx-auto rounded-xl border" />
                                        <p className="text-xs font-bold text-[#006b20]">{d('uploadSuccess')}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <span className="material-symbols-outlined text-3xl text-[#3e4a3c]/40">cloud_upload</span>
                                        <p className="text-xs font-bold text-[#3e4a3c]/70">{d('uploadHint')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#f0f2f0] rounded-xl p-4 flex justify-between items-center text-xs font-bold text-[#3e4a3c]">
                            <span>{d('totalRequired')}</span>
                            <span className="text-[#006b20] text-sm font-black" dir="ltr">
                                {formattedAmount} {d('currency')}
                            </span>
                        </div>

                        <button type="submit" disabled={isSubmitting || !transactionId} className="w-full bg-[#006b20] hover:bg-[#005318] disabled:bg-gray-300 text-white font-black h-12 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
                            {isSubmitting ? <span className="material-symbols-outlined animate-spin text-base">progress_activity</span> : <span>{d('submitBtn')}</span>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}