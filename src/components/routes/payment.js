// routes/payments.js - Backend payment routes
const express = require('express');
const router = express.Router();
const paypal = require('@paypal/checkout-server-sdk');
const axios = require('axios');

// PayPal Configuration
const paypalEnvironment = process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);

const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);

// Credit Card Processing Endpoint
router.post('/credit-card/process', async (req, res) => {
    try {
        const { paymentData, cardData } = req.body;

        // Validate required fields
        if (!cardData.cardNumber || !cardData.cardName || !cardData.expiry || !cardData.cvv) {
            return res.status(400).json({
                success: false,
                message: 'Missing required credit card information'
            });
        }

        // For Palestinian market, you can integrate with local payment processors
        // such as:
        // 1. Palestine Payment Gateway (PPG)
        // 2. JoMoPay
        // 3. ProgressSoft Payment Gateway
        // 4. Or international processors that work in Palestine

        // Example integration with a generic payment processor
        const paymentRequest = {
            amount: paymentData.amount,
            currency: paymentData.currency || 'ILS',
            card: {
                number: cardData.cardNumber.replace(/\s/g, ''),
                name: cardData.cardName,
                expiry: cardData.expiry,
                cvv: cardData.cvv
            },
            description: paymentData.description,
            merchant_id: process.env.MERCHANT_ID,
            api_key: process.env.PAYMENT_GATEWAY_API_KEY
        };

        // Replace this with your actual payment processor API call
        // Example for a generic payment gateway:
        const gatewayResponse = await axios.post(
            process.env.PAYMENT_GATEWAY_URL + '/process',
            paymentRequest,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.PAYMENT_GATEWAY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (gatewayResponse.data.success) {
            res.json({
                success: true,
                transactionId: gatewayResponse.data.transaction_id,
                message: 'Payment processed successfully',
                gatewayResponse: gatewayResponse.data
            });
        } else {
            res.status(400).json({
                success: false,
                message: gatewayResponse.data.message || 'Payment failed'
            });
        }

    } catch (error) {
        console.error('Credit card processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment processing failed',
            error: error.message
        });
    }
});

// PayPal Create Order
router.post('/paypal/create-order', async (req, res) => {
    try {
        const { amount, currency = 'USD', description } = req.body;

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: currency,
                    value: amount.toString()
                },
                description: description
            }],
            application_context: {
                brand_name: 'Bethlehem Medical Center',
                landing_page: 'NO_PREFERENCE',
                user_action: 'PAY_NOW',
                return_url: `https://bethlehemmedcenter.com/payment-success`,
                cancel_url: `https://bethlehemmedcenter.com/payment-cancel`
            }
        });

        const order = await paypalClient.execute(request);

        // Find approval URL
        const approvalUrl = order.result.links.find(link => link.rel === 'approve')?.href;

        res.json({
            orderId: order.result.id,
            approvalUrl: approvalUrl
        });

    } catch (error) {
        console.error('PayPal order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create PayPal order',
            error: error.message
        });
    }
});

// PayPal Capture Order
router.post('/paypal/capture-order', async (req, res) => {
    try {
        const { orderId } = req.body;

        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        const capture = await paypalClient.execute(request);

        if (capture.result.status === 'COMPLETED') {
            res.json({
                success: true,
                status: 'COMPLETED',
                transactionId: capture.result.id,
                details: capture.result
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment capture failed',
                status: capture.result.status
            });
        }

    } catch (error) {
        console.error('PayPal capture error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to capture PayPal payment',
            error: error.message
        });
    }
});

module.exports = router;