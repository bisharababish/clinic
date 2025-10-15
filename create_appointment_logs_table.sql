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
