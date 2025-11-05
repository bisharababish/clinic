// backend/api/payments/process-visa.js
// Secure API endpoint for processing Visa payments
// This endpoint should be protected and only accessible from your frontend

const cyberSource = require('./cybersource');
const { supabase } = require('../../lib/supabase'); // Adjust path as needed

/**
 * Process Visa Payment API Endpoint
 * 
 * SECURITY REQUIREMENTS:
 * 1. This endpoint must require authentication
 * 2. Validate all input data
 * 3. Never log card numbers
 * 4. Use HTTPS only
 * 5. Rate limit requests
 * 
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
async function processVisaPayment(req, res) {
    try {
        // 1. Validate authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // 2. Validate request body
        const { 
            amount, 
            currency, 
            cardData, 
            bookingId, 
            serviceRequestId,
            patientId,
            patientEmail 
        } = req.body;

        if (!amount || !cardData || !patientId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // 3. Validate amount (must be positive)
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount'
            });
        }

        // 4. Process payment with CyberSource
        const paymentResult = await cyberSource.processPayment({
            amount: amountNum.toFixed(2),
            currency: currency || 'ILS',
            cardData: cardData,
            referenceNumber: bookingId || serviceRequestId || `PAY-${Date.now()}`,
            billingAddress: {
                // Add billing address if available
            }
        });

        // 5. Update database based on payment result
        if (paymentResult.success) {
            // Update payment_booking or service_request
            if (bookingId) {
                await supabase
                    .from('payment_bookings')
                    .update({
                        payment_status: 'paid',
                        payment_method: 'visa',
                        gateway_transaction_id: paymentResult.transactionId,
                        gateway_name: 'cybersource',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', bookingId);

                // Create payment transaction record
                await supabase
                    .from('payment_transactions')
                    .insert({
                        payment_booking_id: bookingId,
                        payment_method: 'visa',
                        amount: amountNum,
                        currency: currency || 'ILS',
                        transaction_status: 'completed',
                        transaction_id: paymentResult.transactionId,
                        gateway_transaction_id: paymentResult.transactionId,
                        gateway_name: 'cybersource',
                        gateway_response: paymentResult.gatewayResponse
                    });
            }

            if (serviceRequestId) {
                await supabase
                    .from('service_requests')
                    .update({
                        payment_status: 'paid',
                        payment_method: 'visa',
                        gateway_transaction_id: paymentResult.transactionId,
                        gateway_name: 'cybersource',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', serviceRequestId);

                // Create payment transaction record
                await supabase
                    .from('payment_transactions')
                    .insert({
                        payment_booking_id: serviceRequestId.toString(),
                        payment_method: 'visa',
                        amount: amountNum,
                        currency: currency || 'ILS',
                        transaction_status: 'completed',
                        transaction_id: paymentResult.transactionId,
                        gateway_transaction_id: paymentResult.transactionId,
                        gateway_name: 'cybersource',
                        gateway_response: paymentResult.gatewayResponse
                    });
            }

            // 6. Send success response (NEVER include card data in response)
            return res.status(200).json({
                success: true,
                transactionId: paymentResult.transactionId,
                amount: amountNum,
                currency: currency || 'ILS',
                status: 'completed',
                message: 'Payment processed successfully'
            });

        } else {
            // Payment failed - log error (without card data)
            console.error('Payment failed:', {
                errorCode: paymentResult.errorCode,
                errorMessage: paymentResult.errorMessage,
                bookingId,
                serviceRequestId,
                amount: amountNum
            });

            // Return error response
            return res.status(400).json({
                success: false,
                errorCode: paymentResult.errorCode,
                errorMessage: paymentResult.errorMessage || 'Payment processing failed'
            });
        }

    } catch (error) {
        console.error('Visa payment processing error:', error);
        
        // Return generic error (don't expose internal details)
        return res.status(500).json({
            success: false,
            error: 'Internal server error. Please try again later.'
        });
    }
}

module.exports = processVisaPayment;

