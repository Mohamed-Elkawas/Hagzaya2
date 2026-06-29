import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Slot } from '../types/booking.types';
import type { PaymentMethod } from '../types/Booking.enums';

export interface BookingState {
    fieldId?: number;
    fieldName?: string;
    date?: string;
    slot?: Slot;
    bookingId?: number;
    totalAmount?: number;
    paymentMethod?: PaymentMethod;
}

interface BookingContextType {
    state: BookingState;
    updateState: (updates: Partial<BookingState>) => void;
    clearState: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const SESSION_KEY = 'hagzaya_booking_flow_state';

export function BookingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<BookingState>(() => {
        try {
            const stored = sessionStorage.getItem(SESSION_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    }, [state]);

    const updateState = (updates: Partial<BookingState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    const clearState = () => {
        setState({});
        sessionStorage.removeItem(SESSION_KEY);
    };

    return (
        <BookingContext.Provider value={{ state, updateState, clearState }}>
            {children}
        </BookingContext.Provider>
    );
}

export function useBookingFlow() {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBookingFlow must be used within a BookingProvider');
    }
    return context;
}
