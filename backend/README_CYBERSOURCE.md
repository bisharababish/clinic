# CyberSource Payment Integration Guide

## Overview
This guide explains how to securely integrate CyberSource Visa payments into your application.

## Security First! 🔒

### Critical Security Rules:
1. **NEVER** store card numbers in your database
2. **NEVER** log card numbers in console or files
3. **ALWAYS** use HTTPS for all payment requests
4. **ALWAYS** validate amounts server-side
5. **NEVER** expose API keys to frontend

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in your backend directory with:

```env
# CyberSource Credentials (Get these from your provider)
CYBERSOURCE_MERCHANT_ID=your_merchant_id
CYBERSOURCE_API_KEY=your_api_key
CYBERSOURCE_SECRET_KEY=your_secret_key
CYBERSOURCE_ENDPOINT=https://ebc2.cybersource.com/ebc2/
CYBERSOURCE_ENVIRONMENT=test  # or 'production' for live

# Supabase (if needed)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 2. Install Dependencies

```bash
npm install axios crypto
```

### 3. Database Setup

Run the SQL migration:
```bash
# Run this in your Supabase SQL editor
psql -f supabase_payment_method_setup.sql
```

Or manually run the SQL file in Supabase dashboard.

### 4. API Endpoint Setup

If using Express.js:

```javascript
const express = require('express');
const processVisaPayment = require('./api/payments/process-visa');
const router = express.Router();

// Protect this route with authentication middleware
router.post('/process-visa', authenticateUser, processVisaPayment);

module.exports = router;
```

### 5. Frontend Integration

The frontend components are ready:
- `SecureCardInput.tsx` - Secure card input form
- `Payment.tsx` - Updated to support Cash/Visa selection

## Testing

### Test Mode
1. Set `CYBERSOURCE_ENVIRONMENT=test` in `.env`
2. Use CyberSource test card numbers:
   - Success: `4111111111111111` (Visa)
   - Decline: `4000000000000002`
   - Any CVV, future expiry date

### Production Mode
1. Set `CYBERSOURCE_ENVIRONMENT=production` in `.env`
2. Use real CyberSource production credentials
3. Test with small amounts first

## Payment Flow

```
1. Patient selects "Visa" payment method
2. Patient enters card details (encrypted in browser)
3. Frontend sends card data to backend API
4. Backend validates and processes with CyberSource
5. CyberSource returns transaction result
6. Backend updates database
7. Frontend shows success/error message
```

## API Endpoints

### POST /api/payments/process-visa

**Request:**
```json
{
  "amount": "100.00",
  "currency": "ILS",
  "cardData": {
    "cardNumber": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "25",
    "cvv": "123",
    "cardholderName": "JOHN DOE"
  },
  "bookingId": "booking-123",
  "patientId": "user-456",
  "patientEmail": "patient@example.com"
}
```

**Success Response:**
```json
{
  "success": true,
  "transactionId": "cybersource-txn-123",
  "amount": 100.00,
  "currency": "ILS",
  "status": "completed",
  "message": "Payment processed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "errorCode": "DECLINED",
  "errorMessage": "Payment declined"
}
```

## Security Checklist

- [ ] API keys stored in environment variables
- [ ] HTTPS enabled for all requests
- [ ] Authentication required for payment endpoint
- [ ] Input validation on all fields
- [ ] Amount validation server-side
- [ ] No card data in logs
- [ ] Rate limiting implemented
- [ ] Error messages don't expose sensitive info

## Support

For CyberSource API documentation:
- Check with your payment provider
- Request CyberSource integration guide
- Contact CyberSource support

## Next Steps

Once you have CyberSource credentials:
1. Add credentials to `.env` file
2. Test in test mode
3. Verify database updates
4. Test with real transactions (small amounts)
5. Go live in production

---

**Remember:** Never commit `.env` file to git! Add it to `.gitignore`.

