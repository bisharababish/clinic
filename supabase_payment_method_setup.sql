-- =====================================================
-- PAYMENT METHOD SETUP - Database Schema Updates
-- =====================================================
-- This script adds payment_method support for CyberSource integration
-- Adds payment_method field to payment_bookings and service_requests
-- Adds gateway_transaction_id for CyberSource transaction tracking
-- =====================================================

-- =====================================================
-- 1. UPDATE payment_bookings TABLE
-- =====================================================

-- Add payment_method column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_bookings' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE public.payment_bookings 
        ADD COLUMN payment_method text DEFAULT 'cash' 
        CHECK (payment_method IN ('cash', 'visa', 'mastercard', 'credit_card'));
    END IF;
END $$;

-- Add gateway_transaction_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_bookings' 
        AND column_name = 'gateway_transaction_id'
    ) THEN
        ALTER TABLE public.payment_bookings 
        ADD COLUMN gateway_transaction_id text;
    END IF;
END $$;

-- Add gateway_name column if it doesn't exist (for future extensibility)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_bookings' 
        AND column_name = 'gateway_name'
    ) THEN
        ALTER TABLE public.payment_bookings 
        ADD COLUMN gateway_name text;
    END IF;
END $$;

-- =====================================================
-- 2. UPDATE service_requests TABLE
-- =====================================================

-- Add payment_method column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_requests' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE public.service_requests 
        ADD COLUMN payment_method text DEFAULT 'cash' 
        CHECK (payment_method IN ('cash', 'visa', 'mastercard', 'credit_card'));
    END IF;
END $$;

-- Add gateway_transaction_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_requests' 
        AND column_name = 'gateway_transaction_id'
    ) THEN
        ALTER TABLE public.service_requests 
        ADD COLUMN gateway_transaction_id text;
    END IF;
END $$;

-- Add gateway_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_requests' 
        AND column_name = 'gateway_name'
    ) THEN
        ALTER TABLE public.service_requests 
        ADD COLUMN gateway_name text;
    END IF;
END $$;

-- =====================================================
-- 3. UPDATE payment_transactions TABLE
-- =====================================================

-- Ensure payment_method supports visa
DO $$ 
BEGIN
    -- Check if constraint exists and update it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payment_transactions_payment_method_check'
        AND table_name = 'payment_transactions'
    ) THEN
        -- Drop existing constraint
        ALTER TABLE public.payment_transactions 
        DROP CONSTRAINT IF EXISTS payment_transactions_payment_method_check;
    END IF;
    
    -- Add new constraint with visa support
    ALTER TABLE public.payment_transactions 
    ADD CONSTRAINT payment_transactions_payment_method_check 
    CHECK (payment_method IN ('cash', 'visa', 'mastercard', 'credit_card', 'paypal'));
END $$;

-- Add gateway_transaction_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'gateway_transaction_id'
    ) THEN
        ALTER TABLE public.payment_transactions 
        ADD COLUMN gateway_transaction_id text;
    END IF;
END $$;

-- Add gateway_name if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'gateway_name'
    ) THEN
        ALTER TABLE public.payment_transactions 
        ADD COLUMN gateway_name text;
    END IF;
END $$;

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on gateway_transaction_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_payment_bookings_gateway_transaction_id 
ON public.payment_bookings(gateway_transaction_id);

CREATE INDEX IF NOT EXISTS idx_service_requests_gateway_transaction_id 
ON public.service_requests(gateway_transaction_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_transaction_id 
ON public.payment_transactions(gateway_transaction_id);

-- Index on payment_method for filtering
CREATE INDEX IF NOT EXISTS idx_payment_bookings_payment_method 
ON public.payment_bookings(payment_method);

CREATE INDEX IF NOT EXISTS idx_service_requests_payment_method 
ON public.service_requests(payment_method);

-- =====================================================
-- SUMMARY
-- =====================================================
-- Added columns:
--   - payment_method: 'cash' | 'visa' | 'mastercard' | 'credit_card'
--   - gateway_transaction_id: CyberSource transaction ID
--   - gateway_name: Payment gateway name (e.g., 'cybersource')
-- 
-- Tables updated:
--   - payment_bookings
--   - service_requests
--   - payment_transactions
-- 
-- Ready for CyberSource integration!
-- =====================================================

