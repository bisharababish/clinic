// services/paymentService.ts - Updated Palestinian Credit Card + PayPal Integration
import { supabase } from '../lib/supabase';

export interface PaymentData {
    appointmentId: string;
    patientId: string;
    clinicId: string;
    doctorId: string;
    amount: number;
    currency: string;
    paymentMethod: 'credit_card' | 'cash';
    description: string;
}

export interface CreditCardData {
    cardNumber: string;
    cardName: string;
    expiry: string;
    cvv: string;
    amount: number;
    currency: string;
}

class PalestinianPaymentService {
    private baseUrl: string;

    constructor() {
        // Use your actual domain
        this.baseUrl = import.meta.env.VITE_API_URL || 'https://bethlehemmedcenter.com/api';
    }

    // Process Palestinian Credit Card Payment
    async processCreditCardPayment(paymentData: PaymentData, cardData: CreditCardData): Promise<Record<string, unknown>> {
        try {
            // Validate card data before sending
            if (!this.validateCreditCard(cardData)) {
                throw new Error('Invalid credit card information');
            }

            // Get current user session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(`${this.baseUrl}/payments/credit-card/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'X-Client-Info': 'bethlehem-med-center'
                },
                body: JSON.stringify({
                    paymentData: {
                        ...paymentData,
                        currency: paymentData.currency || 'ILS' // Default to Israeli Shekel
                    },
                    cardData: {
                        ...cardData,
                        cardNumber: cardData.cardNumber.replace(/\s/g, ''), // Clean card number
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Credit card payment failed');
            }

            const result = await response.json();

            // Record successful payment in database
            if (result.success) {
                await this.recordPayment({
                    appointmentId: paymentData.appointmentId,
                    paymentMethod: 'credit_card',
                    amount: paymentData.amount,
                    currency: paymentData.currency,
                    status: 'completed',
                    transactionId: result.transactionId,
                    gatewayResponse: result,
                });

                await this.updateAppointmentPaymentStatus(paymentData.appointmentId, 'paid');
            }

            return result;
        } catch (error) {
            console.error('Credit card payment failed:', error);

            // Record failed payment attempt
            await this.recordPaymentAttempt({
                appointmentId: paymentData.appointmentId,
                paymentMethod: 'credit_card',
                amount: paymentData.amount,
                status: 'failed',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            });

            throw error;
        }
    }

    // Enhanced Credit Card Validation for Palestinian/Middle Eastern cards
    private validateCreditCard(cardData: CreditCardData): boolean {
        // Remove spaces and validate card number
        const cleanCardNumber = cardData.cardNumber.replace(/\s/g, '');

        // Basic validation rules
        if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
            return false;
        }

        // Check if it's all numbers
        if (!/^\d+$/.test(cleanCardNumber)) {
            return false;
        }

        // Luhn algorithm validation
        if (!this.luhnCheck(cleanCardNumber)) {
            return false;
        }

        // Validate expiry date
        if (!this.validateExpiryDate(cardData.expiry)) {
            return false;
        }

        // Validate CVV
        if (!cardData.cvv || cardData.cvv.length < 3 || cardData.cvv.length > 4) {
            return false;
        }

        // Validate cardholder name (support Arabic names)
        if (!cardData.cardName || cardData.cardName.trim().length < 2) {
            return false;
        }

        // Additional validation for amount
        if (!cardData.amount || cardData.amount <= 0) {
            return false;
        }

        return true;
    }

    // Luhn algorithm for card validation
    private luhnCheck(cardNumber: string): boolean {
        let sum = 0;
        let isEven = false;

        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i), 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    // Validate expiry date (MM/YY format)
    private validateExpiryDate(expiry: string): boolean {
        const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!regex.test(expiry)) {
            return false;
        }

        const [month, year] = expiry.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        const cardYear = parseInt(year, 10);
        const cardMonth = parseInt(month, 10);

        if (cardYear < currentYear) {
            return false;
        }

        if (cardYear === currentYear && cardMonth < currentMonth) {
            return false;
        }

        return true;
    }

    // Get card type from number (including regional cards)
    getCardType(cardNumber: string): string {
        const cleanNumber = cardNumber.replace(/\s/g, '');

        if (cleanNumber.match(/^4/)) return 'Visa';
        if (cleanNumber.match(/^5[1-5]/)) return 'Mastercard';
        if (cleanNumber.match(/^2[2-7]/)) return 'Mastercard'; // New Mastercard range
        if (cleanNumber.match(/^3[47]/)) return 'American Express';
        if (cleanNumber.match(/^6(?:011|5)/)) return 'Discover';
        if (cleanNumber.match(/^35/)) return 'JCB';
        if (cleanNumber.match(/^30[0-5]/)) return 'Diners Club';

        return 'Unknown';
    }

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
            await this.recordPayment({
                appointmentId: paymentData.appointmentId,
                paymentMethod: 'cash',
                amount: paymentData.amount,
                currency: paymentData.currency,
                status: 'pending',
            });

            await this.updateAppointmentPaymentStatus(paymentData.appointmentId, 'pending');

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