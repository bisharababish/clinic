# Patient Dashboard Setup Instructions

## 🗄️ Database Setup

### Step 1: Create the appointment_change_logs table

Run this SQL script in your Supabase database:

```sql
-- Create appointment_change_logs table to track patient appointment modifications
CREATE TABLE IF NOT EXISTS appointment_change_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    patient_email TEXT NOT NULL,
    original_appointment_id TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('reschedule', 'cancel', 'delete')),
    original_date TEXT,
    original_time TEXT,
    new_date TEXT,
    new_time TEXT,
    original_doctor_name TEXT,
    original_clinic_name TEXT,
    reason TEXT,
    admin_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointment_change_logs_patient_id ON appointment_change_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointment_change_logs_action_type ON appointment_change_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_appointment_change_logs_created_at ON appointment_change_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_appointment_change_logs_admin_notified ON appointment_change_logs(admin_notified);

-- Add comments for documentation
COMMENT ON TABLE appointment_change_logs IS 'Tracks all appointment modifications made by patients';
COMMENT ON COLUMN appointment_change_logs.action_type IS 'Type of action: reschedule, cancel, or delete';
COMMENT ON COLUMN appointment_change_logs.admin_notified IS 'Whether admin has been notified of this change';
```

### Step 2: Verify the table was created

Check in your Supabase dashboard that the `appointment_change_logs` table exists.

## 🚀 How to Access

### For Patients:
1. **Login as a patient**
2. **Look for "My Appointments" in the header navigation**
3. **Click on it to access your dashboard**
4. **URL:** `/patient/dashboard`

### For Admins:
1. **Login as admin or secretary**
2. **Go to Admin Dashboard**
3. **Look for "Appointment Logs" tab**
4. **Click to view all patient appointment changes**

## 🔧 Troubleshooting

### If "My Appointments" doesn't show in header:
- Make sure you're logged in as a user with `patient` role
- Check browser console for any errors
- Try refreshing the page

### If "Appointment Logs" tab doesn't show in admin dashboard:
- Make sure you're logged in as `admin` or `secretary` role
- Check browser console for any errors
- Try refreshing the page

### If patient dashboard shows "No appointments found":
- This is normal if the patient hasn't booked any appointments yet
- Book an appointment first, then check the dashboard

### If appointment changes aren't being logged:
- Make sure the `appointment_change_logs` table was created
- Check browser console for any database errors
- Verify Supabase connection

## ✅ Features Available

### Patient Dashboard:
- ✅ View all appointments
- ✅ Reschedule appointments (change date/time)
- ✅ Cancel appointments
- ✅ Reason tracking for changes
- ✅ Real-time updates

### Admin Dashboard:
- ✅ View all appointment changes
- ✅ Filter by action type (reschedule, cancel, delete)
- ✅ Search by patient name, email, doctor, clinic
- ✅ Mark changes as read
- ✅ New/unread notifications

## 🌐 RTL Support
- Full Arabic support with right-to-left layout
- Bilingual interface (Arabic/English)
- Proper text alignment for both languages
