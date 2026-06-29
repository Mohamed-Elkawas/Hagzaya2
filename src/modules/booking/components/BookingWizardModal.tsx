import { useState, useEffect } from 'react';
import { DateSelectionPage } from '../pages/Dateselectionpage';
import { TimeSlotsPage } from '../pages/Timeslotspage';
import { PaymentMethodsPage } from '../pages/Paymentmethodspage';
import { ReceiptUploadPage } from '../pages/Receiptuploadpage';
import { BookingSuccessPage } from '../pages/Bookingsuccesspage';
import { BookingProvider, useBookingFlow } from '../hooks/useBookingFlow';

interface BookingWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** The field ID to book — passed straight through to the step pages */
    fieldId: number;
}

// ── WizardShell ────────────────────────────────────────────────────────────────
// Lives *inside* BookingProvider so it can call clearState() on close.
// Keeps BookingWizardModal itself clean of context coupling.
// ──────────────────────────────────────────────────────────────────────────────
interface WizardShellProps {
    step: number;
    onNext: () => void;
    onBack: () => void;
    onClose: () => void;
    fieldId: number;
}

function WizardShell({ step, onNext, onBack, onClose, fieldId }: WizardShellProps) {
    const { clearState } = useBookingFlow();

    // Clears context state so a fresh modal open always starts blank
    const handleClose = () => {
        clearState();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-ar"
            dir="rtl"
        >
            <div className="bg-[#f6f8f7] w-full max-w-2xl h-[90vh] overflow-y-auto rounded-3xl shadow-xl relative border border-[#e1e3e1]">

                {/* ── Close button ──────────────────────────────────────────────── */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white border border-[#e1e3e1] flex items-center justify-center hover:bg-[#f0f2f0] transition-colors z-10"
                    aria-label="إغلاق"
                >
                    <span className="material-symbols-outlined text-sm text-[#3e4a3c]">close</span>
                </button>

                <div className="p-2">
                    {/* Step 1 — Date selection */}
                    {step === 1 && (
                        <DateSelectionPage onNext={onNext} fieldId={fieldId} />
                    )}

                    {/* Step 2 — Time slot selection + pre-booking API call */}
                    {step === 2 && (
                        <TimeSlotsPage onNext={onNext} onBack={onBack} fieldId={fieldId} />
                    )}

                    {/* Step 3 — Payment method (reads bookingId from context) */}
                    {step === 3 && (
                        <PaymentMethodsPage onNext={onNext} onBack={onBack} />
                    )}

                    {/* Step 4 — Receipt upload + transaction ID */}
                    {step === 4 && (
                        <ReceiptUploadPage onNext={onNext} onBack={onBack} />
                    )}

                    {/* Step 5 — Comprehensive summary & success state */}
                    {step === 5 && (
                        <BookingSuccessPage onClose={handleClose} />
                    )}
                </div>
            </div>
        </div>
    );
}

// ── BookingWizardModal ─────────────────────────────────────────────────────────
export function BookingWizardModal({ isOpen, onClose, fieldId }: BookingWizardModalProps) {
    const [step, setStep] = useState(1);

    // Always reset to step 1 whenever the modal is opened so it never starts
    // mid-flow from a previous session.
    useEffect(() => {
        if (isOpen) setStep(1);
    }, [isOpen]);

    if (!isOpen) return null;

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

    return (
        <BookingProvider>
            <WizardShell
                step={step}
                onNext={nextStep}
                onBack={prevStep}
                onClose={onClose}
                fieldId={fieldId}
            />
        </BookingProvider>
    );
}