-- =====================================================
-- LAB SERVICE PRICING - Medical Technology Syndicate Palestine 2023
-- =====================================================
-- This script inserts all lab tests with their upper prices
-- Organized by categories from the official price list
-- =====================================================

-- 1. HEMATOLOGY & COAGULATION (15 tests)
INSERT INTO public.service_pricing (service_type, service_subtype, service_name, service_name_ar, price, currency, is_active) VALUES
('lab', 'aptt', 'Activated Partial Thromboplastin Time (APTT)', 'وقت الثرومبوبلاستين الجزئي المنشط (APTT)', 25, 'ILS', true),
('lab', 'bleeding_time', 'Bleeding Time', 'وقت النزيف', 10, 'ILS', true),
('lab', 'blood_film_staining', 'Blood Film (Staining)', 'لطخة الدم (الصبغ)', 25, 'ILS', true),
('lab', 'blood_film_reading', 'Blood Film (Reading)', 'لطخة الدم (القراءة)', 50, 'ILS', true),
('lab', 'blood_group_rh', 'Blood Group & RH', 'فصيلة الدم وعامل الريزوس', 10, 'ILS', true),
('lab', 'clotting_time', 'Clotting Time', 'وقت التجلط', 10, 'ILS', true),
('lab', 'cbc', 'CBC', 'تعداد الدم الكامل', 20, 'ILS', true),
('lab', 'esr', 'ESR', 'معدل ترسيب كريات الدم الحمراء', 10, 'ILS', true),
('lab', 'fibrinogen', 'Fibrinogen', 'الفيبرينوجين', 35, 'ILS', true),
('lab', 'lupus_anticoagulant', 'Lupus Anti-Coagulant', 'مضاد الذئبة للتخثر', 50, 'ILS', true),
('lab', 'le_cells', 'LE Cells', 'خلايا الذئبة', 50, 'ILS', true),
('lab', 'prothrombin_time', 'Prothrombin Time (PT)', 'وقت البروثرومبين (PT)', 25, 'ILS', true),
('lab', 'reticulocyte_count', 'Reticulocyte Count', 'عد الخلايا الشبكية', 30, 'ILS', true),
('lab', 'rvvt_test', 'RVVT Test (dRVVT)', 'اختبار RVVT', 50, 'ILS', true),
('lab', 'thrombophilia_6_genes', 'Thrombophilia (6) genes', 'تخثر الدم الوراثي (6 جينات)', 200, 'ILS', true)
ON CONFLICT (service_type, service_subtype) DO UPDATE SET
    service_name = EXCLUDED.service_name,
    service_name_ar = EXCLUDED.service_name_ar,
    price = EXCLUDED.price,
    updated_at = now();

-- 2. SEROLOGY & VIROLOGY (57 tests)
INSERT INTO public.service_pricing (service_type, service_subtype, service_name, service_name_ar, price, currency, is_active) VALUES
('lab', 'anca_pr3', 'ANCA-PR3', 'ANCA-PR3', 80, 'ILS', true),
('lab', 'anca_mpo', 'ANCA-MPO', 'ANCA-MPO', 80, 'ILS', true),
('lab', 'anti_cardiolipin_igg', 'Anti-cardiolipin IgG', 'مضاد الكارديوليبين IgG', 50, 'ILS', true),
('lab', 'anti_cardiolipin_igm', 'Anti-cardiolipin IgM', 'مضاد الكارديوليبين IgM', 50, 'ILS', true),
('lab', 'anti_ccp', 'Anti-CCP', 'مضاد CCP', 70, 'ILS', true),
('lab', 'anti_dna', 'Anti-DNA', 'مضاد DNA', 50, 'ILS', true),
('lab', 'anti_endomysial_antibodies', 'Anti Endomysial Antibodies', 'مضاد الأجسام المضادة للغشاء العضلي', 80, 'ILS', true),
('lab', 'anti_ttg', 'Anti-tissue transglutaminase (Anti TTG)', 'مضاد ناقلة الغلوتامين (Anti TTG)', 80, 'ILS', true),
('lab', 'ama', 'AMA', 'AMA', 100, 'ILS', true),
('lab', 'asma', 'ASMA', 'ASMA', 100, 'ILS', true),
('lab', 'ana_profile', 'ANA Profile (9 test or 13 test or 19 test)', 'ملف ANA (9 أو 13 أو 19 اختبار)', 200, 'ILS', true),
('lab', 'anti_phospholipid_igg', 'Anti-Phospholipid IgG', 'مضاد الفوسفوليبيد IgG', 50, 'ILS', true),
('lab', 'anti_phospholipid_igm', 'Anti-Phospholipid IgM', 'مضاد الفوسفوليبيد IgM', 50, 'ILS', true),
('lab', 'ana', 'Anti-Nuclear Antibodies (ANA)', 'مضاد النوى (ANA)', 50, 'ILS', true),
('lab', 'anti_sperm_antibodies', 'Anti-Sperm Antibodies (Serum or semen)', 'مضاد الحيوانات المنوية (مصل أو سائل منوي)', 80, 'ILS', true),
('lab', 'asot', 'ASOT', 'ASOT', 15, 'ILS', true),
('lab', 'anti_tpo_antibodies', 'Anti-TPO Antibodies', 'مضاد TPO', 60, 'ILS', true),
('lab', 'brucella_antibodies', 'Brucella Antibodies (Rose Bengal)', 'مضاد البروسيلا (روز بنغال)', 15, 'ILS', true),
('lab', 'crp', 'CRP', 'البروتين التفاعلي C', 15, 'ILS', true),
('lab', 'c3', 'C3', 'C3', 50, 'ILS', true),
('lab', 'c4', 'C4', 'C4', 50, 'ILS', true),
('lab', 'chlamydia_trachomatics_iga', 'Chlamydia trachomatics IgA', 'المتدثرة IgA', 80, 'ILS', true),
('lab', 'chlamydia_trachomatics_igg', 'Chlamydia trachomatics IgG', 'المتدثرة IgG', 50, 'ILS', true),
('lab', 'chlamydia_trachomatics_igm', 'Chlamydia trachomatics IgM', 'المتدثرة IgM', 50, 'ILS', true),
('lab', 'cmv_igg', 'CMV-IgG', 'فيروس مضخم الخلايا IgG', 50, 'ILS', true),
('lab', 'cmv_igm', 'CMV-IgM', 'فيروس مضخم الخلايا IgM', 50, 'ILS', true),
('lab', 'ebv_igg', 'EBV-IgG', 'فيروس إبشتاين بار IgG', 50, 'ILS', true),
('lab', 'ebv_igm', 'EBV-IgM', 'فيروس إبشتاين بار IgM', 60, 'ILS', true),
('lab', 'hbeag', 'HbeAg', 'HbeAg', 60, 'ILS', true),
('lab', 'hbsabs', 'HbsAbs', 'HbsAbs', 60, 'ILS', true),
('lab', 'hbc_igm', 'Hbc IgM', 'Hbc IgM', 60, 'ILS', true),
('lab', 'hbc_total', 'HBc Total', 'HBc الكلي', 60, 'ILS', true),
('lab', 'helicobacter_pylori_igg', 'Helicobacter pylori IgG', 'البكتيريا الحلزونية IgG', 40, 'ILS', true),
('lab', 'helicobacter_pylori_igm', 'Helicobacter pylori IgM', 'البكتيريا الحلزونية IgM', 40, 'ILS', true),
('lab', 'helicobacter_pylori_ag_stool_qualitative', 'Helicobacter pylori Ag (in Stool) (Qualitative)', 'مستضد البكتيريا الحلزونية في البراز (نوعي)', 30, 'ILS', true),
('lab', 'helicobacter_pylori_ag_stool_quantitative', 'Helicobacter pylori Ag in (Stool) (Quantitative)', 'مستضد البكتيريا الحلزونية في البراز (كمي)', 50, 'ILS', true),
('lab', 'hepatitis_a_igm', 'Hepatitis A Virus IgM (HAV IgM)', 'فيروس التهاب الكبد أ IgM', 50, 'ILS', true),
('lab', 'hbsag', 'HbsAg', 'HbsAg', 35, 'ILS', true),
('lab', 'hepatitis_c_virus', 'Hepatitis C Virus (HCV)', 'فيروس التهاب الكبد C', 35, 'ILS', true),
('lab', 'hiv', 'HIV', 'فيروس نقص المناعة البشرية', 35, 'ILS', true),
('lab', 'immunoglobulin_ige', 'Immunglobulin IgE', 'الغلوبيولين المناعي IgE', 50, 'ILS', true),
('lab', 'immunoglobulin_igg', 'Immunglobulin IgG', 'الغلوبيولين المناعي IgG', 50, 'ILS', true),
('lab', 'immunoglobulin_igm', 'Immunglobulin IgM', 'الغلوبيولين المناعي IgM', 50, 'ILS', true),
('lab', 'immunoglobulin_iga', 'Immunglobulin IgA', 'الغلوبيولين المناعي IgA', 50, 'ILS', true),
('lab', 'paul_bunnell', 'Paul Bunnell (Mono Spot Test)', 'بول بونيل (اختبار البقعة الأحادية)', 50, 'ILS', true),
('lab', 'pregnancy_test', 'Pregnancy Test', 'اختبار الحمل', 15, 'ILS', true),
('lab', 'proteus_ox19', 'Proteus OX19', 'البروتيوس OX19', 15, 'ILS', true),
('lab', 'rpr', 'Rapid Plasma Reagin (RPR)', 'رياجين البلازما السريع (RPR)', 50, 'ILS', true),
('lab', 'rf_latex_test', 'R.F Latex Test', 'اختبار عامل الروماتويد اللاتكس', 15, 'ILS', true),
('lab', 'rose_waler', 'Rose Waler', 'روز والر', 25, 'ILS', true),
('lab', 'rubella_igg', 'Rubella IgG', 'الحصبة الألمانية IgG', 50, 'ILS', true),
('lab', 'rubella_igm', 'Rubella IgM', 'الحصبة الألمانية IgM', 50, 'ILS', true),
('lab', 'thyroglobulin_abs', 'Thyroglobulin Abs', 'مضاد الثايروغلوبيولين', 60, 'ILS', true),
('lab', 'toxoplasmosis_igg', 'Toxoplasmosis IgG', 'داء المقوسات IgG', 50, 'ILS', true),
('lab', 'toxoplasmosis_igm', 'Toxoplasmosis IgM', 'داء المقوسات IgM', 50, 'ILS', true),
('lab', 'vdrl', 'VDRL', 'VDRL', 40, 'ILS', true),
('lab', 'widal_test', 'Widal Test', 'اختبار فيدال', 30, 'ILS', true)
ON CONFLICT (service_type, service_subtype) DO UPDATE SET
    service_name = EXCLUDED.service_name,
    service_name_ar = EXCLUDED.service_name_ar,
    price = EXCLUDED.price,
    updated_at = now();

-- 3. CHEMISTRY (34 tests)
INSERT INTO public.service_pricing (service_type, service_subtype, service_name, service_name_ar, price, currency, is_active) VALUES
('lab', 'albumin', 'Albumin', 'الألبومين', 10, 'ILS', true),
('lab', 'alkaline_phosphatase', 'Alkaline Phosphatase(ALP)', 'الفوسفاتاز القلوي', 15, 'ILS', true),
('lab', 'alt', 'ALT (SGPT)', 'ألانين أمينو ترانسفيراز', 15, 'ILS', true),
('lab', 'amylase', 'Amylase', 'الأميلاز', 25, 'ILS', true),
('lab', 'ast', 'AST (SGOT)', 'أسبارتات أمينو ترانسفيراز', 15, 'ILS', true),
('lab', 'bilirubin_direct', 'Bilirubin Direct', 'البيليروبين المباشر', 10, 'ILS', true),
('lab', 'bilirubin_total', 'Bilirubin Total', 'البيليروبين الكلي', 10, 'ILS', true),
('lab', 'ck_mb', 'Ck-MB', 'الكرياتين كيناز MB', 50, 'ILS', true),
('lab', 'calcium_serum', 'Calcium (Seram)', 'الكالسيوم (مصل)', 20, 'ILS', true),
('lab', 'calcium_urine', 'Calcium (Urine)', 'الكالسيوم (البول)', 20, 'ILS', true),
('lab', 'chloride', 'Chloride', 'الكلوريد', 20, 'ILS', true),
('lab', 'cholesterol_total', 'Cholesterol Total', 'الكولسترول الكلي', 10, 'ILS', true),
('lab', 'creatinine_serum', 'Creatinine (Serum)', 'الكرياتينين (مصل)', 10, 'ILS', true),
('lab', 'creatinine_urine', 'Creatinine (Urine)', 'الكرياتينين (البول)', 20, 'ILS', true),
('lab', 'cpk', 'CPK', 'الكرياتين كيناز', 25, 'ILS', true),
('lab', 'fructose_semen', 'Fructose-semen', 'الفركتوز في السائل المنوي', 40, 'ILS', true),
('lab', 'ggt', 'GGT', 'غاما غلوتاميل ترانسفيراز', 25, 'ILS', true),
('lab', 'glucose', 'Glucose', 'الجلوكوز', 10, 'ILS', true),
('lab', 'hdl_cholesterol', 'HDL Cholesterol', 'الكولسترول عالي الكثافة', 25, 'ILS', true),
('lab', 'hba1c', 'HbA1C', 'الهيموجلوبين السكري', 30, 'ILS', true),
('lab', 'iron_serum', 'Iron Serum', 'الحديد في المصل', 20, 'ILS', true),
('lab', 'iron_binding_capacity_total', 'Iron Binding Capacity - Total', 'القدرة الكلية على ربط الحديد', 20, 'ILS', true),
('lab', 'ldh', 'LDH', 'نازع هيدروجين اللاكتات', 20, 'ILS', true),
('lab', 'ldl_cholesterol', 'LDL Cholesterol (Measurement not Calculate)', 'الكولسترول منخفض الكثافة (قياس وليس حساب)', 20, 'ILS', true),
('lab', 'magnesium', 'Magnesium', 'المغنيسيوم', 20, 'ILS', true),
('lab', 'phosphorus', 'Phosphorus', 'الفسفور', 15, 'ILS', true),
('lab', 'potassium', 'Potassium(K)', 'البوتاسيوم', 20, 'ILS', true),
('lab', 'protein_24hr_urine', 'Protein 24 hr. urine', 'البروتين في البول 24 ساعة', 30, 'ILS', true),
('lab', 'protein_total_serum', 'Protein Total (Serum)', 'البروتين الكلي (مصل)', 10, 'ILS', true),
('lab', 'sodium', 'Sodium (Na)', 'الصوديوم', 20, 'ILS', true),
('lab', 'triglycerides', 'Triglycerides', 'الدهون الثلاثية', 10, 'ILS', true),
('lab', 'urea', 'Urea', 'اليوريا', 10, 'ILS', true),
('lab', 'uric_acid', 'Uric Acid', 'حمض البوليك', 10, 'ILS', true),
('lab', 'electrolyte', 'Electrolyte (Na, K, Ca, Cl)', 'الشوارد (صوديوم، بوتاسيوم، كالسيوم، كلوريد)', 45, 'ILS', true)
ON CONFLICT (service_type, service_subtype) DO UPDATE SET
    service_name = EXCLUDED.service_name,
    service_name_ar = EXCLUDED.service_name_ar,
    price = EXCLUDED.price,
    updated_at = now();

-- 4. TUMOR MARKER & DRUG LEVEL & SPECIAL TESTS (15 tests)
INSERT INTO public.service_pricing (service_type, service_subtype, service_name, service_name_ar, price, currency, is_active) VALUES
('lab', 'afp', 'Alpha Feto Protein (aFP)', 'ألفا فيتوبروتين', 60, 'ILS', true),
('lab', 'vitamin_b12', 'Vitamin B12', 'فيتامين B12', 50, 'ILS', true),
('lab', 'ca_125', 'CA 125', 'CA 125', 55, 'ILS', true),
('lab', 'ca_15_3', 'CA 15-3', 'CA 15-3', 55, 'ILS', true),
('lab', 'ca_19_9', 'CA 19-9', 'CA 19-9', 55, 'ILS', true),
('lab', 'cea', 'CEA', 'مستضد السرطان الجنيني', 55, 'ILS', true),
('lab', 'd_dimer', 'D dimer', 'D-دايمر', 100, 'ILS', true),
('lab', 'depakine', 'Depakine (Valporic Acid)', 'ديباكين (حمض الفالبوريك)', 50, 'ILS', true),
('lab', 'epanutine', 'Epanutine (Phenytoin)', 'إيبانوتين (الفينيتوين)', 50, 'ILS', true),
('lab', 'luminal', 'Luminal (Phenobarbital)', 'لومينال (الفينوباربيتال)', 50, 'ILS', true),
('lab', 'psa', 'Prostatic Specific Antigen (PSA)', 'مستضد البروستات النوعي', 50, 'ILS', true),
('lab', 'tegretol', 'Tegretol (Carbamazepine)', 'تيجريتول (الكاربامازيبين)', 50, 'ILS', true),
('lab', 'troponin_i', 'Troponin I', 'التروبونين I', 60, 'ILS', true),
('lab', 'vma', 'VMA', 'VMA', 100, 'ILS', true),
('lab', 'free_psa', 'Free PSA', 'PSA الحر', 60, 'ILS', true)
ON CONFLICT (service_type, service_subtype) DO UPDATE SET
    service_name = EXCLUDED.service_name,
    service_name_ar = EXCLUDED.service_name_ar,
    price = EXCLUDED.price,
    updated_at = now();

-- 5. HORMONES (29 tests)
INSERT INTO public.service_pricing (service_type, service_subtype, service_name, service_name_ar, price, currency, is_active) VALUES
('lab', '17_hydroxy_progesterone', '17-Hydroxy progesterone', '17-هيدروكسي بروجيسترون', 70, 'ILS', true),
('lab', 'acth', 'Adrenocorticotropic Hormone (ACTH)', 'الهرمون الموجه لقشرة الكظر', 80, 'ILS', true),
('lab', 'aldosterone', 'Aldosterone', 'الألدوستيرون', 80, 'ILS', true),
('lab', 'androstenedione', 'Androstenedione', 'الأندروستينيون', 80, 'ILS', true),
('lab', 'amh', 'AMH', 'الهرمون المضاد للمولر', 100, 'ILS', true),
('lab', 'cortisol', 'Cortisol', 'الكورتيزول', 40, 'ILS', true),
('lab', 'c_peptide', 'C-Piptide', 'C-ببتيد', 60, 'ILS', true),
('lab', 'dhea_s', 'DHEA-S', 'DHEA-S', 50, 'ILS', true),
('lab', 'e2_estradiol', 'E2 (Estradiol)', 'الإستريول (E2)', 40, 'ILS', true),
('lab', 'ferritin', 'Ferritin', 'الفيريتين', 50, 'ILS', true),
('lab', 'folic_acid', 'Folic Acid', 'حمض الفوليك', 50, 'ILS', true),
('lab', 'fsh', 'FSH', 'الهرمون المنبه للجريب', 35, 'ILS', true),
('lab', 'growth_hormone', 'Growth hormone', 'هرمون النمو', 40, 'ILS', true),
('lab', 'bhcg', 'Human Chorionic Gonadotrophic (BHCG)', 'الهرمون الموجه للغدد التناسلية المشيمية', 40, 'ILS', true),
('lab', 'lh', 'LH', 'الهرمون اللوتيني', 35, 'ILS', true),
('lab', 'pth', 'PTH', 'الهرمون الجار درقي', 50, 'ILS', true),
('lab', 'progesterone', 'Progesterone', 'البروجيسترون', 35, 'ILS', true),
('lab', 'prolactin', 'prolacin', 'البرولاكتين', 35, 'ILS', true),
('lab', 'testosterone', 'Testosterone', 'التستوستيرون', 35, 'ILS', true),
('lab', 'testosterone_free', 'Testosterone Free', 'التستوستيرون الحر', 50, 'ILS', true),
('lab', 'thyroglobulin_level', 'Thyroglobulin Level', 'مستوى الثايروغلوبيولين', 100, 'ILS', true),
('lab', 'tsh', 'TSH', 'الهرمون المنبه للغدة الدرقية', 35, 'ILS', true),
('lab', 'ft4', 'Thyroxin Free (FT4)', 'الثيروكسين الحر (FT4)', 35, 'ILS', true),
('lab', 't4', 'Thyroxin Total (T4)', 'الثيروكسين الكلي (T4)', 35, 'ILS', true),
('lab', 'ft3', 'Triiodothyronine Free (FT3)', 'ثلاثي يود الثيرونين الحر (FT3)', 35, 'ILS', true),
('lab', 't3', 'Triiodothyronine Total (T3)', 'ثلاثي يود الثيرونين الكلي (T3)', 35, 'ILS', true),
('lab', 'renin', 'Renin', 'الرينين', 80, 'ILS', true),
('lab', 'gastrine_17', 'Gastrine-17', 'الغاسترين-17', 80, 'ILS', true),
('lab', 'vitamin_d3_d2', '25-OH Vitamine D3/D2', 'فيتامين D3/D2', 60, 'ILS', true)
ON CONFLICT (service_type, service_subtype) DO UPDATE SET
    service_name = EXCLUDED.service_name,
    service_name_ar = EXCLUDED.service_name_ar,
    price = EXCLUDED.price,
    updated_at = now();

-- 6. MICROBIOLOGY & ROUTINE (12 tests)
INSERT INTO public.service_pricing (service_type, service_subtype, service_name, service_name_ar, price, currency, is_active) VALUES
('lab', 'calprotectin_qualitative', 'Calprotectin (Qualitative)', 'الكالبروتكتين (نوعي)', 60, 'ILS', true),
('lab', 'calprotectin_quantitative', 'Calprotectin (Quantitative)', 'الكالبروتكتين (كمي)', 80, 'ILS', true),
('lab', 'fungal_culture', 'Fungal Culture', 'زرع الفطريات', 100, 'ILS', true),
('lab', 'koh', 'KOH', 'KOH', 25, 'ILS', true),
('lab', 'gram_stain', 'Gram Stain', 'صبغة جرام', 35, 'ILS', true),
('lab', 'occult_blood_stool', 'Occult Blood (Stool)', 'الدم الخفي في البراز', 20, 'ILS', true),
('lab', 'routine_cultures_aerobic', 'Routine Cultures (Aerobic)', 'الزرع الروتيني (هوائي)', 30, 'ILS', true),
('lab', 'routine_cultures_aerobic_anaerobic', 'Routine Cultures (Aerobic an Anaerobic)', 'الزرع الروتيني (هوائي ولا هوائي)', 40, 'ILS', true),
('lab', 'stool_culture', 'Stool Culture', 'زرع البراز', 60, 'ILS', true),
('lab', 'stool_analysis', 'stool Analysis', 'تحليل البراز', 10, 'ILS', true),
('lab', 'urine_analysis', 'Urine Analysis', 'تحليل البول', 10, 'ILS', true),
('lab', 'semen_analysis', 'Semen Analysis', 'تحليل السائل المنوي', 20, 'ILS', true)
ON CONFLICT (service_type, service_subtype) DO UPDATE SET
    service_name = EXCLUDED.service_name,
    service_name_ar = EXCLUDED.service_name_ar,
    price = EXCLUDED.price,
    updated_at = now();

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total: 162 lab tests inserted
-- Categories:
--   - Hematology & Coagulation: 15 tests
--   - Serology & Virology: 57 tests
--   - Chemistry: 34 tests
--   - Tumor Marker & Drug Level & Special Tests: 15 tests
--   - Hormones: 29 tests
--   - Microbiology & Routine: 12 tests
-- All prices are upper prices from Medical Technology Syndicate Palestine 2023
-- =====================================================

