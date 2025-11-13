import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from '../i18n';
import { ChevronDown, ChevronUp } from "lucide-react";

interface BodyPartDropdownSelectorProps {
    selectedBodyParts: string[];
    onBodyPartsSelect: (bodyParts: string[]) => void;
}

const BodyPartDropdownSelector: React.FC<BodyPartDropdownSelectorProps> = ({
    selectedBodyParts,
    onBodyPartsSelect
}) => {
    const { t } = useTranslation();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const bodyPartCategories = {
        skull: {
            label: i18n.language === 'ar' ? 'الجمجمة' : 'Skull',
            parts: [
                { value: "skull", label: i18n.language === 'ar' ? 'الجمجمة' : 'Skull' },
                { value: "frontal_bone", label: i18n.language === 'ar' ? 'العظم الجبهي' : 'Frontal Bone' },
                { value: "left_parietal_bone", label: i18n.language === 'ar' ? 'العظم الجداري الأيسر' : 'Left Parietal Bone' },
                { value: "right_parietal_bone", label: i18n.language === 'ar' ? 'العظم الجداري الأيمن' : 'Right Parietal Bone' },
                { value: "left_temporal_bone", label: i18n.language === 'ar' ? 'العظم الصدغي الأيسر' : 'Left Temporal Bone' },
                { value: "right_temporal_bone", label: i18n.language === 'ar' ? 'العظم الصدغي الأيمن' : 'Right Temporal Bone' },
                { value: "occipital_bone", label: i18n.language === 'ar' ? 'العظم القذالي' : 'Occipital Bone' },
                { value: "sphenoid_bone", label: i18n.language === 'ar' ? 'العظم الوتدي' : 'Sphenoid Bone' },
                { value: "ethmoid_bone", label: i18n.language === 'ar' ? 'العظم الغربالي' : 'Ethmoid Bone' },
                { value: "paranasal_sinus", label: i18n.language === 'ar' ? 'الجيوب الأنفية' : 'Paranasal Sinus' }
            ]
        },
        facialBones: {
            label: i18n.language === 'ar' ? 'العظام الوجهية' : 'Facial Bones',
            parts: [
                { value: "left_nasal_bone", label: i18n.language === 'ar' ? 'العظم الأنفي الأيسر' : 'Left Nasal Bone' },
                { value: "right_nasal_bone", label: i18n.language === 'ar' ? 'العظم الأنفي الأيمن' : 'Right Nasal Bone' },
                { value: "left_maxilla", label: i18n.language === 'ar' ? 'الفك العلوي الأيسر' : 'Left Maxilla' },
                { value: "right_maxilla", label: i18n.language === 'ar' ? 'الفك العلوي الأيمن' : 'Right Maxilla' },
                { value: "mandible", label: i18n.language === 'ar' ? 'الفك السفلي' : 'Mandible (Lower Jaw)' },
                { value: "left_zygomatic_bone", label: i18n.language === 'ar' ? 'العظم الوجني الأيسر' : 'Left Zygomatic Bone (Cheekbone)' },
                { value: "right_zygomatic_bone", label: i18n.language === 'ar' ? 'العظم الوجني الأيمن' : 'Right Zygomatic Bone (Cheekbone)' },
                { value: "left_palatine_bone", label: i18n.language === 'ar' ? 'العظم الحنكي الأيسر' : 'Left Palatine Bone' },
                { value: "right_palatine_bone", label: i18n.language === 'ar' ? 'العظم الحنكي الأيمن' : 'Right Palatine Bone' },
                { value: "left_lacrimal_bone", label: i18n.language === 'ar' ? 'العظم الدمعي الأيسر' : 'Left Lacrimal Bone' },
                { value: "right_lacrimal_bone", label: i18n.language === 'ar' ? 'العظم الدمعي الأيمن' : 'Right Lacrimal Bone' },
                { value: "left_inferior_nasal_concha", label: i18n.language === 'ar' ? 'المحارة الأنفية السفلية اليسرى' : 'Left Inferior Nasal Concha' },
                { value: "right_inferior_nasal_concha", label: i18n.language === 'ar' ? 'المحارة الأنفية السفلية اليمنى' : 'Right Inferior Nasal Concha' },
                { value: "vomer", label: i18n.language === 'ar' ? 'الميكعة' : 'Vomer' }
            ]
        },
        cervicalSpine: {
            label: i18n.language === 'ar' ? 'العمود الفقري العنقي' : 'Cervical Spine',
            parts: [
                { value: "cervical_spine", label: i18n.language === 'ar' ? 'العمود الفقري العنقي' : 'Cervical Spine' },
                { value: "c1_atlas", label: i18n.language === 'ar' ? 'الفقرات العنقية الأولى (الأطلس)' : 'C1 (Atlas)' },
                { value: "c2_axis", label: i18n.language === 'ar' ? 'الفقرات العنقية الثانية (المحور)' : 'C2 (Axis)' },
                { value: "c3_vertebra", label: i18n.language === 'ar' ? 'الفقرات العنقية الثالثة' : 'C3 Vertebra' },
                { value: "c4_vertebra", label: i18n.language === 'ar' ? 'الفقرات العنقية الرابعة' : 'C4 Vertebra' },
                { value: "c5_vertebra", label: i18n.language === 'ar' ? 'الفقرات العنقية الخامسة' : 'C5 Vertebra' },
                { value: "c6_vertebra", label: i18n.language === 'ar' ? 'الفقرات العنقية السادسة' : 'C6 Vertebra' },
                { value: "c7_vertebra", label: i18n.language === 'ar' ? 'الفقرات العنقية السابعة' : 'C7 Vertebra' }
            ]
        },
        thoracicSpine: {
            label: i18n.language === 'ar' ? 'العمود الفقري الصدري' : 'Thoracic Spine',
            parts: [
                { value: "thoracic_spine", label: i18n.language === 'ar' ? 'العمود الفقري الصدري' : 'Thoracic Spine' },
                { value: "t1_vertebra", label: i18n.language === 'ar' ? 'الفقرات الصدرية الأولى' : 'T1 Vertebra' },
                { value: "t2_vertebra", label: i18n.language === 'ar' ? 'الفقرات الصدرية الثانية' : 'T2 Vertebra' },
                { value: "t3_vertebra", label: i18n.language === 'ar' ? 'الفقرات الصدرية الثالثة' : 'T3 Vertebra' },
                { value: "t4_vertebra", label: i18n.language === 'ar' ? 'الفقرات الصدرية الرابعة' : 'T4 Vertebra' },
                { value: "t5_vertebra", label: i18n.language === 'ar' ? 'الفقرات الصدرية الخامسة' : 'T5 Vertebra' },
                { value: "t6_vertebra", label: i18n.language === 'ar' ? 'الفقرات الصدرية السادسة' : 'T6 Vertebra' },
                { value: "t7_vertebra", label: i18n.language === 'ar' ? 'الفقرات الصدرية السابعة' : 'T7 Vertebra' },
                { value: "t8_vertebra", label: i18n.language === 'ar' ? 'الفقرات الصدرية الثامنة' : 'T8 Vertebra' },
                { value: "t9_vertebra", label: i18n.language === 'ar' ? 'الفقرات الصدرية التاسعة' : 'T9 Vertebra' },
                { value: "t10_vertebra", label: i18n.language === 'ar' ? 'الفقرات الصدرية العاشرة' : 'T10 Vertebra' },
                { value: "t11_vertebra", label: i18n.language === 'ar' ? 'الفقرات الصدرية الحادية عشرة' : 'T11 Vertebra' },
                { value: "t12_vertebra", label: i18n.language === 'ar' ? 'الفقرات الصدرية الثانية عشرة' : 'T12 Vertebra' }
            ]
        },
        lumbarSpine: {
            label: i18n.language === 'ar' ? 'العمود الفقري القطني' : 'Lumbar Spine',
            parts: [
                { value: "lumbar_spine", label: i18n.language === 'ar' ? 'العمود الفقري القطني' : 'Lumbar Spine' },
                { value: "l1_vertebra", label: i18n.language === 'ar' ? 'الفقرات القطنية الأولى' : 'L1 Vertebra' },
                { value: "l2_vertebra", label: i18n.language === 'ar' ? 'الفقرات القطنية الثانية' : 'L2 Vertebra' },
                { value: "l3_vertebra", label: i18n.language === 'ar' ? 'الفقرات القطنية الثالثة' : 'L3 Vertebra' },
                { value: "l4_vertebra", label: i18n.language === 'ar' ? 'الفقرات القطنية الرابعة' : 'L4 Vertebra' },
                { value: "l5_vertebra", label: i18n.language === 'ar' ? 'الفقرات القطنية الخامسة' : 'L5 Vertebra' },
                { value: "sacrum", label: i18n.language === 'ar' ? 'العجز' : 'Sacrum' },
                { value: "coccyx", label: i18n.language === 'ar' ? 'العصعص' : 'Coccyx (Tailbone)' }
            ]
        },
        sternum: {
            label: i18n.language === 'ar' ? 'عظم القص' : 'Sternum',
            parts: [
                { value: "sternum", label: i18n.language === 'ar' ? 'عظم القص' : 'Sternum' },
                { value: "manubrium", label: i18n.language === 'ar' ? 'قبضة القص' : 'Manubrium' },
                { value: "body_of_sternum", label: i18n.language === 'ar' ? 'جسم القص' : 'Body of Sternum' },
                { value: "xiphoid_process", label: i18n.language === 'ar' ? 'النتوء الخنجري' : 'Xiphoid Process' }
            ]
        },
        ribs: {
            label: i18n.language === 'ar' ? 'الأضلاع' : 'Ribs',
            parts: [
                { value: "ribs", label: i18n.language === 'ar' ? 'الأضلاع' : 'Ribs' },
                { value: "left_1st_rib", label: i18n.language === 'ar' ? 'الضلع الأول الأيسر' : 'Left 1st Rib' },
                { value: "right_1st_rib", label: i18n.language === 'ar' ? 'الضلع الأول الأيمن' : 'Right 1st Rib' },
                { value: "left_2nd_rib", label: i18n.language === 'ar' ? 'الضلع الثاني الأيسر' : 'Left 2nd Rib' },
                { value: "right_2nd_rib", label: i18n.language === 'ar' ? 'الضلع الثاني الأيمن' : 'Right 2nd Rib' },
                { value: "left_3rd_rib", label: i18n.language === 'ar' ? 'الضلع الثالث الأيسر' : 'Left 3rd Rib' },
                { value: "right_3rd_rib", label: i18n.language === 'ar' ? 'الضلع الثالث الأيمن' : 'Right 3rd Rib' },
                { value: "left_4th_rib", label: i18n.language === 'ar' ? 'الضلع الرابع الأيسر' : 'Left 4th Rib' },
                { value: "right_4th_rib", label: i18n.language === 'ar' ? 'الضلع الرابع الأيمن' : 'Right 4th Rib' },
                { value: "left_5th_rib", label: i18n.language === 'ar' ? 'الضلع الخامس الأيسر' : 'Left 5th Rib' },
                { value: "right_5th_rib", label: i18n.language === 'ar' ? 'الضلع الخامس الأيمن' : 'Right 5th Rib' },
                { value: "left_6th_rib", label: i18n.language === 'ar' ? 'الضلع السادس الأيسر' : 'Left 6th Rib' },
                { value: "right_6th_rib", label: i18n.language === 'ar' ? 'الضلع السادس الأيمن' : 'Right 6th Rib' },
                { value: "left_7th_rib", label: i18n.language === 'ar' ? 'الضلع السابع الأيسر' : 'Left 7th Rib' },
                { value: "right_7th_rib", label: i18n.language === 'ar' ? 'الضلع السابع الأيمن' : 'Right 7th Rib' },
                { value: "left_8th_rib", label: i18n.language === 'ar' ? 'الضلع الثامن الأيسر' : 'Left 8th Rib' },
                { value: "right_8th_rib", label: i18n.language === 'ar' ? 'الضلع الثامن الأيمن' : 'Right 8th Rib' },
                { value: "left_9th_rib", label: i18n.language === 'ar' ? 'الضلع التاسع الأيسر' : 'Left 9th Rib' },
                { value: "right_9th_rib", label: i18n.language === 'ar' ? 'الضلع التاسع الأيمن' : 'Right 9th Rib' },
                { value: "left_10th_rib", label: i18n.language === 'ar' ? 'الضلع العاشر الأيسر' : 'Left 10th Rib' },
                { value: "right_10th_rib", label: i18n.language === 'ar' ? 'الضلع العاشر الأيمن' : 'Right 10th Rib' },
                { value: "left_11th_rib", label: i18n.language === 'ar' ? 'الضلع الحادي عشر الأيسر' : 'Left 11th Rib' },
                { value: "right_11th_rib", label: i18n.language === 'ar' ? 'الضلع الحادي عشر الأيمن' : 'Right 11th Rib' },
                { value: "left_12th_rib", label: i18n.language === 'ar' ? 'الضلع الثاني عشر الأيسر' : 'Left 12th Rib' },
                { value: "right_12th_rib", label: i18n.language === 'ar' ? 'الضلع الثاني عشر الأيمن' : 'Right 12th Rib' }
            ]
        },
        shoulder: {
            label: i18n.language === 'ar' ? 'الكتف' : 'Shoulder',
            parts: [
                { value: "left_clavicle", label: i18n.language === 'ar' ? 'الترقوة اليسرى' : 'Left Clavicle' },
                { value: "right_clavicle", label: i18n.language === 'ar' ? 'الترقوة اليمنى' : 'Right Clavicle' },
                { value: "left_scapula", label: i18n.language === 'ar' ? 'الكتف الأيسر' : 'Left Scapula' },
                { value: "right_scapula", label: i18n.language === 'ar' ? 'الكتف الأيمن' : 'Right Scapula' }
            ]
        },
        arm: {
            label: i18n.language === 'ar' ? 'الذراع' : 'Arm',
            parts: [
                { value: "left_humerus", label: i18n.language === 'ar' ? 'عظم العضد الأيسر' : 'Left Humerus' },
                { value: "right_humerus", label: i18n.language === 'ar' ? 'عظم العضد الأيمن' : 'Right Humerus' },
                { value: "left_radius", label: i18n.language === 'ar' ? 'عظم الكعبرة الأيسر' : 'Left Radius' },
                { value: "right_radius", label: i18n.language === 'ar' ? 'عظم الكعبرة الأيمن' : 'Right Radius' },
                { value: "left_ulna", label: i18n.language === 'ar' ? 'عظم الزند الأيسر' : 'Left Ulna' },
                { value: "right_ulna", label: i18n.language === 'ar' ? 'عظم الزند الأيمن' : 'Right Ulna' }
            ]
        },
        hand: {
            label: i18n.language === 'ar' ? 'اليد' : 'Hand',
            parts: [
                { value: "left_hand", label: i18n.language === 'ar' ? 'اليد اليسرى' : 'Left Hand' },
                { value: "right_hand", label: i18n.language === 'ar' ? 'اليد اليمنى' : 'Right Hand' },
                { value: "left_carpals", label: i18n.language === 'ar' ? 'عظام الرسغ اليسرى' : 'Left Carpals' },
                { value: "right_carpals", label: i18n.language === 'ar' ? 'عظام الرسغ اليمنى' : 'Right Carpals' },
                { value: "left_metacarpals", label: i18n.language === 'ar' ? 'عظام المشط اليسرى' : 'Left Metacarpals' },
                { value: "right_metacarpals", label: i18n.language === 'ar' ? 'عظام المشط اليمنى' : 'Right Metacarpals' },
                { value: "left_phalanges", label: i18n.language === 'ar' ? 'عظام السلاميات اليسرى' : 'Left Phalanges' },
                { value: "right_phalanges", label: i18n.language === 'ar' ? 'عظام السلاميات اليمنى' : 'Right Phalanges' }
            ]
        },
        pelvis: {
            label: i18n.language === 'ar' ? 'الحوض' : 'Pelvis',
            parts: [
                { value: "pelvis", label: i18n.language === 'ar' ? 'الحوض' : 'Pelvis' },
                { value: "left_ilium", label: i18n.language === 'ar' ? 'الورك الأيسر' : 'Left Ilium' },
                { value: "right_ilium", label: i18n.language === 'ar' ? 'الورك الأيمن' : 'Right Ilium' },
                { value: "left_ischium", label: i18n.language === 'ar' ? 'عظم الإسك الأيسر' : 'Left Ischium' },
                { value: "right_ischium", label: i18n.language === 'ar' ? 'عظم الإسك الأيمن' : 'Right Ischium' },
                { value: "left_pubis", label: i18n.language === 'ar' ? 'عظم العانة الأيسر' : 'Left Pubis' },
                { value: "right_pubis", label: i18n.language === 'ar' ? 'عظم العانة الأيمن' : 'Right Pubis' },
                { value: "sacroiliac_joint", label: i18n.language === 'ar' ? 'مفصل العجز الحرقفي' : 'Sacroiliac Joint' }
            ]
        },
        thigh: {
            label: i18n.language === 'ar' ? 'الفخذ' : 'Thigh',
            parts: [
                { value: "left_femur", label: i18n.language === 'ar' ? 'عظم الفخذ الأيسر' : 'Left Femur' },
                { value: "right_femur", label: i18n.language === 'ar' ? 'عظم الفخذ الأيمن' : 'Right Femur' },
                { value: "left_patella", label: i18n.language === 'ar' ? 'الرضفة اليسرى' : 'Left Patella' },
                { value: "right_patella", label: i18n.language === 'ar' ? 'الرضفة اليمنى' : 'Right Patella' }
            ]
        },
        leg: {
            label: i18n.language === 'ar' ? 'الساق' : 'Leg',
            parts: [
                { value: "left_tibia", label: i18n.language === 'ar' ? 'عظم الساق الأيسر' : 'Left Tibia' },
                { value: "right_tibia", label: i18n.language === 'ar' ? 'عظم الساق الأيمن' : 'Right Tibia' },
                { value: "left_fibula", label: i18n.language === 'ar' ? 'عظم الشظية الأيسر' : 'Left Fibula' },
                { value: "right_fibula", label: i18n.language === 'ar' ? 'عظم الشظية الأيمن' : 'Right Fibula' }
            ]
        },
        foot: {
            label: i18n.language === 'ar' ? 'القدم' : 'Foot',
            parts: [
                { value: "left_foot", label: i18n.language === 'ar' ? 'القدم اليسرى' : 'Left Foot' },
                { value: "right_foot", label: i18n.language === 'ar' ? 'القدم اليمنى' : 'Right Foot' },
                { value: "left_tarsals", label: i18n.language === 'ar' ? 'عظام الرسغ القدم اليسرى' : 'Left Tarsals' },
                { value: "right_tarsals", label: i18n.language === 'ar' ? 'عظام الرسغ القدم اليمنى' : 'Right Tarsals' },
                { value: "left_metatarsals", label: i18n.language === 'ar' ? 'عظام المشط القدم اليسرى' : 'Left Metatarsals' },
                { value: "right_metatarsals", label: i18n.language === 'ar' ? 'عظام المشط القدم اليمنى' : 'Right Metatarsals' },
                { value: "left_toe_phalanges", label: i18n.language === 'ar' ? 'عظام السلاميات القدم اليسرى' : 'Left Toe Phalanges' },
                { value: "right_toe_phalanges", label: i18n.language === 'ar' ? 'عظام السلاميات القدم اليمنى' : 'Right Toe Phalanges' }
            ]
        }
    };

    const toggleDropdown = (category: string) => {
        setOpenDropdown(openDropdown === category ? null : category);
    };

    const handlePartSelect = (partValue: string) => {
        if (selectedBodyParts.includes(partValue)) {
            // Remove if already selected
            onBodyPartsSelect(selectedBodyParts.filter(part => part !== partValue));
        } else {
            // Add if not selected
            onBodyPartsSelect([...selectedBodyParts, partValue]);
        }
    };

    const isPartSelected = (partValue: string) => {
        return selectedBodyParts.includes(partValue);
    };

    const getSelectedPartsLabel = () => {
        if (selectedBodyParts.length === 0) return '';
        if (selectedBodyParts.length === 1) {
            for (const category of Object.values(bodyPartCategories)) {
                const part = category.parts.find(p => p.value === selectedBodyParts[0]);
                if (part) return part.label;
            }
            return selectedBodyParts[0];
        }
        return `${selectedBodyParts.length} parts selected`;
    };

    return (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-6 text-center">
                {i18n.language === 'ar' ? 'اختر جزء الجسم من القوائم أدناه' : 'Select body part from the lists below'}
            </h3>

            <div className="space-y-4">
                {Object.entries(bodyPartCategories).map(([categoryKey, category]) => (
                    <div key={categoryKey} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleDropdown(categoryKey)}
                            className="w-full px-4 py-3 bg-white hover:bg-gray-50 text-left flex items-center justify-between border-b border-gray-200 transition-colors duration-200"
                        >
                            <span className="font-medium text-gray-700">{category.label}</span>
                            {openDropdown === categoryKey ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>

                        {openDropdown === categoryKey && (
                            <div className="p-4 bg-gray-50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
                                    {category.parts.map((part) => (
                                        <button
                                            key={part.value}
                                            onClick={() => handlePartSelect(part.value)}
                                            className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 text-left ${isPartSelected(part.value)
                                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                : 'bg-white hover:bg-gray-100 text-gray-700 border border-transparent'
                                                }`}
                                        >
                                            {part.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedBodyParts.length > 0 && (
                <div className="mt-6 text-center">
                    <div className="space-y-2">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {i18n.language === 'ar' ? 'المختار: ' : 'Selected: '}{getSelectedPartsLabel()}
                        </span>
                        {selectedBodyParts.length > 1 && (
                            <div className="flex flex-wrap gap-2 justify-center">
                                {selectedBodyParts.map((partValue) => {
                                    const partLabel = Object.values(bodyPartCategories)
                                        .flatMap(cat => cat.parts)
                                        .find(p => p.value === partValue)?.label || partValue;
                                    return (
                                        <span
                                            key={partValue}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                                        >
                                            {partLabel}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BodyPartDropdownSelector;