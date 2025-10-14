// services/paymentService.ts - Updated Palestinian Credit Card + PayPal Integration
import { supabase } from '../lib/supabase';

export interface PaymentData {
    appointmentId: string;
    patientId: string;
    clinicId: string;
    doctorId: string;
    amount: number;
    currency: string;
    paymentMethod: 'cash';
    description: string;
    // Additional appointment data for payment booking
    clinicName?: string;
    doctorName?: string;
    specialty?: string;
    appointmentDay?: string;
    appointmentTime?: string;
}

class PalestinianPaymentService {
    private baseUrl: string;

    constructor() {
        // Use your actual domain
        this.baseUrl = import.meta.env.VITE_API_URL || 'https://bethlehemmedcenter.com/api';
    }

    // Credit card functionality removed for cash-only mode

    // Record payment in database
    // Fix recordPayment function:
    async recordPayment(paymentRecord: {
        appointmentId: string;
        paymentMethod: string;
        amount: number;
        currency: string;
        status: 'pending' | 'completed' | 'failed';
        transactionId?: string;
        gatewayResponse?: object;
    }): Promise<Record<string, unknown>> {
        try {
            const { data, error } = await supabase
                .from('payment_transactions')
                .insert([{
                    payment_booking_id: paymentRecord.appointmentId, // ✅ CORRECT
                    payment_method: paymentRecord.paymentMethod,
                    amount: paymentRecord.amount,
                    currency: paymentRecord.currency,
                    transaction_status: paymentRecord.status, // ✅ CORRECT
                    transaction_id: paymentRecord.transactionId,
                    gateway_response: paymentRecord.gatewayResponse,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            return data as Record<string, unknown>;
        } catch (error) {
            console.error('Failed to record payment:', error);
            throw error;
        }
    }

    // Fix recordPaymentAttempt function:
    async recordPaymentAttempt(attemptRecord: {
        appointmentId: string;
        paymentMethod: string;
        amount: number;
        status: string;
        errorMessage?: string;
    }): Promise<void> {
        try {
            await supabase
                .from('payment_logs')
                .insert([{
                    payment_booking_id: attemptRecord.appointmentId, // ✅ CORRECT
                    payment_method: attemptRecord.paymentMethod,
                    amount: attemptRecord.amount,
                    log_status: attemptRecord.status, // ✅ CORRECT
                    error_message: attemptRecord.errorMessage,
                    created_at: new Date().toISOString(),
                }]);
        } catch (error) {
            console.error('Failed to record payment attempt:', error);
        }
    }

    // Update appointment payment status
    async updateAppointmentPaymentStatus(appointmentId: string, status: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('payment_bookings')
                .update({
                    payment_status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', appointmentId);

            if (error) throw error;
        } catch (error) {
            console.error('Failed to update appointment payment status:', error);
            throw error;
        }
    }

    // Validate payment amount (security check)
    async validatePaymentAmount(appointmentId: string, expectedAmount: number): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('payment_bookings')
                .select(`
                    price,
                    doctor:doctors(price)
                `)
                .eq('id', appointmentId)
                .single();

            if (error) throw error;

            const actualAmount = data.price || (Array.isArray(data.doctor) && data.doctor.length > 0 ? data.doctor[0].price : 0) || 0;
            return Math.abs(actualAmount - expectedAmount) < 0.01;
        } catch (error) {
            console.error('Failed to validate payment amount:', error);
            return false;
        }
    }

    // Process cash payment
    async processCashPayment(paymentData: PaymentData): Promise<{ success: boolean; paymentMethod: 'cash'; status: 'pending' }> {
        try {
            // The payment booking record is already created in Payment.tsx
            // We just need to update the existing record or create a transaction record
            return { success: true, paymentMethod: 'cash', status: 'pending' };
        } catch (error) {
            console.error('Cash payment processing failed:', error);
            throw error;
        }
    }

    // Format amount for display (with currency symbol)
    formatAmount(amount: number, currency: string = 'ILS'): string {
        if (currency === 'ILS') {
            return `₪${amount.toFixed(2)}`;
        } else if (currency === 'USD') {
            return `$${amount.toFixed(2)}`;
        }
        return `${amount.toFixed(2)} ${currency}`;
    }
}

export const palestinianPaymentService = new PalestinianPaymentService();