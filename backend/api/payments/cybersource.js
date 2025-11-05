// backend/api/payments/cybersource.js
// CyberSource Payment Gateway Integration
// SECURITY: This file should NEVER be exposed to the frontend
// All API keys and secrets must be stored in environment variables

/**
 * CyberSource Payment Gateway Handler
 * 
 * This module handles all CyberSource payment processing securely on the backend.
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * - CYBERSOURCE_MERCHANT_ID: Your CyberSource merchant ID
 * - CYBERSOURCE_API_KEY: Your CyberSource API key
 * - CYBERSOURCE_SECRET_KEY: Your CyberSource secret key
 * - CYBERSOURCE_ENDPOINT: API endpoint URL (e.g., 'https://ebc2.cybersource.com/ebc2/')
 * - CYBERSOURCE_ENVIRONMENT: 'test' or 'production'
 */

const axios = require('axios');
const crypto = require('crypto');

/**
 * CyberSource Payment Service Class
 */
class CyberSourceService {
    constructor() {
        // Load credentials from environment variables (NEVER hardcode)
        this.merchantId = process.env.CYBERSOURCE_MERCHANT_ID || 'arabcp000865102';
        this.apiKey = process.env.CYBERSOURCE_API_KEY;
        this.secretKey = process.env.CYBERSOURCE_SECRET_KEY;
        
        // Set endpoint based on environment
        const isProduction = process.env.CYBERSOURCE_ENVIRONMENT === 'production';
        this.endpoint = isProduction 
            ? (process.env.CYBERSOURCE_ENDPOINT_PRODUCTION || 'https://api.cybersource.com')
            : (process.env.CYBERSOURCE_ENDPOINT_TEST || 'https://api.test.cybersource.com');
        
        this.environment = process.env.CYBERSOURCE_ENVIRONMENT || 'test';
        
        // Validate required credentials
        if (!this.merchantId || !this.apiKey || !this.secretKey) {
            console.warn('⚠️  CyberSource credentials not fully configured. Payment processing will fail.');
            console.warn('⚠️  Missing:', {
                merchantId: !this.merchantId,
                apiKey: !this.apiKey,
                secretKey: !this.secretKey
            });
        } else {
            console.log('✅ CyberSource service initialized:', {
                merchantId: this.merchantId,
                environment: this.environment,
                endpoint: this.endpoint
            });
        }
    }

    /**
     * Generate authentication signature for CyberSource API
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @param {string} resourcePath - API resource path
     * @param {string} payload - Request payload (JSON string)
     * @param {string} timestamp - Request timestamp
     * @returns {string} - Authentication signature
     */
    generateSignature(method, resourcePath, payload, timestamp) {
        const data = timestamp + this.merchantId + resourcePath + payload;
        const signature = crypto
            .createHmac('sha256', this.secretKey)
            .update(data)
            .digest('base64');
        return signature;
    }

    /**
     * Process Visa payment through CyberSource
     * @param {Object} paymentData - Payment information
     * @param {string} paymentData.amount - Payment amount
     * @param {string} paymentData.currency - Currency code (ILS)
     * @param {Object} paymentData.cardData - Card information
     * @param {string} paymentData.cardData.cardNumber - Card number (digits only)
     * @param {string} paymentData.cardData.expiryMonth - Expiry month (MM)
     * @param {string} paymentData.cardData.expiryYear - Expiry year (YY)
     * @param {string} paymentData.cardData.cvv - CVV code
     * @param {string} paymentData.cardData.cardholderName - Cardholder name
     * @param {string} paymentData.referenceNumber - Internal reference number
     * @param {Object} paymentData.billingAddress - Billing address (optional)
     * @returns {Promise<Object>} - Payment result
     */
    async processPayment(paymentData) {
        try {
            // Validate required fields
            if (!paymentData.amount || !paymentData.cardData) {
                throw new Error('Missing required payment data');
            }

            // Validate card data
            const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = paymentData.cardData;
            if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
                throw new Error('Missing required card information');
            }

            // Generate unique reference number if not provided
            const referenceNumber = paymentData.referenceNumber || 
                `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Construct CyberSource API request
            const requestPayload = {
                clientReferenceInformation: {
                    code: referenceNumber
                },
                processingInformation: {
                    capture: true, // Capture payment immediately
                    commerceIndicator: 'internet'
                },
                paymentInformation: {
                    card: {
                        number: cardNumber,
                        expirationMonth: expiryMonth,
                        expirationYear: `20${expiryYear}`,
                        securityCode: cvv,
                        type: this.detectCardType(cardNumber)
                    }
                },
                orderInformation: {
                    amountDetails: {
                        totalAmount: paymentData.amount.toString(),
                        currency: paymentData.currency || 'ILS'
                    },
                    billTo: {
                        firstName: this.extractFirstName(cardholderName),
                        lastName: this.extractLastName(cardholderName),
                        ...(paymentData.billingAddress || {})
                    }
                }
            };

            // Generate timestamp
            const timestamp = new Date().toISOString();

            // Generate signature
            const resourcePath = '/pts/v2/payments';
            const payloadString = JSON.stringify(requestPayload);
            const signature = this.generateSignature('POST', resourcePath, payloadString, timestamp);

            // Make API request to CyberSource
            const response = await axios.post(
                `${this.endpoint}${resourcePath}`,
                requestPayload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'v-c-merchant-id': this.merchantId,
                        'Date': timestamp,
                        'Host': new URL(this.endpoint).host,
                        'Signature': `keyid="${this.apiKey}", algorithm="HmacSHA256", headers="host date (request-target) v-c-merchant-id", signature="${signature}"`
                    },
                    timeout: 30000 // 30 seconds timeout
                }
            );

            // Process response
            if (response.data && response.data.status === 'AUTHORIZED') {
                return {
                    success: true,
                    transactionId: response.data.id,
                    referenceNumber: referenceNumber,
                    status: 'completed',
                    amount: paymentData.amount,
                    currency: paymentData.currency || 'ILS',
                    gatewayResponse: response.data,
                    message: 'Payment processed successfully'
                };
            } else {
                // Payment declined or failed
                const reason = response.data.message || response.data.reason || 'Payment declined';
                return {
                    success: false,
                    status: 'failed',
                    errorCode: response.data.errorCode || 'DECLINED',
                    errorMessage: reason,
                    gatewayResponse: response.data
                };
            }

        } catch (error) {
            console.error('CyberSource payment error:', error);
            
            // Handle specific error types
            if (error.response) {
                // API returned error response
                return {
                    success: false,
                    status: 'failed',
                    errorCode: error.response.data?.errorCode || 'API_ERROR',
                    errorMessage: error.response.data?.message || error.message,
                    gatewayResponse: error.response.data
                };
            } else if (error.request) {
                // Request made but no response
                return {
                    success: false,
                    status: 'failed',
                    errorCode: 'NETWORK_ERROR',
                    errorMessage: 'No response from payment gateway'
                };
            } else {
                // Error setting up request
                return {
                    success: false,
                    status: 'failed',
                    errorCode: 'REQUEST_ERROR',
                    errorMessage: error.message
                };
            }
        }
    }

    /**
     * Detect card type from card number
     * @param {string} cardNumber - Card number
     * @returns {string} - Card type (001 = Visa, 002 = Mastercard, etc.)
     */
    detectCardType(cardNumber) {
        const firstDigit = cardNumber[0];
        if (firstDigit === '4') return '001'; // Visa
        if (firstDigit === '5') return '002'; // Mastercard
        if (firstDigit === '3') return '003'; // American Express
        return '001'; // Default to Visa
    }

    /**
     * Extract first name from full name
     * @param {string} fullName - Full name
     * @returns {string} - First name
     */
    extractFirstName(fullName) {
        const parts = fullName.trim().split(' ');
        return parts[0] || fullName;
    }

    /**
     * Extract last name from full name
     * @param {string} fullName - Full name
     * @returns {string} - Last name
     */
    extractLastName(fullName) {
        const parts = fullName.trim().split(' ');
        if (parts.length > 1) {
            return parts.slice(1).join(' ');
        }
        return '';
    }

    /**
     * Verify payment status with CyberSource
     * @param {string} transactionId - Transaction ID
     * @returns {Promise<Object>} - Payment status
     */
    async verifyPayment(transactionId) {
        try {
            const resourcePath = `/pts/v2/payments/${transactionId}`;
            const timestamp = new Date().toISOString();
            const signature = this.generateSignature('GET', resourcePath, '', timestamp);

            const response = await axios.get(
                `${this.endpoint}${resourcePath}`,
                {
                    headers: {
                        'v-c-merchant-id': this.merchantId,
                        'Date': timestamp,
                        'Host': new URL(this.endpoint).host,
                        'Signature': `keyid="${this.apiKey}", algorithm="HmacSHA256", headers="host date (request-target) v-c-merchant-id", signature="${signature}"`
                    }
                }
            );

            return {
                success: true,
                transactionId: transactionId,
                status: response.data.status,
                gatewayResponse: response.data
            };
        } catch (error) {
            console.error('CyberSource verification error:', error);
            return {
                success: false,
                errorMessage: error.message
            };
        }
    }
}

// Export singleton instance
module.exports = new CyberSourceService();

/**
 * EXAMPLE USAGE:
 * 
 * const cyberSource = require('./cybersource');
 * 
 * const result = await cyberSource.processPayment({
 *     amount: '100.00',
 *     currency: 'ILS',
 *     cardData: {
 *         cardNumber: '4111111111111111',
 *         expiryMonth: '12',
 *         expiryYear: '25',
 *         cvv: '123',
 *         cardholderName: 'JOHN DOE'
 *     },
 *     referenceNumber: 'PAY-12345'
 * });
 * 
 * if (result.success) {
 *     console.log('Payment successful:', result.transactionId);
 * } else {
 *     console.error('Payment failed:', result.errorMessage);
 * }
 */

