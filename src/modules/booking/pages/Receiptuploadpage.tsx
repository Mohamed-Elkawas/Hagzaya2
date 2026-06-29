import { useState, useRef } from 'react';
import { BookingStepper } from '../components/BookingStepper';
import { bookingApi } from '../api/booking.api';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { toast } from 'sonner';

interface ReceiptUploadPageProps {
    onNext: () => void;
    onBack: () => void;
}

export function ReceiptUploadPage({ onNext, onBack }: ReceiptUploadPageProps) {
    const { state } = useBookingFlow();

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

            toast.success('تم إرسال إيصال الدفع بنجاح!');
            onNext(); // الإنتقال لصفحة النجاح النهائية داخل المودال
        } catch (err: any) {
            toast.error(err.message || 'حدث خطأ أثناء تأكيد الحجز.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#f6f8f7] pb-6 font-ar" dir="rtl">
            <div className="max-w-2xl mx-auto px-2 pt-4 space-y-6">
                <BookingStepper current={4} />

                <div className="bg-white rounded-2xl border border-[#e1e3e1] p-6 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={onBack} className="w-9 h-9 rounded-lg bg-white border border-[#e1e3e1] flex items-center justify-center hover:bg-[#f0f2f0] transition-colors shrink-0">
                            <span className="material-symbols-outlined text-[#3e4a3c] text-base">arrow_forward</span>
                        </button>
                        <div>
                            <h1 className="font-extrabold text-lg text-[#191c1c]">رفع إيصال الدفع</h1>
                            <p className="text-xs text-[#3e4a3c]">حجز رقم #{state.bookingId}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-bold text-[#3e4a3c]">رقم العملية أو المحفظة المرسلة (Transaction ID)</label>
                            <input
                                type="text"
                                required
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="أدخل الرقم المرجعي للتحويل"
                                className="w-full text-xs font-semibold px-4 h-12 border border-[#e1e3e1] rounded-xl focus:outline-none focus:border-[#006b20]"
                            />
                        </div>

                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-bold text-[#3e4a3c]">صورة الإيصال / لقطة الشاشة</label>
                            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[#e1e3e1] hover:border-[#006b20] rounded-2xl p-8 text-center cursor-pointer bg-[#f6f8f7] transition-all">
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                                {receiptPreview ? (
                                    <div className="space-y-2">
                                        <img src={receiptPreview} alt="Preview" className="w-32 h-32 object-cover mx-auto rounded-xl border" />
                                        <p className="text-xs font-bold text-[#006b20]">تمت تهيئة الصورة بنجاح</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <span className="material-symbols-outlined text-3xl text-[#3e4a3c]/40">cloud_upload</span>
                                        <p className="text-xs font-bold text-[#3e4a3c]/70">اضغط هنا لرفع إيصال التحويل المالي لتأكيد الحجز</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#f0f2f0] rounded-xl p-4 flex justify-between items-center text-xs font-bold text-[#3e4a3c]">
                            <span>إجمالي المبلغ المطلوب</span>
                            <span className="text-[#006b20] text-sm font-black">EGP {state.totalAmount}</span>
                        </div>

                        <button type="submit" disabled={isSubmitting || !transactionId} className="w-full bg-[#006b20] hover:bg-[#005318] disabled:bg-gray-300 text-white font-black h-12 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
                            {isSubmitting ? <span className="material-symbols-outlined animate-spin text-base">progress_activity</span> : <span>تأكيد الحجز النهائي وإرسال الإيصال</span>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}