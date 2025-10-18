# 💰 **Complete Cash Payment System for Supabase**

## 🎯 **How Cash Payments Work in Your System**

### **Current Database Structure:**
- **`appointments`** table stores appointment data with `payment_status` field
- **`payment_status`** can be: `'pending'`, `'paid'`, `'failed'`, `'refunded'`
- **`price`** field stores the appointment cost

---

## 🔄 **Cash Payment Flow:**

### **Step 1: Patient Books Appointment**
```sql
-- When patient books appointment, it starts as 'pending'
INSERT INTO appointments (
    patient_id,
    doctor_id,
    clinic_id,
    date,
    time,
    status,
    payment_status,
    price,
    created_at,
    updated_at
) VALUES (
    123, -- patient_id
    'doctor-uuid',
    'clinic-uuid',
    '2024-01-15',
    '10:00',
    'scheduled',
    'pending', -- Payment starts as pending
    150.00,
    NOW(),
    NOW()
);
```

### **Step 2: Patient Arrives and Pays Cash**
```sql
-- Admin/Secretary marks payment as completed
UPDATE appointments 
SET 
    payment_status = 'paid',
    updated_at = NOW()
WHERE id = 'appointment-uuid';
```

### **Step 3: View Paid Patients**
```sql
-- Query to see all paid patients
SELECT 
    a.*,
    u.english_username_a,
    u.english_username_d,
    u.user_email,
    u.user_phonenumber,
    c.name as clinic_name,
    d.name as doctor_name,
    d.specialty
FROM appointments a
JOIN userinfo u ON a.patient_id = u.userid
LEFT JOIN clinics c ON a.clinic_id = c.id
LEFT JOIN doctors d ON a.doctor_id = d.id
WHERE a.payment_status = 'paid'
ORDER BY a.created_at DESC;
```

---

## 🛠️ **Supabase Setup Instructions:**

### **1. Create a Function to Mark Cash Payment as Paid**
```sql
-- Create a function to mark cash payments as completed
CREATE OR REPLACE FUNCTION mark_cash_payment_paid(appointment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE appointments 
    SET 
        payment_status = 'paid',
        updated_at = NOW()
    WHERE id = appointment_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **2. Create a Function to Get Paid Patients**
```sql
-- Create a function to get paid patients with full details
CREATE OR REPLACE FUNCTION get_paid_patients()
RETURNS TABLE (
    appointment_id UUID,
    patient_name TEXT,
    patient_email TEXT,
    patient_phone TEXT,
    clinic_name TEXT,
    doctor_name TEXT,
    specialty TEXT,
    appointment_date DATE,
    appointment_time TEXT,
    amount NUMERIC,
    payment_status TEXT,
    confirmation_number TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as appointment_id,
        CONCAT(u.english_username_a, ' ', u.english_username_d) as patient_name,
        u.user_email as patient_email,
        u.user_phonenumber as patient_phone,
        COALESCE(c.name, c.name_en, 'Unknown Clinic') as clinic_name,
        COALESCE(d.name, d.name_en, 'Unknown Doctor') as doctor_name,
        COALESCE(d.specialty, d.specialty_en, 'General') as specialty,
        a.date as appointment_date,
        a.time as appointment_time,
        a.price as amount,
        a.payment_status,
        CONCAT('#', RIGHT(a.id::TEXT, 8)) as confirmation_number,
        a.created_at
    FROM appointments a
    JOIN userinfo u ON a.patient_id = u.userid
    LEFT JOIN clinics c ON a.clinic_id = c.id
    LEFT JOIN doctors d ON a.doctor_id = d.id
    WHERE a.payment_status = 'paid'
    ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **3. Create a Function to Get Pending Payments**
```sql
-- Create a function to get pending payments
CREATE OR REPLACE FUNCTION get_pending_payments()
RETURNS TABLE (
    appointment_id UUID,
    patient_name TEXT,
    patient_email TEXT,
    patient_phone TEXT,
    clinic_name TEXT,
    doctor_name TEXT,
    specialty TEXT,
    appointment_date DATE,
    appointment_time TEXT,
    amount NUMERIC,
    payment_status TEXT,
    confirmation_number TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as appointment_id,
        CONCAT(u.english_username_a, ' ', u.english_username_d) as patient_name,
        u.user_email as patient_email,
        u.user_phonenumber as patient_phone,
        COALESCE(c.name, c.name_en, 'Unknown Clinic') as clinic_name,
        COALESCE(d.name, d.name_en, 'Unknown Doctor') as doctor_name,
        COALESCE(d.specialty, d.specialty_en, 'General') as specialty,
        a.date as appointment_date,
        a.time as appointment_time,
        a.price as amount,
        a.payment_status,
        CONCAT('#', RIGHT(a.id::TEXT, 8)) as confirmation_number,
        a.created_at
    FROM appointments a
    JOIN userinfo u ON a.patient_id = u.userid
    LEFT JOIN clinics c ON a.clinic_id = c.id
    LEFT JOIN doctors d ON a.doctor_id = d.id
    WHERE a.payment_status = 'pending'
    ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **4. Create a Function to Get Today's Appointments**
```sql
-- Create a function to get today's appointments
CREATE OR REPLACE FUNCTION get_today_appointments()
RETURNS TABLE (
    appointment_id UUID,
    patient_name TEXT,
    patient_email TEXT,
    patient_phone TEXT,
    clinic_name TEXT,
    doctor_name TEXT,
    specialty TEXT,
    appointment_date DATE,
    appointment_time TEXT,
    amount NUMERIC,
    payment_status TEXT,
    confirmation_number TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as appointment_id,
        CONCAT(u.english_username_a, ' ', u.english_username_d) as patient_name,
        u.user_email as patient_email,
        u.user_phonenumber as patient_phone,
        COALESCE(c.name, c.name_en, 'Unknown Clinic') as clinic_name,
        COALESCE(d.name, d.name_en, 'Unknown Doctor') as doctor_name,
        COALESCE(d.specialty, d.specialty_en, 'General') as specialty,
        a.date as appointment_date,
        a.time as appointment_time,
        a.price as amount,
        a.payment_status,
        CONCAT('#', RIGHT(a.id::TEXT, 8)) as confirmation_number,
        a.created_at
    FROM appointments a
    JOIN userinfo u ON a.patient_id = u.userid
    LEFT JOIN clinics c ON a.clinic_id = c.id
    LEFT JOIN doctors d ON a.doctor_id = d.id
    WHERE a.date = CURRENT_DATE
    ORDER BY a.time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔧 **Frontend Integration:**

### **1. Update Payment Service**
```typescript
// In src/lib/paymentService.ts
export class PalestinianPaymentService {
    // Mark cash payment as paid
    async markCashPaymentPaid(appointmentId: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .rpc('mark_cash_payment_paid', { appointment_id: appointmentId });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error marking cash payment as paid:', error);
            throw error;
        }
    }

    // Get paid patients
    async getPaidPatients(): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .rpc('get_paid_patients');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting paid patients:', error);
            throw error;
        }
    }

    // Get pending payments
    async getPendingPayments(): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .rpc('get_pending_payments');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting pending payments:', error);
            throw error;
        }
    }

    // Get today's appointments
    async getTodayAppointments(): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .rpc('get_today_appointments');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting today\'s appointments:', error);
            throw error;
        }
    }
}
```

---

## 📱 **How to Use in Supabase:**

### **1. Run the SQL Functions**
1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Run each of the functions above one by one

### **2. Test the Functions**
```sql
-- Test getting paid patients
SELECT * FROM get_paid_patients();

-- Test getting pending payments
SELECT * FROM get_pending_payments();

-- Test getting today's appointments
SELECT * FROM get_today_appointments();

-- Test marking a payment as paid
SELECT mark_cash_payment_paid('your-appointment-uuid-here');
```

### **3. Set Up Row Level Security (RLS)**
```sql
-- Enable RLS on appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to see all appointments
CREATE POLICY "Admins can view all appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE userid = auth.uid() 
            AND user_roles = 'Admin'
        )
    );

-- Create policy for secretaries to see all appointments
CREATE POLICY "Secretaries can view all appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE userid = auth.uid() 
            AND user_roles = 'Secretary'
        )
    );

-- Create policy for nurses to see all appointments
CREATE POLICY "Nurses can view all appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE userid = auth.uid() 
            AND user_roles = 'Nurse'
        )
    );

-- Create policy for doctors to see their appointments
CREATE POLICY "Doctors can view their appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE userid = auth.uid() 
            AND user_roles = 'Doctor'
            AND userid = doctor_id
        )
    );

-- Create policy for admins to update payment status
CREATE POLICY "Admins can update payment status" ON appointments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE userid = auth.uid() 
            AND user_roles = 'Admin'
        )
    );

-- Create policy for secretaries to update payment status
CREATE POLICY "Secretaries can update payment status" ON appointments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE userid = auth.uid() 
            AND user_roles = 'Secretary'
        )
    );
```

---

## 🎯 **Summary:**

1. **Your system uses the `appointments` table** for payment tracking
2. **`payment_status` field** controls the payment state
3. **Cash payments** are marked as `'paid'` when received
4. **The PaidPatientsList component** now correctly fetches from `appointments` table
5. **SQL functions** provide easy access to payment data
6. **RLS policies** ensure proper access control

**This will make your paid patients list work perfectly!** 🚀

