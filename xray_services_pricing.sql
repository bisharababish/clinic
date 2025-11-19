-- =====================================================
-- X-RAY SERVICE PRICING - Insert Statements
-- =====================================================
-- This script adds X-ray service subtypes with pricing
-- All services are priced at 40 ILS (shekels)
-- =====================================================

-- First, remove all 80 shekel X-ray services (sinus X-rays)
DELETE FROM public.service_pricing 
WHERE service_type = 'xray' 
AND price = 80;

-- Insert X-Ray pricing (40 shekels only - the services you specified)
INSERT INTO public.service_pricing (service_type, service_subtype, service_name, service_name_ar, price, currency) VALUES
('xray', 'head_neck', 'Head & Neck', 'الرأس والرقبة', 40, 'ILS'),
('xray', 'chest', 'Chest', 'الصدر', 40, 'ILS'),
('xray', 'abdomen', 'Abdomen', 'البطن', 40, 'ILS'),
('xray', 'hip', 'Hip', 'الورك', 40, 'ILS'),
('xray', 'leg_left', 'Leg (Left)', 'الساق (يسار)', 40, 'ILS'),
('xray', 'leg_right', 'Leg (Right)', 'الساق (يمين)', 40, 'ILS'),
('xray', 'spine', 'Spine', 'العمود الفقري', 40, 'ILS')
ON CONFLICT (service_type, service_subtype) DO UPDATE SET
    service_name = EXCLUDED.service_name,
    service_name_ar = EXCLUDED.service_name_ar,
    price = EXCLUDED.price,
    updated_at = now();

