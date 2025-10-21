-- Database Performance Optimization for Production
-- Run these queries to optimize your Supabase database

-- 1. Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_userinfo_email ON userinfo(user_email);
CREATE INDEX IF NOT EXISTS idx_userinfo_roles ON userinfo(user_roles);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_payment_bookings_patient_id ON payment_bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_bookings_date ON payment_bookings(appointment_day);
CREATE INDEX IF NOT EXISTS idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_xray_images_patient_id ON xray_images(patient_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_email ON activity_log(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp);

-- 2. Add composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_payments_patient_status ON payment_bookings(patient_id, payment_status);

-- 3. Optimize table statistics
ANALYZE userinfo;
ANALYZE appointments;
ANALYZE payment_bookings;
ANALYZE lab_results;
ANALYZE xray_images;
ANALYZE activity_log;

-- 4. Add database constraints for data integrity
ALTER TABLE userinfo ADD CONSTRAINT chk_user_roles 
    CHECK (user_roles IN ('admin', 'doctor', 'secretary', 'patient', 'x ray', 'lab', 'nurse'));

ALTER TABLE appointments ADD CONSTRAINT chk_appointment_status 
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show'));

ALTER TABLE payment_bookings ADD CONSTRAINT chk_payment_status 
    CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'refunded'));

-- 5. Create materialized view for dashboard statistics
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
    COUNT(*) as total_patients,
    COUNT(CASE WHEN user_roles = 'doctor' THEN 1 END) as total_doctors,
    COUNT(CASE WHEN user_roles = 'admin' THEN 1 END) as total_admins,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d
FROM userinfo;

-- Refresh the materialized view periodically
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- 6. Add connection pooling configuration
-- (This should be configured in your Supabase dashboard)
-- Go to Settings > Database > Connection Pooling
-- Enable connection pooling with max 20 connections
