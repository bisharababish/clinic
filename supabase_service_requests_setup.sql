-- =====================================================
-- SERVICE REQUESTS SETUP - Database Schema and Policies
-- =====================================================
-- This script sets up everything needed for service requests:
-- 1. Creates service_requests table
-- 2. Creates patient_status_change_logs table
-- 3. Sets up RLS policies
-- =====================================================

-- =====================================================
-- 1. CREATE SERVICE_REQUESTS TABLE
-- =====================================================
CREATE SEQUENCE IF NOT EXISTS service_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS public.service_requests (
    id bigint NOT NULL DEFAULT nextval('service_requests_id_seq'::regclass),
    patient_id bigint NOT NULL,
    patient_email text NOT NULL,
    patient_name text,
    doctor_id bigint NOT NULL,
    doctor_name text NOT NULL,
    service_type text NOT NULL CHECK (service_type IN ('xray', 'ultrasound', 'lab', 'audiometry')),
    service_subtype text,
    notes text,
    price numeric(10, 2),
    currency text DEFAULT 'ILS',
    payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'completed', 'failed', 'refunded')),
    payment_booking_id text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'secretary_confirmed', 'payment_required', 'in_progress', 'completed', 'cancelled')),
    secretary_confirmed_at timestamp with time zone,
    secretary_confirmed_by text,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT service_requests_pkey PRIMARY KEY (id),
    CONSTRAINT fk_service_requests_patient FOREIGN KEY (patient_id) 
        REFERENCES public.userinfo(userid) ON DELETE CASCADE,
    CONSTRAINT fk_service_requests_doctor FOREIGN KEY (doctor_id) 
        REFERENCES public.userinfo(userid) ON DELETE SET NULL
);

ALTER SEQUENCE service_requests_id_seq OWNED BY service_requests.id;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_service_requests_patient_id ON public.service_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_doctor_id ON public.service_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_service_type ON public.service_requests(service_type);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON public.service_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_payment_status ON public.service_requests(payment_status);

-- =====================================================
-- 2. CREATE PATIENT_STATUS_CHANGE_LOGS TABLE
-- =====================================================
CREATE SEQUENCE IF NOT EXISTS patient_status_change_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS public.patient_status_change_logs (
    id bigint NOT NULL DEFAULT nextval('patient_status_change_logs_id_seq'::regclass),
    patient_id bigint NOT NULL,
    patient_email text NOT NULL,
    old_status text,
    new_status text,
    changed_by text NOT NULL,
    changed_by_role text NOT NULL,
    change_time timestamp with time zone DEFAULT now(),
    can_patient_revert boolean DEFAULT false,
    patient_revert_deadline timestamp with time zone,
    patient_reverted_at timestamp with time zone,
    CONSTRAINT patient_status_change_logs_pkey PRIMARY KEY (id),
    CONSTRAINT fk_patient_status_change_logs_patient FOREIGN KEY (patient_id) 
        REFERENCES public.userinfo(userid) ON DELETE CASCADE
);

ALTER SEQUENCE patient_status_change_logs_id_seq OWNED BY patient_status_change_logs.id;

CREATE INDEX IF NOT EXISTS idx_patient_status_change_logs_patient_id ON public.patient_status_change_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_status_change_logs_change_time ON public.patient_status_change_logs(change_time DESC);

-- =====================================================
-- 3. ENABLE RLS ON TABLES
-- =====================================================
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_status_change_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. RLS POLICIES FOR SERVICE_REQUESTS TABLE
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Doctors can create service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Doctors can view all service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Patients can view their own service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Secretaries can confirm service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Patients can update their own service requests for payment" ON public.service_requests;
DROP POLICY IF EXISTS "Service providers can update service requests" ON public.service_requests;

-- Policy: Doctors can INSERT requests
CREATE POLICY "Doctors can create service requests"
ON public.service_requests
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.userinfo
        WHERE userinfo.user_email = (SELECT auth.email())
        AND userinfo.user_roles IN ('Doctor', 'Admin')
    )
);

-- Policy: Doctors can SELECT all requests
CREATE POLICY "Doctors can view all service requests"
ON public.service_requests
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.userinfo
        WHERE userinfo.user_email = (SELECT auth.email())
        AND userinfo.user_roles IN ('Doctor', 'Admin', 'Secretary', 'Lab', 'X Ray', 'Ultrasound', 'Audiometry')
    )
);

-- Policy: Patients can SELECT their own requests
CREATE POLICY "Patients can view their own service requests"
ON public.service_requests
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.userinfo
        WHERE userinfo.user_email = (SELECT auth.email())
        AND userinfo.user_roles = 'Patient'
        AND userinfo.user_email = service_requests.patient_email
    )
);

-- Policy: Secretaries can UPDATE requests (confirm them)
CREATE POLICY "Secretaries can confirm service requests"
ON public.service_requests
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.userinfo
        WHERE userinfo.user_email = (SELECT auth.email())
        AND userinfo.user_roles IN ('Secretary', 'Admin')
    )
);

-- Policy: Patients can UPDATE their own requests (for payment)
CREATE POLICY "Patients can update their own service requests for payment"
ON public.service_requests
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.userinfo
        WHERE userinfo.user_email = (SELECT auth.email())
        AND userinfo.user_roles = 'Patient'
        AND userinfo.user_email = service_requests.patient_email
    )
);

-- Policy: Lab/XRay/Ultrasound/Audiometry can UPDATE requests (mark as in_progress/completed)
CREATE POLICY "Service providers can update service requests"
ON public.service_requests
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.userinfo
        WHERE userinfo.user_email = (SELECT auth.email())
        AND (
            (userinfo.user_roles = 'Lab' AND service_requests.service_type = 'lab')
            OR (userinfo.user_roles = 'X Ray' AND service_requests.service_type = 'xray')
            OR (userinfo.user_roles = 'Ultrasound' AND service_requests.service_type = 'ultrasound')
            OR (userinfo.user_roles = 'Audiometry' AND service_requests.service_type = 'audiometry')
            OR userinfo.user_roles = 'Admin'
        )
    )
);

-- =====================================================
-- 5. RLS POLICIES FOR PATIENT_STATUS_CHANGE_LOGS TABLE
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Secretaries and Admins can log status changes" ON public.patient_status_change_logs;
DROP POLICY IF EXISTS "Authenticated users can view status change logs" ON public.patient_status_change_logs;
DROP POLICY IF EXISTS "Patients can revert their status changes" ON public.patient_status_change_logs;

-- Policy: Secretaries and Admins can INSERT logs
CREATE POLICY "Secretaries and Admins can log status changes"
ON public.patient_status_change_logs
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.userinfo
        WHERE userinfo.user_email = (SELECT auth.email())
        AND userinfo.user_roles IN ('Secretary', 'Admin')
    )
);

-- Policy: Everyone can SELECT logs (for viewing history)
CREATE POLICY "Authenticated users can view status change logs"
ON public.patient_status_change_logs
FOR SELECT
TO authenticated
USING (true);

-- Policy: Patients can UPDATE their own logs (to revert status)
CREATE POLICY "Patients can revert their status changes"
ON public.patient_status_change_logs
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.userinfo
        WHERE userinfo.user_email = (SELECT auth.email())
        AND userinfo.user_roles = 'Patient'
        AND userinfo.user_email = patient_status_change_logs.patient_email
        AND patient_status_change_logs.can_patient_revert = true
        AND patient_status_change_logs.patient_revert_deadline > now()
        AND patient_status_change_logs.patient_reverted_at IS NULL
    )
);

-- =====================================================
-- 6. ADD MISSING COLUMNS TO SERVICE_REQUESTS IF TABLE EXISTS
-- =====================================================
DO $$
BEGIN
    -- Add service_subtype column if it doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_requests') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'service_requests' 
            AND column_name = 'service_subtype'
        ) THEN
            ALTER TABLE public.service_requests 
            ADD COLUMN service_subtype text;
        END IF;
        
        -- Add price column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'service_requests' 
            AND column_name = 'price'
        ) THEN
            ALTER TABLE public.service_requests 
            ADD COLUMN price numeric(10, 2);
        END IF;
        
        -- Add currency column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'service_requests' 
            AND column_name = 'currency'
        ) THEN
            ALTER TABLE public.service_requests 
            ADD COLUMN currency text DEFAULT 'ILS';
        END IF;
        
        -- Add payment_status column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'service_requests' 
            AND column_name = 'payment_status'
        ) THEN
            ALTER TABLE public.service_requests 
            ADD COLUMN payment_status text DEFAULT 'pending';
        END IF;
        
        -- Add payment_booking_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'service_requests' 
            AND column_name = 'payment_booking_id'
        ) THEN
            ALTER TABLE public.service_requests 
            ADD COLUMN payment_booking_id text;
        END IF;
        
        -- Update status constraint to include payment_required
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'service_requests' 
            AND constraint_name = 'service_requests_status_check'
        ) THEN
            ALTER TABLE public.service_requests 
            DROP CONSTRAINT IF EXISTS service_requests_status_check;
        END IF;
        
        ALTER TABLE public.service_requests 
        ADD CONSTRAINT service_requests_status_check 
        CHECK (status IN ('pending', 'secretary_confirmed', 'payment_required', 'in_progress', 'completed', 'cancelled'));
        
        -- Add payment_status constraint
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'service_requests' 
            AND constraint_name = 'service_requests_payment_status_check'
        ) THEN
            ALTER TABLE public.service_requests 
            ADD CONSTRAINT service_requests_payment_status_check 
            CHECK (payment_status IN ('pending', 'paid', 'completed', 'failed', 'refunded'));
        END IF;
    END IF;
END $$;

-- =====================================================
-- 7. ADD IS_ACTIVE COLUMN TO USERINFO IF NOT EXISTS
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'userinfo' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.userinfo 
        ADD COLUMN is_active boolean DEFAULT true;
    END IF;
END $$;

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SEQUENCE service_requests_id_seq TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.service_requests TO authenticated;
GRANT USAGE ON SEQUENCE patient_status_change_logs_id_seq TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.patient_status_change_logs TO authenticated;

-- =====================================================
-- 8. CREATE SERVICE PRICING TABLE
-- =====================================================
CREATE SEQUENCE IF NOT EXISTS service_pricing_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS public.service_pricing (
    id bigint NOT NULL DEFAULT nextval('service_pricing_id_seq'::regclass),
    service_type text NOT NULL CHECK (service_type IN ('xray', 'ultrasound', 'lab', 'audiometry')),
    service_subtype text,
    service_name text NOT NULL,
    service_name_ar text,
    price numeric(10, 2) NOT NULL,
    currency text DEFAULT 'ILS',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT service_pricing_pkey PRIMARY KEY (id),
    CONSTRAINT service_pricing_unique UNIQUE (service_type, service_subtype)
);

ALTER SEQUENCE service_pricing_id_seq OWNED BY service_pricing.id;

-- Insert Ultrasound pricing
INSERT INTO public.service_pricing (service_type, service_subtype, service_name, service_name_ar, price, currency) VALUES
('ultrasound', 'neck', 'Neck Ultrasound', 'موجات فوق صوتية للرقبة', 70, 'ILS'),
('ultrasound', 'head', 'Head Ultrasound', 'موجات فوق صوتية للرأس', 70, 'ILS'),
('ultrasound', 'abdomen', 'Abdomen Ultrasound (Kidney, Spleen, Liver, Stomach)', 'موجات فوق صوتية للبطن (كلى، طحال، كبد، معدة)', 70, 'ILS'),
('ultrasound', 'brain', 'Brain Ultrasound', 'موجات فوق صوتية للدماغ', 70, 'ILS'),
('ultrasound', 'scrotum', 'Scrotum Ultrasound', 'موجات فوق صوتية للخصية', 70, 'ILS'),
('ultrasound', 'echo', 'Echocardiogram (Echo)', 'فحص القلب بالموجات فوق الصوتية', 180, 'ILS')
ON CONFLICT (service_type, service_subtype) DO UPDATE SET
    service_name = EXCLUDED.service_name,
    service_name_ar = EXCLUDED.service_name_ar,
    price = EXCLUDED.price,
    updated_at = now();

-- Insert Audiometry pricing
INSERT INTO public.service_pricing (service_type, service_subtype, service_name, service_name_ar, price, currency) VALUES
('audiometry', 'abr_screening', 'Automated ABR Screening', 'فحص السمع الآلي (ABR)', 40, 'ILS')
ON CONFLICT (service_type, service_subtype) DO UPDATE SET
    service_name = EXCLUDED.service_name,
    service_name_ar = EXCLUDED.service_name_ar,
    price = EXCLUDED.price,
    updated_at = now();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_service_pricing_service_type ON public.service_pricing(service_type);
CREATE INDEX IF NOT EXISTS idx_service_pricing_active ON public.service_pricing(is_active);

-- Enable RLS on service_pricing
ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active service pricing" ON public.service_pricing;
DROP POLICY IF EXISTS "Admin can manage service pricing" ON public.service_pricing;

-- Policy: Everyone can view active pricing
CREATE POLICY "Anyone can view active service pricing"
ON public.service_pricing
FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Admin can manage pricing
CREATE POLICY "Admin can manage service pricing"
ON public.service_pricing
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.userinfo
        WHERE userinfo.user_email = (SELECT auth.email())
        AND userinfo.user_roles = 'Admin'
    )
);

GRANT USAGE ON SEQUENCE service_pricing_id_seq TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.service_pricing TO authenticated;

-- =====================================================
-- 9. ADD TRIGGER TO UPDATE UPDATED_AT TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION update_service_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS service_requests_updated_at ON public.service_requests;

-- Create the trigger
CREATE TRIGGER service_requests_updated_at
    BEFORE UPDATE ON public.service_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_service_requests_updated_at();

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Service requests flow:
--    - Doctor creates request -> status: 'pending'
--    - Secretary confirms -> status: 'secretary_confirmed'
--    - Service provider (Lab/XRay/etc) starts -> status: 'in_progress'
--    - Service provider completes -> status: 'completed'
--
-- 2. Patient status changes:
--    - Secretary changes patient status (active/not active)
--    - Patient has 5 minutes to revert the change
--    - Log is created with can_patient_revert = true
--    - Patient can revert within 5 minutes
--
-- 3. Notifications are created via the notification system
--    when requests are created, confirmed, or completed.
