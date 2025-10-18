-- Clear incorrect payment data
-- This script will remove all existing payment bookings to start fresh

-- First, let's see what data we have
SELECT 
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_count,
    COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_count
FROM payment_bookings;

-- Clear all existing payment bookings (this will remove the 6 paid and 200+ pending)
DELETE FROM payment_bookings;

-- Clear any related payment transactions
DELETE FROM payment_transactions;

-- Clear any related payment logs
DELETE FROM payment_logs;

-- Verify the tables are empty
SELECT 'payment_bookings' as table_name, COUNT(*) as count FROM payment_bookings
UNION ALL
SELECT 'payment_transactions' as table_name, COUNT(*) as count FROM payment_transactions
UNION ALL
SELECT 'payment_logs' as table_name, COUNT(*) as count FROM payment_logs;
