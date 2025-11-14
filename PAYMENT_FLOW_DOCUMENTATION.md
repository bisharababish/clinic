# Complete Payment Flow Documentation - Visa/CyberSource Integration

This document describes the complete end-to-end payment flow for both **Appointment Bookings** and **Service Requests** using Visa payment via CyberSource Secure Acceptance Hosted Checkout.

---

## 📋 Table of Contents

1. [Appointment Booking Payment Flow](#appointment-booking-payment-flow)
2. [Service Request Payment Flow](#service-request-payment-flow)
3. [Database Tables Involved](#database-tables-involved)
4. [Reference Number Format](#reference-number-format)
5. [Status Transitions](#status-transitions)

---

## 🏥 Appointment Booking Payment Flow

### Step 1: Patient Initiates Appointment Booking
**Location:** `frontend/pages/Payment.tsx`

1. Patient selects clinic, doctor, date, time, and sees price
2. Patient clicks "Pay with Visa" button
3. Frontend calls `initializePayment()` which:
   - Creates a record in `payment_bookings` table
   - Sets `payment_status: 'pending'`
   - Sets `booking_status: 'scheduled'`
   - Stores appointment details (patient, doctor, clinic, date, time, price)
   - Returns `appointmentId` (UUID)

**Reference Number Format:** `APT-{appointmentId}`

**Example:** `APT-6a560c36-4b1f-4a58-b974-4be2959239a3`

---

### Step 2: Frontend Creates CyberSource Session
**Location:** `frontend/pages/Payment.tsx` → `handleHostedCheckout()`

1. Frontend calls backend endpoint: `POST /api/payments/cybersource/session`
2. Sends:
   ```json
   {
     "amount": 100.00,
     "currency": "ILS",
     "referenceNumber": "APT-6a560c36-4b1f-4a58-b974-4be2959239a3",
     "successUrl": "https://api.bethlehemmedcenter.com/api/payments/cybersource/callback",
     "cancelUrl": "https://api.bethlehemmedcenter.com/api/payments/cybersource/callback"
   }
   ```

---

### Step 3: Backend Generates CyberSource Payload
**Location:** `backend/server.ts` → `POST /api/payments/cybersource/session`
**Helper:** `backend/api/payments/hosted-checkout.ts`

1. Backend generates:
   - `transaction_uuid` (unique transaction ID)
   - `signed_date_time` (current timestamp)
   - Builds signed fields list
   - Generates HMAC SHA256 signature using secret key
   - Creates form payload with all required fields

2. Returns to frontend:
   ```json
   {
     "success": true,
     "endpoint": "https://testsecureacceptance.cybersource.com/pay",
     "fields": {
       "access_key": "...",
       "profile_id": "...",
       "transaction_uuid": "...",
       "signed_field_names": "...",
       "unsigned_field_names": "",
       "signed_date_time": "...",
       "locale": "en-us",
       "transaction_type": "sale",
       "reference_number": "APT-6a560c36-4b1f-4a58-b974-4be2959239a3",
       "amount": "100.00",
       "currency": "ILS",
       "signature": "..."
     }
   }
   ```

---

### Step 4: Frontend Redirects to CyberSource
**Location:** `frontend/pages/Payment.tsx` → `handleHostedCheckout()`

1. Frontend dynamically creates HTML form with all fields
2. Submits form via POST to CyberSource endpoint
3. User is redirected to CyberSource hosted checkout page
4. User enters card details (Visa card number, CVV, expiration)

---

### Step 5: CyberSource Processes Payment
**Location:** CyberSource servers

1. CyberSource validates card details
2. Processes payment with bank
3. Returns decision: `ACCEPT` or `DECLINE`
4. **POSTs payment result** to backend callback URL:
   - `POST https://api.bethlehemmedcenter.com/api/payments/cybersource/callback`
   - Includes all payment fields + signature for verification

---

### Step 6: Backend Callback Processes Payment
**Location:** `backend/server.ts` → `POST /api/payments/cybersource/callback`

#### 6.1: Verify Signature
- Verifies HMAC SHA256 signature from CyberSource
- Ensures payment data integrity

#### 6.2: Extract Payment Data
- `reference_number`: `APT-6a560c36-4b1f-4a58-b974-4be2959239a3`
- `decision`: `ACCEPT` or `DECLINE`
- `transaction_id`: CyberSource transaction ID
- `amount`: Payment amount
- `currency`: Payment currency

#### 6.3: Update Payment Booking
**Table:** `payment_bookings`
```sql
UPDATE payment_bookings
SET 
  payment_status = 'paid',  -- or 'failed' if declined
  payment_method = 'visa',
  gateway_transaction_id = '...',
  gateway_name = 'cybersource',
  updated_at = NOW()
WHERE id = '6a560c36-4b1f-4a58-b974-4be2959239a3';
```

#### 6.4: Create Payment Transaction Record
**Table:** `payment_transactions`
```sql
INSERT INTO payment_transactions (
  payment_booking_id,
  payment_method,
  amount,
  currency,
  transaction_status,
  transaction_id,
  gateway_transaction_id,
  gateway_name,
  gateway_response
) VALUES (...);
```

#### 6.5: Update Corresponding Appointment
**Table:** `appointments`
- Finds appointment by matching: patient_id, date, time, doctor_id, clinic_id
- Updates:
  ```sql
  UPDATE appointments
  SET 
    payment_status = 'paid',
    notes = 'Paid by Visa via CyberSource - Transaction ID: ...',
    updated_at = NOW()
  WHERE id = <matching_appointment_id>;
  ```

**Result:** Appointment is automatically marked as paid - **Secretary doesn't need to confirm**

#### 6.6: Redirect to Frontend
- Backend redirects user to: `https://bethlehemmedcenter.com/payment/result?signature=...&decision=ACCEPT&...`
- All payment data included as URL query parameters

---

### Step 7: Frontend Displays Payment Result
**Location:** `frontend/pages/PaymentResult.tsx`

#### 7.1: Check URL Parameters
- If payment data in URL → Process immediately
- If no payment data in URL → Check database for recent payment (within 5 minutes)

#### 7.2: Verify Payment
- Calls backend: `POST /api/payments/cybersource/confirm` (optional, for double verification)
- Displays success or failure message

#### 7.3: Show Result
- **Success:** Shows payment confirmation with transaction ID, amount, reference number
- **Failed:** Shows error message with retry option

---

## 🔬 Service Request Payment Flow

### Step 1: Doctor Creates Service Request
**Location:** `frontend/pages/DoctorPatientPage.tsx`

1. Doctor clicks "Request" button for a service (X-Ray, Ultrasound, Lab, Audiometry)
2. Doctor fills in service details and notes
3. System creates record in `service_requests` table:
   - `status: 'pending'`
   - `payment_status: 'pending'`
   - `price`: Set by secretary or system

---

### Step 2: Secretary Confirms Service Request
**Location:** `frontend/pages/api/admin/ServiceRequestsManagement.tsx`

1. Secretary reviews service request
2. Secretary clicks "Confirm Request"
3. System updates:
   ```sql
   UPDATE service_requests
   SET 
     status = 'payment_required',  -- if price > 0
     secretary_confirmed_at = NOW(),
     secretary_confirmed_by = 'secretary@email.com',
     updated_at = NOW()
   WHERE id = <request_id>;
   ```
4. Patient receives notification: "Please pay ₪X to proceed"

---

### Step 3: Patient Initiates Payment
**Location:** `frontend/pages/Payment.tsx`

1. Patient navigates to payment page (from notification or dashboard)
2. Frontend detects `isServiceRequestPayment = true`
3. Loads service request data from `service_requests` table
4. Patient sees service details and price
5. Patient clicks "Pay with Visa"

**Reference Number Format:** `SR-{serviceRequestId}`

**Example:** `SR-12345`

---

### Step 4-6: Same as Appointment Flow
- Steps 4-6 are identical to appointment booking flow
- Uses `SR-{id}` instead of `APT-{id}`

---

### Step 7: Backend Callback Processes Service Request Payment
**Location:** `backend/server.ts` → `POST /api/payments/cybersource/callback`

#### 7.1: Extract Reference Number
- `reference_number`: `SR-12345`
- Extracts `requestId = 12345`

#### 7.2: Get Current Service Request Status
```sql
SELECT status, payment_status, notes
FROM service_requests
WHERE id = 12345;
```

#### 7.3: Update Service Request
**Table:** `service_requests`
```sql
UPDATE service_requests
SET 
  payment_status = 'paid',  -- or 'failed' if declined
  payment_method = 'visa',
  gateway_transaction_id = '...',
  gateway_name = 'cybersource',
  status = 'in_progress',  -- Automatically updated to allow service to start
  notes = 'Paid by Visa via CyberSource - Transaction ID: ...',
  updated_at = NOW()
WHERE id = 12345;
```

**Status Logic:**
- If `status` was `'payment_required'` → Changes to `'in_progress'`
- If `status` was `'secretary_confirmed'` → Changes to `'in_progress'`
- If `status` was `'pending'` → Changes to `'in_progress'`

**Result:** Service request is automatically marked as paid and ready to start - **Secretary doesn't need to confirm payment**

#### 7.4: Create Payment Transaction Record
**Table:** `payment_transactions`
```sql
INSERT INTO payment_transactions (
  payment_booking_id,  -- This is the service_request_id
  payment_method,
  amount,
  currency,
  transaction_status,
  transaction_id,
  gateway_transaction_id,
  gateway_name,
  gateway_response
) VALUES (...);
```

#### 7.5: Redirect to Frontend
- Same as appointment flow
- Redirects to: `https://bethlehemmedcenter.com/payment/result?signature=...&decision=ACCEPT&...`

---

### Step 8: Frontend Displays Payment Result
**Location:** `frontend/pages/PaymentResult.tsx`

- Same as appointment flow
- Shows success/failure message
- Patient can navigate to dashboard to see updated service request status

---

## 📊 Database Tables Involved

### 1. `payment_bookings`
**Purpose:** Stores appointment booking payment records

**Key Fields:**
- `id` (UUID) - Used in reference number: `APT-{id}`
- `patient_id`, `patient_email`, `patient_name`
- `clinic_name`, `doctor_name`, `specialty`
- `appointment_day`, `appointment_time`
- `price`, `currency`
- `payment_status`: `'pending'` → `'paid'` or `'failed'`
- `payment_method`: `'visa'` (after payment)
- `gateway_transaction_id`: CyberSource transaction ID
- `gateway_name`: `'cybersource'`
- `booking_status`: `'scheduled'`, `'completed'`, `'cancelled'`

---

### 2. `service_requests`
**Purpose:** Stores service requests from doctors

**Key Fields:**
- `id` (bigint) - Used in reference number: `SR-{id}`
- `patient_id`, `patient_email`, `patient_name`
- `doctor_id`, `doctor_name`
- `service_type`: `'xray'`, `'ultrasound'`, `'lab'`, `'audiometry'`
- `price`, `currency`
- `payment_status`: `'pending'` → `'paid'` or `'failed'`
- `payment_method`: `'visa'` (after payment)
- `gateway_transaction_id`: CyberSource transaction ID
- `gateway_name`: `'cybersource'`
- `status`: `'pending'` → `'payment_required'` → `'in_progress'` → `'completed'`

---

### 3. `appointments`
**Purpose:** Stores confirmed appointments (used by secretary/admin)

**Key Fields:**
- `id` (UUID)
- `patient_id`, `doctor_id`, `clinic_id`
- `date`, `time`
- `status`: `'scheduled'`, `'completed'`, `'cancelled'`
- `payment_status`: `'pending'` → `'paid'` (automatically updated when Visa payment succeeds)
- `notes`: Includes "Paid by Visa via CyberSource..." note

---

### 4. `payment_transactions`
**Purpose:** Stores all payment transaction records (audit trail)

**Key Fields:**
- `id` (UUID)
- `payment_booking_id`: References `payment_bookings.id` or `service_requests.id`
- `payment_method`: `'visa'`
- `amount`, `currency`
- `transaction_status`: `'completed'` or `'failed'`
- `transaction_id`: CyberSource transaction ID
- `gateway_transaction_id`: Same as transaction_id
- `gateway_name`: `'cybersource'`
- `gateway_response`: Full JSON response from CyberSource

---

## 🔢 Reference Number Format

### Appointment Booking
- **Format:** `APT-{payment_bookings.id}`
- **Example:** `APT-6a560c36-4b1f-4a58-b974-4be2959239a3`
- **Where:** `payment_bookings.id` is a UUID

### Service Request
- **Format:** `SR-{service_requests.id}`
- **Example:** `SR-12345`
- **Where:** `service_requests.id` is a bigint (auto-increment)

**Backend Logic:**
```typescript
if (referenceNumber.startsWith('APT-')) {
    // Handle appointment booking
    const bookingId = referenceNumber.replace('APT-', '');
    // Update payment_bookings and appointments
} else if (referenceNumber.startsWith('SR-')) {
    // Handle service request
    const requestId = referenceNumber.replace('SR-', '');
    // Update service_requests
}
```

---

## 🔄 Status Transitions

### Appointment Booking Status Flow

```
1. Patient creates booking
   payment_bookings.payment_status: 'pending'
   payment_bookings.booking_status: 'scheduled'

2. Patient pays with Visa (success)
   payment_bookings.payment_status: 'paid'
   payment_bookings.payment_method: 'visa'
   appointments.payment_status: 'paid' (if appointment exists)
   appointments.notes: 'Paid by Visa via CyberSource...'

3. Secretary sees appointment
   - Already marked as paid
   - No manual confirmation needed
```

### Service Request Status Flow

```
1. Doctor creates request
   service_requests.status: 'pending'
   service_requests.payment_status: 'pending'

2. Secretary confirms request
   service_requests.status: 'payment_required' (if price > 0)
   OR 'secretary_confirmed' (if price = 0)

3. Patient pays with Visa (success)
   service_requests.payment_status: 'paid'
   service_requests.payment_method: 'visa'
   service_requests.status: 'in_progress' (automatically updated)
   service_requests.notes: 'Paid by Visa via CyberSource...'

4. Service provider sees request
   - Already marked as paid
   - Status is 'in_progress' - ready to start service
   - No secretary confirmation needed
```

---

## 🔐 Security & Verification

### Signature Verification
- All CyberSource responses include HMAC SHA256 signature
- Backend verifies signature before processing payment
- Invalid signatures are logged as security events

### Payment Verification
- Frontend can verify payment via `POST /api/payments/cybersource/confirm`
- Database fallback: Frontend checks for recent payments if URL params missing

---

## 📝 Key Features

### ✅ Automatic Status Updates
- **Appointments:** Automatically marked as `paid` when Visa payment succeeds
- **Service Requests:** Automatically marked as `paid` and status set to `in_progress`

### ✅ No Manual Confirmation Needed
- Secretary doesn't need to manually confirm Visa payments
- System automatically updates all relevant tables

### ✅ Complete Audit Trail
- All payments recorded in `payment_transactions` table
- Full CyberSource response stored in `gateway_response` field

### ✅ Error Handling
- Failed payments marked as `'failed'`
- Error messages displayed to user
- All errors logged for debugging

---

## 🔗 API Endpoints

### Frontend → Backend
1. `POST /api/payments/cybersource/session`
   - Creates CyberSource payment session
   - Returns form payload for redirect

2. `POST /api/payments/cybersource/confirm` (optional)
   - Verifies payment from frontend
   - Requires authentication

### CyberSource → Backend
1. `POST /api/payments/cybersource/callback`
   - **Public endpoint** (no auth required)
   - Receives payment result from CyberSource
   - Processes payment and updates database
   - Redirects user to frontend

---

## 🧪 Testing

### Test Card Numbers (Sandbox Only)
- **Visa:** `4111 1111 1111 1111`
- **Mastercard:** `5555 5555 5555 4444`
- **American Express:** `3782 8224 6310 005`

### Test Scenarios
1. **Successful Payment:**
   - Use valid test card
   - Should see: `payment_status: 'paid'`, appointment/service marked as paid

2. **Failed Payment:**
   - Use invalid card or decline test
   - Should see: `payment_status: 'failed'`, error message displayed

3. **Timeout:**
   - Frontend has 15-second timeout for session creation
   - Should show timeout error if backend doesn't respond

---

## 📞 Support

For issues or questions:
1. Check backend logs for CyberSource callback errors
2. Verify CyberSource profile settings in Business Center
3. Check database for payment records
4. Review `payment_transactions` table for transaction history

---

**Last Updated:** 2025-01-13
**Version:** 1.0

