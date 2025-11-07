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
# CyberSource Hosted Checkout (Secure Acceptance) Credentials
CYBERSOURCE_MERCHANT_ID=your_merchant_id
CYBERSOURCE_PROFILE_ID=your_secure_acceptance_profile_id
CYBERSOURCE_ACCESS_KEY=your_secure_acceptance_access_key
CYBERSOURCE_SECRET_KEY=your_secure_acceptance_secret_key
CYBERSOURCE_ENVIRONMENT=test  # or 'production' for live

# Optional overrides if you need to customize the signed field configuration
CYBERSOURCE_SIGNED_FIELD_NAMES=access_key,profile_id,transaction_uuid,signed_field_names,unsigned_field_names,signed_date_time,locale,transaction_type,reference_number,amount,currency
CYBERSOURCE_UNSIGNED_FIELD_NAMES=decision,message,reason_code,transaction_id,auth_code,override_custom_receipt_page,override_custom_cancel_page

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

- `POST /api/payments/cybersource/session`
  - Authenticated + CSRF protected
  - Request body: `{ amount, currency, referenceNumber, successUrl, cancelUrl }`
  - Returns the Secure Acceptance endpoint and signed field payload to post to CyberSource
- `POST /api/payments/cybersource/confirm`
  - Authenticated + CSRF protected
  - Request body: `{ fields: { ...returnedQueryParams } }`
  - Verifies the signature, updates payment status, and records the transaction in Supabase

The previous direct REST payment endpoint (`/api/payments/process-visa`) is deprecated in favor of the hosted checkout flow.

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

## Updating Profile Field Configuration via Script

If the CyberSource dashboard UI hides the "Signed Data Fields" settings, run the helper script:

```bash
cd backend
npm run update:cybersource
```

Make sure the following environment variables are set before running the command:
- `CYBERSOURCE_MERCHANT_ID`
- `CYBERSOURCE_PROFILE_ID`
- `CYBERSOURCE_ACCESS_KEY`
- `CYBERSOURCE_SECRET_KEY`
- `CYBERSOURCE_ENVIRONMENT` (set to `test` or `production`)

The script will push the required signed/unsigned field names directly through CyberSource's REST API and print the response status.

