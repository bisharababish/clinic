import React, { useState, useEffect, useRef } from "react";
import SEOHead from "../src/components/seo/SEOHead";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Stethoscope,
  Camera,
  X,
  Search,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/use-toast";
import { useTranslation } from 'react-i18next';

// Patient interface
interface Patient {
  userid: number;
  user_email: string;
  english_username_a: string;
  english_username_b?: string;
  english_username_c?: string;
  english_username_d?: string;
  arabic_username_a?: string;
  arabic_username_b?: string;
  arabic_username_c?: string;
  arabic_username_d?: string;
  id_number?: string;
  user_phonenumber?: string;
  date_of_birth?: string;
  gender_user?: string;
  user_roles: string;
  created_at?: string;
  updated_at?: string;
}

// Doctor interface
interface Doctor {
  id: string;
  name: string;
  name_ar?: string;
  specialty: string;
  specialty_ar?: string;
  clinic_id: string;
  clinic_name?: string;
  email: string;
  phone?: string;
  is_available: boolean;
  price: number;
  created_at?: string;
  updated_at?: string;
}

// Anatomical Skeleton Component (embedded)
interface AnatomicalSkeletonProps {
  selectedBodyPart: string;
  onBodyPartSelect: (bodyPart: string) => void;
}

const AnatomicalSkeleton: React.FC<AnatomicalSkeletonProps> = ({
  selectedBodyPart,
  onBodyPartSelect
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Comprehensive anatomical body parts with detailed SVG paths
  const anatomicalParts = {
    // SKULL AND FACIAL BONES
    skull: {
      path: "M400,60 Q380,30 350,25 Q320,20 290,25 Q260,30 240,45 Q220,65 215,95 Q215,125 225,150 Q240,175 270,185 Q300,190 330,190 Q360,190 390,185 Q420,175 435,150 Q445,125 445,95 Q440,65 420,45 Q400,30 400,60 Z",
      center: { x: 330, y: 120 },
      label: "Skull"
    },
    frontal_bone: {
      path: "M330,60 Q320,30 350,25 Q380,30 400,60 Q410,80 405,100 Q380,110 350,105 Q320,100 315,80 Q320,60 330,60 Z",
      center: { x: 360, y: 70 },
      label: "Frontal Bone"
    },
    left_parietal_bone: {
      path: "M315,80 Q310,60 330,60 Q340,80 335,100 Q320,110 305,105 Q295,90 300,75 Q305,65 315,80 Z",
      center: { x: 315, y: 85 },
      label: "Left Parietal Bone"
    },
    right_parietal_bone: {
      path: "M345,80 Q350,60 360,60 Q370,80 365,100 Q350,110 335,105 Q325,90 330,75 Q335,65 345,80 Z",
      center: { x: 345, y: 85 },
      label: "Right Parietal Bone"
    },
    left_temporal_bone: {
      path: "M280,100 Q270,110 275,125 Q285,135 300,130 Q310,120 305,105 Q295,95 280,100 Z",
      center: { x: 290, y: 115 },
      label: "Left Temporal Bone"
    },
    right_temporal_bone: {
      path: "M380,100 Q390,110 385,125 Q375,135 360,130 Q350,120 355,105 Q365,95 380,100 Z",
      center: { x: 370, y: 115 },
      label: "Right Temporal Bone"
    },
    occipital_bone: {
      path: "M330,150 Q320,160 325,175 Q335,185 350,180 Q360,170 355,155 Q345,145 330,150 Z",
      center: { x: 340, y: 165 },
      label: "Occipital Bone"
    },
    sphenoid_bone: {
      path: "M330,130 Q320,135 325,145 Q335,150 345,145 Q350,135 340,130 Q335,125 330,130 Z",
      center: { x: 335, y: 140 },
      label: "Sphenoid Bone"
    },
    ethmoid_bone: {
      path: "M330,110 Q325,115 330,125 Q335,130 340,125 Q345,115 340,110 Q335,105 330,110 Z",
      center: { x: 335, y: 117 },
      label: "Ethmoid Bone"
    },
    left_nasal_bone: {
      path: "M315,120 Q310,125 315,135 Q320,140 325,135 Q330,125 325,120 Q320,115 315,120 Z",
      center: { x: 320, y: 127 },
      label: "Left Nasal Bone"
    },
    right_nasal_bone: {
      path: "M345,120 Q350,125 345,135 Q340,140 335,135 Q330,125 335,120 Q340,115 345,120 Z",
      center: { x: 340, y: 127 },
      label: "Right Nasal Bone"
    },
    left_maxilla: {
      path: "M300,140 Q295,145 300,155 Q310,160 320,155 Q325,145 315,140 Q305,135 300,140 Z",
      center: { x: 310, y: 147 },
      label: "Left Maxilla"
    },
    right_maxilla: {
      path: "M360,140 Q365,145 360,155 Q350,160 340,155 Q335,145 345,140 Q355,135 360,140 Z",
      center: { x: 350, y: 147 },
      label: "Right Maxilla"
    },
    mandible: {
      path: "M300,160 Q295,170 300,180 Q310,190 330,185 Q350,190 360,180 Q365,170 360,160 Q350,150 330,155 Q310,150 300,160 Z",
      center: { x: 330, y: 170 },
      label: "Mandible"
    },
    left_zygomatic_bone: {
      path: "M280,130 Q275,135 280,145 Q290,150 300,145 Q305,135 295,130 Q285,125 280,130 Z",
      center: { x: 290, y: 137 },
      label: "Left Zygomatic Bone"
    },
    right_zygomatic_bone: {
      path: "M380,130 Q385,135 380,145 Q370,150 360,145 Q355,135 365,130 Q375,125 380,130 Z",
      center: { x: 370, y: 137 },
      label: "Right Zygomatic Bone"
    },
    left_palatine_bone: {
      path: "M305,150 Q300,155 305,165 Q315,170 325,165 Q330,155 320,150 Q310,145 305,150 Z",
      center: { x: 315, y: 157 },
      label: "Left Palatine Bone"
    },
    right_palatine_bone: {
      path: "M355,150 Q360,155 355,165 Q345,170 335,165 Q330,155 340,150 Q350,145 355,150 Z",
      center: { x: 345, y: 157 },
      label: "Right Palatine Bone"
    },
    left_lacrimal_bone: {
      path: "M295,120 Q290,125 295,135 Q300,140 305,135 Q310,125 305,120 Q300,115 295,120 Z",
      center: { x: 300, y: 127 },
      label: "Left Lacrimal Bone"
    },
    right_lacrimal_bone: {
      path: "M365,120 Q370,125 365,135 Q360,140 355,135 Q350,125 355,120 Q360,115 365,120 Z",
      center: { x: 360, y: 127 },
      label: "Right Lacrimal Bone"
    },
    left_inferior_nasal_concha: {
      path: "M305,135 Q300,140 305,150 Q310,155 315,150 Q320,140 315,135 Q310,130 305,135 Z",
      center: { x: 310, y: 142 },
      label: "Left Inferior Nasal Concha"
    },
    right_inferior_nasal_concha: {
      path: "M355,135 Q360,140 355,150 Q350,155 345,150 Q340,140 345,135 Q350,130 355,135 Z",
      center: { x: 350, y: 142 },
      label: "Right Inferior Nasal Concha"
    },
    vomer: {
      path: "M330,140 Q325,145 330,155 Q335,160 340,155 Q345,145 340,140 Q335,135 330,140 Z",
      center: { x: 335, y: 147 },
      label: "Vomer"
    },

    // EAR BONES (OSSICLES)
    left_malleus: {
      path: "M275,125 Q270,130 275,135 Q280,140 285,135 Q290,130 285,125 Q280,120 275,125 Z",
      center: { x: 280, y: 130 },
      label: "Left Malleus"
    },
    right_malleus: {
      path: "M385,125 Q390,130 385,135 Q380,140 375,135 Q370,130 375,125 Q380,120 385,125 Z",
      center: { x: 380, y: 130 },
      label: "Right Malleus"
    },
    left_incus: {
      path: "M280,130 Q275,135 280,140 Q285,145 290,140 Q295,135 290,130 Q285,125 280,130 Z",
      center: { x: 285, y: 135 },
      label: "Left Incus"
    },
    right_incus: {
      path: "M380,130 Q385,135 380,140 Q375,145 370,140 Q365,135 370,130 Q375,125 380,130 Z",
      center: { x: 375, y: 135 },
      label: "Right Incus"
    },
    left_stapes: {
      path: "M285,135 Q280,140 285,145 Q290,150 295,145 Q300,140 295,135 Q290,130 285,135 Z",
      center: { x: 290, y: 140 },
      label: "Left Stapes"
    },
    right_stapes: {
      path: "M375,135 Q380,140 375,145 Q370,150 365,145 Q360,140 365,135 Q370,130 375,135 Z",
      center: { x: 370, y: 140 },
      label: "Right Stapes"
    },

    // HYOID BONE
    hyoid_bone: {
      path: "M310,190 Q305,195 310,205 Q320,210 330,205 Q335,195 325,190 Q315,185 310,190 Z",
      center: { x: 320, y: 197 },
      label: "Hyoid Bone"
    },

    // VERTEBRAL COLUMN
    cervical_spine: {
      path: "M325,190 Q320,188 320,195 L320,210 Q320,217 325,215 Q330,217 335,215 Q340,217 340,210 L340,195 Q340,188 335,190 Q330,188 325,190 Z",
      center: { x: 330, y: 220 },
      label: "Cervical Spine"
    },
    c1_atlas: {
      path: "M325,190 Q320,188 320,195 L320,205 Q320,210 325,208 Q330,210 335,208 Q340,210 340,205 L340,195 Q340,188 335,190 Q330,188 325,190 Z",
      center: { x: 330, y: 200 },
      label: "C1 (Atlas)"
    },
    c2_axis: {
      path: "M325,205 Q320,203 320,210 L320,220 Q320,225 325,223 Q330,225 335,223 Q340,225 340,220 L340,210 Q340,203 335,205 Q330,203 325,205 Z",
      center: { x: 330, y: 215 },
      label: "C2 (Axis)"
    },
    c3_vertebra: {
      path: "M325,220 Q320,218 320,225 L320,235 Q320,240 325,238 Q330,240 335,238 Q340,240 340,235 L340,225 Q340,218 335,220 Q330,218 325,220 Z",
      center: { x: 330, y: 230 },
      label: "C3 Vertebra"
    },
    c4_vertebra: {
      path: "M325,235 Q320,233 320,240 L320,250 Q320,255 325,253 Q330,255 335,253 Q340,255 340,250 L340,240 Q340,233 335,235 Q330,233 325,235 Z",
      center: { x: 330, y: 245 },
      label: "C4 Vertebra"
    },
    c5_vertebra: {
      path: "M325,250 Q320,248 320,255 L320,265 Q320,270 325,268 Q330,270 335,268 Q340,270 340,265 L340,255 Q340,248 335,250 Q330,248 325,250 Z",
      center: { x: 330, y: 260 },
      label: "C5 Vertebra"
    },
    c6_vertebra: {
      path: "M325,265 Q320,263 320,270 L320,280 Q320,285 325,283 Q330,285 335,283 Q340,285 340,280 L340,270 Q340,263 335,265 Q330,263 325,265 Z",
      center: { x: 330, y: 275 },
      label: "C6 Vertebra"
    },
    c7_vertebra: {
      path: "M325,280 Q320,278 320,285 L320,295 Q320,300 325,298 Q330,300 335,298 Q340,300 340,295 L340,285 Q340,278 335,280 Q330,278 325,280 Z",
      center: { x: 330, y: 290 },
      label: "C7 Vertebra"
    },
    thoracic_spine: {
      path: "M325,230 Q320,228 320,235 L320,350 Q320,357 325,355 Q330,357 335,355 Q340,357 340,350 L340,235 Q340,228 335,230 Q330,228 325,230 Z",
      center: { x: 330, y: 290 },
      label: "Thoracic Spine"
    },
    t1_vertebra: {
      path: "M325,295 Q320,293 320,300 L320,310 Q320,315 325,313 Q330,315 335,313 Q340,315 340,310 L340,300 Q340,293 335,295 Q330,293 325,295 Z",
      center: { x: 330, y: 305 },
      label: "T1 Vertebra"
    },
    t2_vertebra: {
      path: "M325,310 Q320,308 320,315 L320,325 Q320,330 325,328 Q330,330 335,328 Q340,330 340,325 L340,315 Q340,308 335,310 Q330,308 325,310 Z",
      center: { x: 330, y: 320 },
      label: "T2 Vertebra"
    },
    t3_vertebra: {
      path: "M325,325 Q320,323 320,330 L320,340 Q320,345 325,343 Q330,345 335,343 Q340,345 340,340 L340,330 Q340,323 335,325 Q330,323 325,325 Z",
      center: { x: 330, y: 335 },
      label: "T3 Vertebra"
    },
    t4_vertebra: {
      path: "M325,340 Q320,338 320,345 L320,355 Q320,360 325,358 Q330,360 335,358 Q340,360 340,355 L340,345 Q340,338 335,340 Q330,338 325,340 Z",
      center: { x: 330, y: 350 },
      label: "T4 Vertebra"
    },
    t5_vertebra: {
      path: "M325,355 Q320,353 320,360 L320,370 Q320,375 325,373 Q330,375 335,373 Q340,375 340,370 L340,360 Q340,353 335,355 Q330,353 325,355 Z",
      center: { x: 330, y: 365 },
      label: "T5 Vertebra"
    },
    t6_vertebra: {
      path: "M325,370 Q320,368 320,375 L320,385 Q320,390 325,388 Q330,390 335,388 Q340,390 340,385 L340,375 Q340,368 335,370 Q330,368 325,370 Z",
      center: { x: 330, y: 380 },
      label: "T6 Vertebra"
    },
    t7_vertebra: {
      path: "M325,385 Q320,383 320,390 L320,400 Q320,405 325,403 Q330,405 335,403 Q340,405 340,400 L340,390 Q340,383 335,385 Q330,383 325,385 Z",
      center: { x: 330, y: 395 },
      label: "T7 Vertebra"
    },
    t8_vertebra: {
      path: "M325,400 Q320,398 320,405 L320,415 Q320,420 325,418 Q330,420 335,418 Q340,420 340,415 L340,405 Q340,398 335,400 Q330,398 325,400 Z",
      center: { x: 330, y: 410 },
      label: "T8 Vertebra"
    },
    t9_vertebra: {
      path: "M325,415 Q320,413 320,420 L320,430 Q320,435 325,433 Q330,435 335,433 Q340,435 340,430 L340,420 Q340,413 335,415 Q330,413 325,415 Z",
      center: { x: 330, y: 425 },
      label: "T9 Vertebra"
    },
    t10_vertebra: {
      path: "M325,430 Q320,428 320,435 L320,445 Q320,450 325,448 Q330,450 335,448 Q340,450 340,445 L340,435 Q340,428 335,430 Q330,428 325,430 Z",
      center: { x: 330, y: 440 },
      label: "T10 Vertebra"
    },
    t11_vertebra: {
      path: "M325,445 Q320,443 320,450 L320,460 Q320,465 325,463 Q330,465 335,463 Q340,465 340,460 L340,450 Q340,443 335,445 Q330,443 325,445 Z",
      center: { x: 330, y: 455 },
      label: "T11 Vertebra"
    },
    t12_vertebra: {
      path: "M325,460 Q320,458 320,465 L320,475 Q320,480 325,478 Q330,480 335,478 Q340,480 340,475 L340,465 Q340,458 335,460 Q330,458 325,460 Z",
      center: { x: 330, y: 470 },
      label: "T12 Vertebra"
    },
    lumbar_spine: {
      path: "M325,350 Q320,348 320,355 L320,400 Q320,407 325,405 Q330,407 335,405 Q340,407 340,400 L340,355 Q340,348 335,350 Q330,348 325,350 Z",
      center: { x: 330, y: 375 },
      label: "Lumbar Spine"
    },
    l1_vertebra: {
      path: "M325,475 Q320,473 320,480 L320,490 Q320,495 325,493 Q330,495 335,493 Q340,495 340,490 L340,480 Q340,473 335,475 Q330,473 325,475 Z",
      center: { x: 330, y: 485 },
      label: "L1 Vertebra"
    },
    l2_vertebra: {
      path: "M325,490 Q320,488 320,495 L320,505 Q320,510 325,508 Q330,510 335,508 Q340,510 340,505 L340,495 Q340,488 335,490 Q330,488 325,490 Z",
      center: { x: 330, y: 500 },
      label: "L2 Vertebra"
    },
    l3_vertebra: {
      path: "M325,505 Q320,503 320,510 L320,520 Q320,525 325,523 Q330,525 335,523 Q340,525 340,520 L340,510 Q340,503 335,505 Q330,503 325,505 Z",
      center: { x: 330, y: 515 },
      label: "L3 Vertebra"
    },
    l4_vertebra: {
      path: "M325,520 Q320,518 320,525 L320,535 Q320,540 325,538 Q330,540 335,538 Q340,540 340,535 L340,525 Q340,518 335,520 Q330,518 325,520 Z",
      center: { x: 330, y: 530 },
      label: "L4 Vertebra"
    },
    l5_vertebra: {
      path: "M325,535 Q320,533 320,540 L320,550 Q320,555 325,553 Q330,555 335,553 Q340,555 340,550 L340,540 Q340,533 335,535 Q330,533 325,535 Z",
      center: { x: 330, y: 545 },
      label: "L5 Vertebra"
    },
    sacrum: {
      path: "M325,400 Q315,398 315,410 L315,430 Q315,440 325,438 Q330,440 335,438 Q345,440 345,430 L345,410 Q345,398 335,400 Q330,398 325,400 Z",
      center: { x: 330, y: 415 },
      label: "Sacrum"
    },
    coccyx: {
      path: "M325,440 Q320,438 320,445 L320,455 Q320,460 325,458 Q330,460 335,458 Q340,460 340,455 L340,445 Q340,438 335,440 Q330,438 325,440 Z",
      center: { x: 330, y: 450 },
      label: "Coccyx"
    },

    // THORACIC CAGE
    sternum: {
      path: "M325,240 Q320,238 320,245 L320,340 Q320,347 325,345 Q330,347 335,345 Q340,347 340,340 L340,245 Q340,238 335,240 Q330,238 325,240 Z",
      center: { x: 330, y: 290 },
      label: "Sternum"
    },
    manubrium: {
      path: "M325,240 Q320,238 320,245 L320,270 Q320,275 325,273 Q330,275 335,273 Q340,275 340,270 L340,245 Q340,238 335,240 Q330,238 325,240 Z",
      center: { x: 330, y: 260 },
      label: "Manubrium"
    },
    sternal_body: {
      path: "M325,270 Q320,268 320,275 L320,320 Q320,325 325,323 Q330,325 335,323 Q340,325 340,320 L340,275 Q340,268 335,270 Q330,268 325,270 Z",
      center: { x: 330, y: 300 },
      label: "Sternal Body"
    },
    xiphoid_process: {
      path: "M325,320 Q320,318 320,325 L320,340 Q320,345 325,343 Q330,345 335,343 Q340,345 340,340 L340,325 Q340,318 335,320 Q330,318 325,320 Z",
      center: { x: 330, y: 330 },
      label: "Xiphoid Process"
    },
    ribs_left: {
      path: "M340,240 Q300,235 280,250 Q275,260 280,270 Q300,285 340,280 M340,255 Q305,250 285,265 Q280,275 285,285 Q305,300 340,295 M340,270 Q310,265 290,280 Q285,290 290,300 Q310,315 340,310 M340,285 Q315,280 295,295 Q290,305 295,315 Q315,330 340,325 M340,300 Q320,295 300,310 Q295,320 300,330 Q320,345 340,340 M340,315 Q325,310 305,325 Q300,335 305,345 Q325,360 340,355",
      center: { x: 300, y: 300 },
      label: "Left Ribs"
    },
    ribs_right: {
      path: "M320,240 Q360,235 380,250 Q385,260 380,270 Q360,285 320,280 M320,255 Q355,250 375,265 Q380,275 375,285 Q355,300 320,295 M320,270 Q350,265 370,280 Q375,290 370,300 Q350,315 320,310 M320,285 Q345,280 365,295 Q370,305 365,315 Q345,330 320,325 M320,300 Q340,295 360,310 Q365,320 360,330 Q340,345 320,340 M320,315 Q335,310 355,325 Q360,335 355,345 Q335,360 320,355",
      center: { x: 360, y: 300 },
      label: "Right Ribs"
    },
    left_1st_rib: {
      path: "M340,240 Q320,238 310,245 Q305,250 310,255 Q320,260 340,255 Q345,250 340,240 Z",
      center: { x: 325, y: 250 },
      label: "Left 1st Rib"
    },
    right_1st_rib: {
      path: "M320,240 Q340,238 350,245 Q355,250 350,255 Q340,260 320,255 Q315,250 320,240 Z",
      center: { x: 335, y: 250 },
      label: "Right 1st Rib"
    },
    left_2nd_rib: {
      path: "M340,255 Q320,253 310,260 Q305,265 310,270 Q320,275 340,270 Q345,265 340,255 Z",
      center: { x: 325, y: 265 },
      label: "Left 2nd Rib"
    },
    right_2nd_rib: {
      path: "M320,255 Q340,253 350,260 Q355,265 350,270 Q340,275 320,270 Q315,265 320,255 Z",
      center: { x: 335, y: 265 },
      label: "Right 2nd Rib"
    },
    left_3rd_rib: {
      path: "M340,270 Q320,268 310,275 Q305,280 310,285 Q320,290 340,285 Q345,280 340,270 Z",
      center: { x: 325, y: 280 },
      label: "Left 3rd Rib"
    },
    right_3rd_rib: {
      path: "M320,270 Q340,268 350,275 Q355,280 350,285 Q340,290 320,285 Q315,280 320,270 Z",
      center: { x: 335, y: 280 },
      label: "Right 3rd Rib"
    },
    left_4th_rib: {
      path: "M340,285 Q320,283 310,290 Q305,295 310,300 Q320,305 340,300 Q345,295 340,285 Z",
      center: { x: 325, y: 295 },
      label: "Left 4th Rib"
    },
    right_4th_rib: {
      path: "M320,285 Q340,283 350,290 Q355,295 350,300 Q340,305 320,300 Q315,295 320,285 Z",
      center: { x: 335, y: 295 },
      label: "Right 4th Rib"
    },
    left_5th_rib: {
      path: "M340,300 Q320,298 310,305 Q305,310 310,315 Q320,320 340,315 Q345,310 340,300 Z",
      center: { x: 325, y: 310 },
      label: "Left 5th Rib"
    },
    right_5th_rib: {
      path: "M320,300 Q340,298 350,305 Q355,310 350,315 Q340,320 320,315 Q315,310 320,300 Z",
      center: { x: 335, y: 310 },
      label: "Right 5th Rib"
    },
    left_6th_rib: {
      path: "M340,315 Q320,313 310,320 Q305,325 310,330 Q320,335 340,330 Q345,325 340,315 Z",
      center: { x: 325, y: 325 },
      label: "Left 6th Rib"
    },
    right_6th_rib: {
      path: "M320,315 Q340,313 350,320 Q355,325 350,330 Q340,335 320,330 Q315,325 320,315 Z",
      center: { x: 335, y: 325 },
      label: "Right 6th Rib"
    },
    left_7th_rib: {
      path: "M340,330 Q320,328 310,335 Q305,340 310,345 Q320,350 340,345 Q345,340 340,330 Z",
      center: { x: 325, y: 340 },
      label: "Left 7th Rib"
    },
    right_7th_rib: {
      path: "M320,330 Q340,328 350,335 Q355,340 350,345 Q340,350 320,345 Q315,340 320,330 Z",
      center: { x: 335, y: 340 },
      label: "Right 7th Rib"
    },
    left_8th_rib: {
      path: "M340,345 Q320,343 310,350 Q305,355 310,360 Q320,365 340,360 Q345,355 340,345 Z",
      center: { x: 325, y: 355 },
      label: "Left 8th Rib"
    },
    right_8th_rib: {
      path: "M320,345 Q340,343 350,350 Q355,355 350,360 Q340,365 320,360 Q315,355 320,345 Z",
      center: { x: 335, y: 355 },
      label: "Right 8th Rib"
    },
    left_9th_rib: {
      path: "M340,360 Q320,358 310,365 Q305,370 310,375 Q320,380 340,375 Q345,370 340,360 Z",
      center: { x: 325, y: 370 },
      label: "Left 9th Rib"
    },
    right_9th_rib: {
      path: "M320,360 Q340,358 350,365 Q355,370 350,375 Q340,380 320,375 Q315,370 320,360 Z",
      center: { x: 335, y: 370 },
      label: "Right 9th Rib"
    },
    left_10th_rib: {
      path: "M340,375 Q320,373 310,380 Q305,385 310,390 Q320,395 340,390 Q345,385 340,375 Z",
      center: { x: 325, y: 385 },
      label: "Left 10th Rib"
    },
    right_10th_rib: {
      path: "M320,375 Q340,373 350,380 Q355,385 350,390 Q340,395 320,390 Q315,385 320,375 Z",
      center: { x: 335, y: 385 },
      label: "Right 10th Rib"
    },
    left_11th_rib: {
      path: "M340,390 Q320,388 310,395 Q305,400 310,405 Q320,410 340,405 Q345,400 340,390 Z",
      center: { x: 325, y: 400 },
      label: "Left 11th Rib"
    },
    right_11th_rib: {
      path: "M320,390 Q340,388 350,395 Q355,400 350,405 Q340,410 320,405 Q315,400 320,390 Z",
      center: { x: 335, y: 400 },
      label: "Right 11th Rib"
    },
    left_12th_rib: {
      path: "M340,405 Q320,403 310,410 Q305,415 310,420 Q320,425 340,420 Q345,415 340,405 Z",
      center: { x: 325, y: 415 },
      label: "Left 12th Rib"
    },
    right_12th_rib: {
      path: "M320,405 Q340,403 350,410 Q355,415 350,420 Q340,425 320,420 Q315,415 320,405 Z",
      center: { x: 335, y: 415 },
      label: "Right 12th Rib"
    },

    // UPPER LIMB BONES
    clavicle_left: {
      path: "M280,225 Q260,220 240,225 Q235,230 240,235 Q260,240 280,235 Q285,230 280,225 Z",
      center: { x: 260, y: 230 },
      label: "Left Clavicle"
    },
    clavicle_right: {
      path: "M380,225 Q400,220 420,225 Q425,230 420,235 Q400,240 380,235 Q375,230 380,225 Z",
      center: { x: 400, y: 230 },
      label: "Right Clavicle"
    },
    scapula_left: {
      path: "M240,235 Q220,240 210,260 Q205,280 215,300 Q235,310 255,305 Q265,285 260,265 Q255,245 240,235 Z",
      center: { x: 235, y: 270 },
      label: "Left Scapula"
    },
    scapula_right: {
      path: "M420,235 Q440,240 450,260 Q455,280 445,300 Q425,310 405,305 Q395,285 400,265 Q405,245 420,235 Z",
      center: { x: 425, y: 270 },
      label: "Right Scapula"
    },
    humerus_left: {
      path: "M240,310 Q235,315 230,340 L225,380 Q220,385 225,390 Q235,395 245,390 Q250,385 245,380 L250,340 Q255,315 250,310 Q245,305 240,310 Z",
      center: { x: 240, y: 350 },
      label: "Left Humerus"
    },
    humerus_right: {
      path: "M420,310 Q425,315 430,340 L435,380 Q440,385 435,390 Q425,395 415,390 Q410,385 415,380 L410,340 Q405,315 410,310 Q415,305 420,310 Z",
      center: { x: 420, y: 350 },
      label: "Right Humerus"
    },
    radius_left: {
      path: "M225,390 Q220,395 215,420 L210,460 Q205,465 210,470 Q220,475 230,470 Q235,465 230,460 L235,420 Q240,395 235,390 Q230,385 225,390 Z",
      center: { x: 225, y: 430 },
      label: "Left Radius"
    },
    radius_right: {
      path: "M435,390 Q440,395 445,420 L450,460 Q455,465 450,470 Q440,475 430,470 Q425,465 430,460 L425,420 Q420,395 425,390 Q430,385 435,390 Z",
      center: { x: 435, y: 430 },
      label: "Right Radius"
    },
    ulna_left: {
      path: "M245,390 Q240,395 235,420 L230,460 Q225,465 230,470 Q240,475 250,470 Q255,465 250,460 L255,420 Q260,395 255,390 Q250,385 245,390 Z",
      center: { x: 245, y: 430 },
      label: "Left Ulna"
    },
    ulna_right: {
      path: "M415,390 Q420,395 425,420 L430,460 Q435,465 430,470 Q420,475 410,470 Q405,465 410,460 L405,420 Q400,395 405,390 Q410,385 415,390 Z",
      center: { x: 415, y: 430 },
      label: "Right Ulna"
    },

    // HAND BONES (LEFT)
    hand_left: {
      path: "M210,470 Q200,475 195,485 L190,505 Q185,515 195,520 Q220,530 240,525 Q250,520 245,510 L250,490 Q255,480 245,475 Q230,470 210,470 Z",
      center: { x: 220, y: 495 },
      label: "Left Hand"
    },
    left_scaphoid: {
      path: "M210,470 Q205,475 210,485 Q215,490 220,485 Q225,475 220,470 Q215,465 210,470 Z",
      center: { x: 215, y: 477 },
      label: "Left Scaphoid"
    },
    left_lunate: {
      path: "M220,470 Q215,475 220,485 Q225,490 230,485 Q235,475 230,470 Q225,465 220,470 Z",
      center: { x: 225, y: 477 },
      label: "Left Lunate"
    },
    left_triquetral: {
      path: "M230,470 Q225,475 230,485 Q235,490 240,485 Q245,475 240,470 Q235,465 230,470 Z",
      center: { x: 235, y: 477 },
      label: "Left Triquetral"
    },
    left_pisiform: {
      path: "M240,470 Q235,475 240,485 Q245,490 250,485 Q255,475 250,470 Q245,465 240,470 Z",
      center: { x: 245, y: 477 },
      label: "Left Pisiform"
    },
    left_trapezium: {
      path: "M210,485 Q205,490 210,500 Q215,505 220,500 Q225,490 220,485 Q215,480 210,485 Z",
      center: { x: 215, y: 492 },
      label: "Left Trapezium"
    },
    left_trapezoid: {
      path: "M220,485 Q215,490 220,500 Q225,505 230,500 Q235,490 230,485 Q225,480 220,485 Z",
      center: { x: 225, y: 492 },
      label: "Left Trapezoid"
    },
    left_capitate: {
      path: "M230,485 Q225,490 230,500 Q235,505 240,500 Q245,490 240,485 Q235,480 230,485 Z",
      center: { x: 235, y: 492 },
      label: "Left Capitate"
    },
    left_hamate: {
      path: "M240,485 Q235,490 240,500 Q245,505 250,500 Q255,490 250,485 Q245,480 240,485 Z",
      center: { x: 245, y: 492 },
      label: "Left Hamate"
    },
    left_1st_metacarpal: {
      path: "M200,500 Q195,505 200,515 Q205,520 210,515 Q215,505 210,500 Q205,495 200,500 Z",
      center: { x: 205, y: 507 },
      label: "Left 1st Metacarpal"
    },
    left_2nd_metacarpal: {
      path: "M210,500 Q205,505 210,515 Q215,520 220,515 Q225,505 220,500 Q215,495 210,500 Z",
      center: { x: 215, y: 507 },
      label: "Left 2nd Metacarpal"
    },
    left_3rd_metacarpal: {
      path: "M220,500 Q215,505 220,515 Q225,520 230,515 Q235,505 230,500 Q225,495 220,500 Z",
      center: { x: 225, y: 507 },
      label: "Left 3rd Metacarpal"
    },
    left_4th_metacarpal: {
      path: "M230,500 Q225,505 230,515 Q235,520 240,515 Q245,505 240,500 Q235,495 230,500 Z",
      center: { x: 235, y: 507 },
      label: "Left 4th Metacarpal"
    },
    left_5th_metacarpal: {
      path: "M240,500 Q235,505 240,515 Q245,520 250,515 Q255,505 250,500 Q245,495 240,500 Z",
      center: { x: 245, y: 507 },
      label: "Left 5th Metacarpal"
    },
    left_thumb_proximal_phalanx: {
      path: "M195,515 Q190,520 195,530 Q200,535 205,530 Q210,520 205,515 Q200,510 195,515 Z",
      center: { x: 200, y: 522 },
      label: "Left Thumb Proximal Phalanx"
    },
    left_thumb_distal_phalanx: {
      path: "M190,530 Q185,535 190,545 Q195,550 200,545 Q205,535 200,530 Q195,525 190,530 Z",
      center: { x: 195, y: 537 },
      label: "Left Thumb Distal Phalanx"
    },
    left_index_proximal_phalanx: {
      path: "M205,515 Q200,520 205,530 Q210,535 215,530 Q220,520 215,515 Q210,510 205,515 Z",
      center: { x: 210, y: 522 },
      label: "Left Index Proximal Phalanx"
    },
    left_index_middle_phalanx: {
      path: "M205,530 Q200,535 205,545 Q210,550 215,545 Q220,535 215,530 Q210,525 205,530 Z",
      center: { x: 210, y: 537 },
      label: "Left Index Middle Phalanx"
    },
    left_index_distal_phalanx: {
      path: "M205,545 Q200,550 205,560 Q210,565 215,560 Q220,550 215,545 Q210,540 205,545 Z",
      center: { x: 210, y: 552 },
      label: "Left Index Distal Phalanx"
    },
    left_middle_proximal_phalanx: {
      path: "M215,515 Q210,520 215,530 Q220,535 225,530 Q230,520 225,515 Q220,510 215,515 Z",
      center: { x: 220, y: 522 },
      label: "Left Middle Proximal Phalanx"
    },
    left_middle_middle_phalanx: {
      path: "M215,530 Q210,535 215,545 Q220,550 225,545 Q230,535 225,530 Q220,525 215,530 Z",
      center: { x: 220, y: 537 },
      label: "Left Middle Middle Phalanx"
    },
    left_middle_distal_phalanx: {
      path: "M215,545 Q210,550 215,560 Q220,565 225,560 Q230,550 225,545 Q220,540 215,545 Z",
      center: { x: 220, y: 552 },
      label: "Left Middle Distal Phalanx"
    },
    left_ring_proximal_phalanx: {
      path: "M225,515 Q220,520 225,530 Q230,535 235,530 Q240,520 235,515 Q230,510 225,515 Z",
      center: { x: 230, y: 522 },
      label: "Left Ring Proximal Phalanx"
    },
    left_ring_middle_phalanx: {
      path: "M225,530 Q220,535 225,545 Q230,550 235,545 Q240,535 235,530 Q230,525 225,530 Z",
      center: { x: 230, y: 537 },
      label: "Left Ring Middle Phalanx"
    },
    left_ring_distal_phalanx: {
      path: "M225,545 Q220,550 225,560 Q230,565 235,560 Q240,550 235,545 Q230,540 225,545 Z",
      center: { x: 230, y: 552 },
      label: "Left Ring Distal Phalanx"
    },
    left_pinky_proximal_phalanx: {
      path: "M235,515 Q230,520 235,530 Q240,535 245,530 Q250,520 245,515 Q240,510 235,515 Z",
      center: { x: 240, y: 522 },
      label: "Left Pinky Proximal Phalanx"
    },
    left_pinky_middle_phalanx: {
      path: "M235,530 Q230,535 235,545 Q240,550 245,545 Q250,535 245,530 Q240,525 235,530 Z",
      center: { x: 240, y: 537 },
      label: "Left Pinky Middle Phalanx"
    },
    left_pinky_distal_phalanx: {
      path: "M235,545 Q230,550 235,560 Q240,565 245,560 Q250,550 245,545 Q240,540 235,545 Z",
      center: { x: 240, y: 552 },
      label: "Left Pinky Distal Phalanx"
    },

    // HAND BONES (RIGHT)
    hand_right: {
      path: "M450,470 Q460,475 465,485 L470,505 Q475,515 465,520 Q440,530 420,525 Q410,520 415,510 L410,490 Q405,480 415,475 Q430,470 450,470 Z",
      center: { x: 440, y: 495 },
      label: "Right Hand"
    },
    right_scaphoid: {
      path: "M450,470 Q455,475 450,485 Q445,490 440,485 Q435,475 440,470 Q445,465 450,470 Z",
      center: { x: 445, y: 477 },
      label: "Right Scaphoid"
    },
    right_lunate: {
      path: "M440,470 Q445,475 440,485 Q435,490 430,485 Q425,475 430,470 Q435,465 440,470 Z",
      center: { x: 435, y: 477 },
      label: "Right Lunate"
    },
    right_triquetral: {
      path: "M430,470 Q435,475 430,485 Q425,490 420,485 Q415,475 420,470 Q425,465 430,470 Z",
      center: { x: 425, y: 477 },
      label: "Right Triquetral"
    },
    right_pisiform: {
      path: "M420,470 Q425,475 420,485 Q415,490 410,485 Q405,475 410,470 Q415,465 420,470 Z",
      center: { x: 415, y: 477 },
      label: "Right Pisiform"
    },
    right_trapezium: {
      path: "M450,485 Q455,490 450,500 Q445,505 440,500 Q435,490 440,485 Q445,480 450,485 Z",
      center: { x: 445, y: 492 },
      label: "Right Trapezium"
    },
    right_trapezoid: {
      path: "M440,485 Q445,490 440,500 Q435,505 430,500 Q425,490 430,485 Q435,480 440,485 Z",
      center: { x: 435, y: 492 },
      label: "Right Trapezoid"
    },
    right_capitate: {
      path: "M430,485 Q435,490 430,500 Q425,505 420,500 Q415,490 420,485 Q425,480 430,485 Z",
      center: { x: 425, y: 492 },
      label: "Right Capitate"
    },
    right_hamate: {
      path: "M420,485 Q425,490 420,500 Q415,505 410,500 Q405,490 410,485 Q415,480 420,485 Z",
      center: { x: 415, y: 492 },
      label: "Right Hamate"
    },
    right_1st_metacarpal: {
      path: "M460,500 Q465,505 460,515 Q455,520 450,515 Q445,505 450,500 Q455,495 460,500 Z",
      center: { x: 455, y: 507 },
      label: "Right 1st Metacarpal"
    },
    right_2nd_metacarpal: {
      path: "M450,500 Q455,505 450,515 Q445,520 440,515 Q435,505 440,500 Q445,495 450,500 Z",
      center: { x: 445, y: 507 },
      label: "Right 2nd Metacarpal"
    },
    right_3rd_metacarpal: {
      path: "M440,500 Q445,505 440,515 Q435,520 430,515 Q425,505 430,500 Q435,495 440,500 Z",
      center: { x: 435, y: 507 },
      label: "Right 3rd Metacarpal"
    },
    right_4th_metacarpal: {
      path: "M430,500 Q435,505 430,515 Q425,520 420,515 Q415,505 420,500 Q425,495 430,500 Z",
      center: { x: 425, y: 507 },
      label: "Right 4th Metacarpal"
    },
    right_5th_metacarpal: {
      path: "M420,500 Q425,505 420,515 Q415,520 410,515 Q405,505 410,500 Q415,495 420,500 Z",
      center: { x: 415, y: 507 },
      label: "Right 5th Metacarpal"
    },
    right_thumb_proximal_phalanx: {
      path: "M465,515 Q470,520 465,530 Q460,535 455,530 Q450,520 455,515 Q460,510 465,515 Z",
      center: { x: 460, y: 522 },
      label: "Right Thumb Proximal Phalanx"
    },
    right_thumb_distal_phalanx: {
      path: "M470,530 Q475,535 470,545 Q465,550 460,545 Q455,535 460,530 Q465,525 470,530 Z",
      center: { x: 465, y: 537 },
      label: "Right Thumb Distal Phalanx"
    },
    right_index_proximal_phalanx: {
      path: "M455,515 Q460,520 455,530 Q450,535 445,530 Q440,520 445,515 Q450,510 455,515 Z",
      center: { x: 450, y: 522 },
      label: "Right Index Proximal Phalanx"
    },
    right_index_middle_phalanx: {
      path: "M455,530 Q460,535 455,545 Q450,550 445,545 Q440,535 445,530 Q450,525 455,530 Z",
      center: { x: 450, y: 537 },
      label: "Right Index Middle Phalanx"
    },
    right_index_distal_phalanx: {
      path: "M455,545 Q460,550 455,560 Q450,565 445,560 Q440,550 445,545 Q450,540 455,545 Z",
      center: { x: 450, y: 552 },
      label: "Right Index Distal Phalanx"
    },
    right_middle_proximal_phalanx: {
      path: "M445,515 Q450,520 445,530 Q440,535 435,530 Q430,520 435,515 Q440,510 445,515 Z",
      center: { x: 440, y: 522 },
      label: "Right Middle Proximal Phalanx"
    },
    right_middle_middle_phalanx: {
      path: "M445,530 Q450,535 445,545 Q440,550 435,545 Q430,535 435,530 Q440,525 445,530 Z",
      center: { x: 440, y: 537 },
      label: "Right Middle Middle Phalanx"
    },
    right_middle_distal_phalanx: {
      path: "M445,545 Q450,550 445,560 Q440,565 435,560 Q430,550 435,545 Q440,540 445,545 Z",
      center: { x: 440, y: 552 },
      label: "Right Middle Distal Phalanx"
    },
    right_ring_proximal_phalanx: {
      path: "M435,515 Q440,520 435,530 Q430,535 425,530 Q420,520 425,515 Q430,510 435,515 Z",
      center: { x: 430, y: 522 },
      label: "Right Ring Proximal Phalanx"
    },
    right_ring_middle_phalanx: {
      path: "M435,530 Q440,535 435,545 Q430,550 425,545 Q420,535 425,530 Q430,525 435,530 Z",
      center: { x: 430, y: 537 },
      label: "Right Ring Middle Phalanx"
    },
    right_ring_distal_phalanx: {
      path: "M435,545 Q440,550 435,560 Q430,565 425,560 Q420,550 425,545 Q430,540 435,545 Z",
      center: { x: 430, y: 552 },
      label: "Right Ring Distal Phalanx"
    },
    right_pinky_proximal_phalanx: {
      path: "M425,515 Q430,520 425,530 Q420,535 415,530 Q410,520 415,515 Q420,510 425,515 Z",
      center: { x: 420, y: 522 },
      label: "Right Pinky Proximal Phalanx"
    },
    right_pinky_middle_phalanx: {
      path: "M425,530 Q430,535 425,545 Q420,550 415,545 Q410,535 415,530 Q420,525 425,530 Z",
      center: { x: 420, y: 537 },
      label: "Right Pinky Middle Phalanx"
    },
    right_pinky_distal_phalanx: {
      path: "M425,545 Q430,550 425,560 Q420,565 415,560 Q410,550 415,545 Q420,540 425,545 Z",
      center: { x: 420, y: 552 },
      label: "Right Pinky Distal Phalanx"
    },

    // PELVIC GIRDLE
    pelvis: {
      path: "M270,400 Q260,395 250,405 Q245,415 250,425 L280,440 L380,440 Q390,425 385,415 Q380,405 370,400 Q330,395 270,400 Z",
      center: { x: 330, y: 420 },
      label: "Pelvis"
    },
    left_iliac: {
      path: "M270,400 Q260,395 250,405 Q245,415 250,425 L280,440 Q290,425 285,415 Q280,405 270,400 Z",
      center: { x: 270, y: 420 },
      label: "Left Ilium"
    },
    right_iliac: {
      path: "M390,400 Q400,395 410,405 Q415,415 410,425 L380,440 Q370,425 375,415 Q380,405 390,400 Z",
      center: { x: 390, y: 420 },
      label: "Right Ilium"
    },
    left_ischium: {
      path: "M280,440 Q270,435 265,445 Q270,455 280,450 Q290,445 285,435 Q280,430 280,440 Z",
      center: { x: 277, y: 442 },
      label: "Left Ischium"
    },
    right_ischium: {
      path: "M380,440 Q390,435 395,445 Q390,455 380,450 Q370,445 375,435 Q380,430 380,440 Z",
      center: { x: 383, y: 442 },
      label: "Right Ischium"
    },
    left_pubis: {
      path: "M300,440 Q290,435 285,445 Q290,455 300,450 Q310,445 305,435 Q300,430 300,440 Z",
      center: { x: 297, y: 442 },
      label: "Left Pubis"
    },
    right_pubis: {
      path: "M360,440 Q370,435 375,445 Q370,455 360,450 Q350,445 355,435 Q360,430 360,440 Z",
      center: { x: 363, y: 442 },
      label: "Right Pubis"
    },

    // LOWER LIMB BONES
    femur_left: {
      path: "M280,440 Q275,445 270,470 L260,540 Q255,545 260,550 Q270,555 280,550 Q285,545 280,540 L290,470 Q295,445 290,440 Q285,435 280,440 Z",
      center: { x: 280, y: 495 },
      label: "Left Femur"
    },
    femur_right: {
      path: "M380,440 Q385,445 390,470 L400,540 Q405,545 400,550 Q390,555 380,550 Q375,545 380,540 L370,470 Q365,445 370,440 Q375,435 380,440 Z",
      center: { x: 380, y: 495 },
      label: "Right Femur"
    },
    patella_left: {
      path: "M265,540 Q260,545 265,555 Q270,560 275,555 Q280,545 275,540 Q270,535 265,540 Z",
      center: { x: 270, y: 547 },
      label: "Left Patella"
    },
    patella_right: {
      path: "M395,540 Q400,545 395,555 Q390,560 385,555 Q380,545 385,540 Q390,535 395,540 Z",
      center: { x: 390, y: 547 },
      label: "Right Patella"
    },
    tibia_left: {
      path: "M260,550 Q255,555 250,580 L240,650 Q235,655 240,660 Q250,665 260,660 Q265,655 260,650 L270,580 Q275,555 270,550 Q265,545 260,550 Z",
      center: { x: 260, y: 605 },
      label: "Left Tibia"
    },
    tibia_right: {
      path: "M400,550 Q405,555 410,580 L420,650 Q425,655 420,660 Q410,665 400,660 Q395,655 400,650 L390,580 Q385,555 390,550 Q395,545 400,550 Z",
      center: { x: 400, y: 605 },
      label: "Right Tibia"
    },
    fibula_left: {
      path: "M280,550 Q275,555 270,580 L260,650 Q255,655 260,660 Q270,665 280,660 Q285,655 280,650 L290,580 Q295,555 290,550 Q285,545 280,550 Z",
      center: { x: 280, y: 605 },
      label: "Left Fibula"
    },
    fibula_right: {
      path: "M380,550 Q385,555 390,580 L400,650 Q405,655 400,660 Q390,665 380,660 Q375,655 380,650 L370,580 Q365,555 370,550 Q375,545 380,550 Z",
      center: { x: 380, y: 605 },
      label: "Right Fibula"
    },

    // FOOT BONES (LEFT)
    foot_left: {
      path: "M240,660 Q230,665 225,675 L215,695 Q210,705 220,710 Q245,720 265,715 Q275,710 270,700 L275,680 Q280,670 270,665 Q255,660 240,660 Z",
      center: { x: 245, y: 685 },
      label: "Left Foot"
    },
    left_calcaneus: {
      path: "M240,660 Q235,665 240,675 Q245,680 250,675 Q255,665 250,660 Q245,655 240,660 Z",
      center: { x: 245, y: 667 },
      label: "Left Calcaneus"
    },
    left_talus: {
      path: "M250,660 Q245,665 250,675 Q255,680 260,675 Q265,665 260,660 Q255,655 250,660 Z",
      center: { x: 255, y: 667 },
      label: "Left Talus"
    },
    left_navicular: {
      path: "M260,660 Q255,665 260,675 Q265,680 270,675 Q275,665 270,660 Q265,655 260,660 Z",
      center: { x: 265, y: 667 },
      label: "Left Navicular"
    },
    left_cuboid: {
      path: "M240,675 Q235,680 240,690 Q245,695 250,690 Q255,680 250,675 Q245,670 240,675 Z",
      center: { x: 245, y: 682 },
      label: "Left Cuboid"
    },
    left_medial_cuneiform: {
      path: "M250,675 Q245,680 250,690 Q255,695 260,690 Q265,680 260,675 Q255,670 250,675 Z",
      center: { x: 255, y: 682 },
      label: "Left Medial Cuneiform"
    },
    left_intermediate_cuneiform: {
      path: "M260,675 Q255,680 260,690 Q265,695 270,690 Q275,680 270,675 Q265,670 260,675 Z",
      center: { x: 265, y: 682 },
      label: "Left Intermediate Cuneiform"
    },
    left_lateral_cuneiform: {
      path: "M270,675 Q265,680 270,690 Q275,695 280,690 Q285,680 280,675 Q275,670 270,675 Z",
      center: { x: 275, y: 682 },
      label: "Left Lateral Cuneiform"
    },
    left_1st_metatarsal: {
      path: "M250,690 Q245,695 250,705 Q255,710 260,705 Q265,695 260,690 Q255,685 250,690 Z",
      center: { x: 255, y: 697 },
      label: "Left 1st Metatarsal"
    },
    left_2nd_metatarsal: {
      path: "M240,690 Q235,695 240,705 Q245,710 250,705 Q255,695 250,690 Q245,685 240,690 Z",
      center: { x: 245, y: 697 },
      label: "Left 2nd Metatarsal"
    },
    left_3rd_metatarsal: {
      path: "M230,690 Q225,695 230,705 Q235,710 240,705 Q245,695 240,690 Q235,685 230,690 Z",
      center: { x: 235, y: 697 },
      label: "Left 3rd Metatarsal"
    },
    left_4th_metatarsal: {
      path: "M220,690 Q215,695 220,705 Q225,710 230,705 Q235,695 230,690 Q225,685 220,690 Z",
      center: { x: 225, y: 697 },
      label: "Left 4th Metatarsal"
    },
    left_5th_metatarsal: {
      path: "M210,690 Q205,695 210,705 Q215,710 220,705 Q225,695 220,690 Q215,685 210,690 Z",
      center: { x: 215, y: 697 },
      label: "Left 5th Metatarsal"
    },
    left_big_toe_proximal_phalanx: {
      path: "M250,705 Q245,710 250,720 Q255,725 260,720 Q265,710 260,705 Q255,700 250,705 Z",
      center: { x: 255, y: 712 },
      label: "Left Big Toe Proximal Phalanx"
    },
    left_big_toe_distal_phalanx: {
      path: "M250,720 Q245,725 250,735 Q255,740 260,735 Q265,725 260,720 Q255,715 250,720 Z",
      center: { x: 255, y: 727 },
      label: "Left Big Toe Distal Phalanx"
    },
    left_2nd_toe_proximal_phalanx: {
      path: "M240,705 Q235,710 240,720 Q245,725 250,720 Q255,710 250,705 Q245,700 240,705 Z",
      center: { x: 245, y: 712 },
      label: "Left 2nd Toe Proximal Phalanx"
    },
    left_2nd_toe_middle_phalanx: {
      path: "M240,720 Q235,725 240,735 Q245,740 250,735 Q255,725 250,720 Q245,715 240,720 Z",
      center: { x: 245, y: 727 },
      label: "Left 2nd Toe Middle Phalanx"
    },
    left_2nd_toe_distal_phalanx: {
      path: "M240,735 Q235,740 240,750 Q245,755 250,750 Q255,740 250,735 Q245,730 240,735 Z",
      center: { x: 245, y: 742 },
      label: "Left 2nd Toe Distal Phalanx"
    },
    left_3rd_toe_proximal_phalanx: {
      path: "M230,705 Q225,710 230,720 Q235,725 240,720 Q245,710 240,705 Q235,700 230,705 Z",
      center: { x: 235, y: 712 },
      label: "Left 3rd Toe Proximal Phalanx"
    },
    left_3rd_toe_middle_phalanx: {
      path: "M230,720 Q225,725 230,735 Q235,740 240,735 Q245,725 240,720 Q235,715 230,720 Z",
      center: { x: 235, y: 727 },
      label: "Left 3rd Toe Middle Phalanx"
    },
    left_3rd_toe_distal_phalanx: {
      path: "M230,735 Q225,740 230,750 Q235,755 240,750 Q245,740 240,735 Q235,730 230,735 Z",
      center: { x: 235, y: 742 },
      label: "Left 3rd Toe Distal Phalanx"
    },
    left_4th_toe_proximal_phalanx: {
      path: "M220,705 Q215,710 220,720 Q225,725 230,720 Q235,710 230,705 Q225,700 220,705 Z",
      center: { x: 225, y: 712 },
      label: "Left 4th Toe Proximal Phalanx"
    },
    left_4th_toe_middle_phalanx: {
      path: "M220,720 Q215,725 220,735 Q225,740 230,735 Q235,725 230,720 Q225,715 220,720 Z",
      center: { x: 225, y: 727 },
      label: "Left 4th Toe Middle Phalanx"
    },
    left_4th_toe_distal_phalanx: {
      path: "M220,735 Q215,740 220,750 Q225,755 230,750 Q235,740 230,735 Q225,730 220,735 Z",
      center: { x: 225, y: 742 },
      label: "Left 4th Toe Distal Phalanx"
    },
    left_5th_toe_proximal_phalanx: {
      path: "M210,705 Q205,710 210,720 Q215,725 220,720 Q225,710 220,705 Q215,700 210,705 Z",
      center: { x: 215, y: 712 },
      label: "Left 5th Toe Proximal Phalanx"
    },
    left_5th_toe_middle_phalanx: {
      path: "M210,720 Q205,725 210,735 Q215,740 220,735 Q225,725 220,720 Q215,715 210,720 Z",
      center: { x: 215, y: 727 },
      label: "Left 5th Toe Middle Phalanx"
    },
    left_5th_toe_distal_phalanx: {
      path: "M210,735 Q205,740 210,750 Q215,755 220,750 Q225,740 220,735 Q215,730 210,735 Z",
      center: { x: 215, y: 742 },
      label: "Left 5th Toe Distal Phalanx"
    },

    // FOOT BONES (RIGHT)
    foot_right: {
      path: "M420,660 Q430,665 435,675 L445,695 Q450,705 440,710 Q415,720 395,715 Q385,710 390,700 L385,680 Q380,670 390,665 Q405,660 420,660 Z",
      center: { x: 415, y: 685 },
      label: "Right Foot"
    },
    right_calcaneus: {
      path: "M420,660 Q425,665 420,675 Q415,680 410,675 Q405,665 410,660 Q415,655 420,660 Z",
      center: { x: 415, y: 667 },
      label: "Right Calcaneus"
    },
    right_talus: {
      path: "M410,660 Q415,665 410,675 Q405,680 400,675 Q395,665 400,660 Q405,655 410,660 Z",
      center: { x: 405, y: 667 },
      label: "Right Talus"
    },
    right_navicular: {
      path: "M400,660 Q405,665 400,675 Q395,680 390,675 Q385,665 390,660 Q395,655 400,660 Z",
      center: { x: 395, y: 667 },
      label: "Right Navicular"
    },
    right_cuboid: {
      path: "M420,675 Q425,680 420,690 Q415,695 410,690 Q405,680 410,675 Q415,670 420,675 Z",
      center: { x: 415, y: 682 },
      label: "Right Cuboid"
    },
    right_medial_cuneiform: {
      path: "M410,675 Q415,680 410,690 Q405,695 400,690 Q395,680 400,675 Q405,670 410,675 Z",
      center: { x: 405, y: 682 },
      label: "Right Medial Cuneiform"
    },
    right_intermediate_cuneiform: {
      path: "M400,675 Q405,680 400,690 Q395,695 390,690 Q385,680 390,675 Q395,670 400,675 Z",
      center: { x: 395, y: 682 },
      label: "Right Intermediate Cuneiform"
    },
    right_lateral_cuneiform: {
      path: "M390,675 Q395,680 390,690 Q385,695 380,690 Q375,680 380,675 Q385,670 390,675 Z",
      center: { x: 385, y: 682 },
      label: "Right Lateral Cuneiform"
    },
    right_1st_metatarsal: {
      path: "M410,690 Q415,695 410,705 Q405,710 400,705 Q395,695 400,690 Q405,685 410,690 Z",
      center: { x: 405, y: 697 },
      label: "Right 1st Metatarsal"
    },
    right_2nd_metatarsal: {
      path: "M420,690 Q425,695 420,705 Q415,710 410,705 Q405,695 410,690 Q415,685 420,690 Z",
      center: { x: 415, y: 697 },
      label: "Right 2nd Metatarsal"
    },
    right_3rd_metatarsal: {
      path: "M430,690 Q435,695 430,705 Q425,710 420,705 Q415,695 420,690 Q425,685 430,690 Z",
      center: { x: 425, y: 697 },
      label: "Right 3rd Metatarsal"
    },
    right_4th_metatarsal: {
      path: "M440,690 Q445,695 440,705 Q435,710 430,705 Q425,695 430,690 Q435,685 440,690 Z",
      center: { x: 435, y: 697 },
      label: "Right 4th Metatarsal"
    },
    right_5th_metatarsal: {
      path: "M450,690 Q455,695 450,705 Q445,710 440,705 Q435,695 440,690 Q445,685 450,690 Z",
      center: { x: 445, y: 697 },
      label: "Right 5th Metatarsal"
    },
    right_big_toe_proximal_phalanx: {
      path: "M410,705 Q415,710 410,720 Q405,725 400,720 Q395,710 400,705 Q405,700 410,705 Z",
      center: { x: 405, y: 712 },
      label: "Right Big Toe Proximal Phalanx"
    },
    right_big_toe_distal_phalanx: {
      path: "M410,720 Q415,725 410,735 Q405,740 400,735 Q395,725 400,720 Q405,715 410,720 Z",
      center: { x: 405, y: 727 },
      label: "Right Big Toe Distal Phalanx"
    },
    right_2nd_toe_proximal_phalanx: {
      path: "M420,705 Q425,710 420,720 Q415,725 410,720 Q405,710 410,705 Q415,700 420,705 Z",
      center: { x: 415, y: 712 },
      label: "Right 2nd Toe Proximal Phalanx"
    },
    right_2nd_toe_middle_phalanx: {
      path: "M420,720 Q425,725 420,735 Q415,740 410,735 Q405,725 410,720 Q415,715 420,720 Z",
      center: { x: 415, y: 727 },
      label: "Right 2nd Toe Middle Phalanx"
    },
    right_2nd_toe_distal_phalanx: {
      path: "M420,735 Q425,740 420,750 Q415,755 410,750 Q405,740 410,735 Q415,730 420,735 Z",
      center: { x: 415, y: 742 },
      label: "Right 2nd Toe Distal Phalanx"
    },
    right_3rd_toe_proximal_phalanx: {
      path: "M430,705 Q435,710 430,720 Q425,725 420,720 Q415,710 420,705 Q425,700 430,705 Z",
      center: { x: 425, y: 712 },
      label: "Right 3rd Toe Proximal Phalanx"
    },
    right_3rd_toe_middle_phalanx: {
      path: "M430,720 Q435,725 430,735 Q425,740 420,735 Q415,725 420,720 Q415,715 430,720 Z",
      center: { x: 425, y: 727 },
      label: "Right 3rd Toe Middle Phalanx"
    },
    right_3rd_toe_distal_phalanx: {
      path: "M430,735 Q435,740 430,750 Q425,755 420,750 Q415,740 420,735 Q425,730 430,735 Z",
      center: { x: 425, y: 742 },
      label: "Right 3rd Toe Distal Phalanx"
    },
    right_4th_toe_proximal_phalanx: {
      path: "M440,705 Q445,710 440,720 Q435,725 430,720 Q425,710 430,705 Q435,700 440,705 Z",
      center: { x: 435, y: 712 },
      label: "Right 4th Toe Proximal Phalanx"
    },
    right_4th_toe_middle_phalanx: {
      path: "M440,720 Q445,725 440,735 Q435,740 430,735 Q425,725 430,720 Q435,715 440,720 Z",
      center: { x: 435, y: 727 },
      label: "Right 4th Toe Middle Phalanx"
    },
    right_4th_toe_distal_phalanx: {
      path: "M440,735 Q445,740 440,750 Q435,755 430,750 Q425,740 430,735 Q435,730 440,735 Z",
      center: { x: 435, y: 742 },
      label: "Right 4th Toe Distal Phalanx"
    },
    right_5th_toe_proximal_phalanx: {
      path: "M450,705 Q455,710 450,720 Q445,725 440,720 Q435,710 440,705 Q445,700 450,705 Z",
      center: { x: 445, y: 712 },
      label: "Right 5th Toe Proximal Phalanx"
    },
    right_5th_toe_middle_phalanx: {
      path: "M450,720 Q455,725 450,735 Q445,740 440,735 Q435,725 440,720 Q445,715 450,720 Z",
      center: { x: 445, y: 727 },
      label: "Right 5th Toe Middle Phalanx"
    },
    right_5th_toe_distal_phalanx: {
      path: "M450,735 Q455,740 450,750 Q445,755 440,750 Q435,740 440,735 Q445,730 450,735 Z",
      center: { x: 445, y: 742 },
      label: "Right 5th Toe Distal Phalanx"
    },

    // JOINTS
    shoulder_left: {
      path: "M240,310 Q230,305 225,315 Q230,325 240,320 Q250,315 245,305 Q240,300 240,310 Z",
      center: { x: 237, y: 312 },
      label: "Left Shoulder"
    },
    shoulder_right: {
      path: "M420,310 Q430,305 435,315 Q430,325 420,320 Q410,315 415,305 Q420,300 420,310 Z",
      center: { x: 423, y: 312 },
      label: "Right Shoulder"
    },
    elbow_left: {
      path: "M225,390 Q215,385 210,395 Q215,405 225,400 Q235,395 230,385 Q225,380 225,390 Z",
      center: { x: 222, y: 392 },
      label: "Left Elbow"
    },
    elbow_right: {
      path: "M435,390 Q445,385 450,395 Q445,405 435,400 Q425,395 430,385 Q435,380 435,390 Z",
      center: { x: 438, y: 392 },
      label: "Right Elbow"
    },
    wrist_left: {
      path: "M210,470 Q200,465 195,475 Q200,485 210,480 Q220,475 215,465 Q210,460 210,470 Z",
      center: { x: 207, y: 472 },
      label: "Left Wrist"
    },
    wrist_right: {
      path: "M450,470 Q460,465 465,475 Q460,485 450,480 Q440,475 445,465 Q450,460 450,470 Z",
      center: { x: 453, y: 472 },
      label: "Right Wrist"
    },
    hip_left: {
      path: "M280,440 Q270,435 265,445 Q270,455 280,450 Q290,445 285,435 Q280,430 280,440 Z",
      center: { x: 277, y: 442 },
      label: "Left Hip"
    },
    hip_right: {
      path: "M380,440 Q390,435 395,445 Q390,455 380,450 Q370,445 375,435 Q380,430 380,440 Z",
      center: { x: 383, y: 442 },
      label: "Right Hip"
    },
    knee_left: {
      path: "M260,550 Q250,545 245,555 Q250,565 260,560 Q270,555 265,545 Q260,540 260,550 Z",
      center: { x: 257, y: 552 },
      label: "Left Knee"
    },
    knee_right: {
      path: "M400,550 Q410,545 415,555 Q410,565 400,560 Q390,555 395,545 Q400,540 400,550 Z",
      center: { x: 403, y: 552 },
      label: "Right Knee"
    },
    ankle_left: {
      path: "M240,660 Q230,655 225,665 Q230,675 240,670 Q250,665 245,655 Q240,650 240,660 Z",
      center: { x: 237, y: 662 },
      label: "Left Ankle"
    },
    ankle_right: {
      path: "M420,660 Q430,655 435,665 Q430,675 420,670 Q410,665 415,655 Q420,650 420,660 Z",
      center: { x: 423, y: 662 },
      label: "Right Ankle"
    },

    // SESAMOID BONES
    left_thumb_sesamoid: {
      path: "M195,525 Q190,530 195,540 Q200,545 205,540 Q210,530 205,525 Q200,520 195,525 Z",
      center: { x: 200, y: 532 },
      label: "Left Thumb Sesamoid Bones"
    },
    right_thumb_sesamoid: {
      path: "M465,525 Q470,530 465,540 Q460,545 455,540 Q450,530 455,525 Q460,520 465,525 Z",
      center: { x: 460, y: 532 },
      label: "Right Thumb Sesamoid Bones"
    },
    left_big_toe_sesamoid: {
      path: "M250,730 Q245,735 250,745 Q255,750 260,745 Q265,735 260,730 Q255,725 250,730 Z",
      center: { x: 255, y: 737 },
      label: "Left Big Toe Sesamoid Bones"
    },
    right_big_toe_sesamoid: {
      path: "M410,730 Q415,735 410,745 Q405,750 400,745 Q395,735 400,730 Q405,725 410,730 Z",
      center: { x: 405, y: 737 },
      label: "Right Big Toe Sesamoid Bones"
    }
  };

  const handlePartClick = (partKey: string) => {
    onBodyPartSelect(partKey);
  };

  const isPartSelected = (partKey: string): boolean => {
    return selectedBodyPart === partKey;
  };

  const getPartColor = (partKey: string): string => {
    if (isPartSelected(partKey)) return "xray-bone-selected";
    if (hoveredPart === partKey) return "xray-bone-hover";
    return "xray-bone";
  };

  const getPartStroke = (partKey: string): string => {
    if (isPartSelected(partKey)) return "xray-highlight";
    return "xray-joint";
  };

  return (
    <div className={`bg-gradient-to-br from-xray-background via-slate-900 to-xray-background rounded-xl p-6 border border-slate-700 shadow-2xl ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <h3 className="text-xl font-bold text-xray-bone mb-6 text-center">
        {t('xray.bodyPartSelection.title')}
      </h3>

      <div className="flex justify-center">
        <div className="relative">
          <svg
            width="660"
            height="760"
            viewBox="0 0 660 760"
            className="max-w-full h-auto filter drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 0 20px hsl(var(--xray-glow)))' }}
          >
            {/* Background glow effect */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="boneGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--xray-bone))" />
                <stop offset="100%" stopColor="hsl(var(--xray-joint))" />
              </radialGradient>
            </defs>

            {/* Render all anatomical parts */}
            {Object.entries(anatomicalParts).map(([partKey, part]) => (
              <g key={partKey}>
                <path
                  d={part.path}
                  fill="#fff" // white fill
                  stroke="#222" // dark stroke for visibility
                  strokeWidth="1"
                  className="cursor-pointer transition-all duration-300 hover:brightness-110"
                  filter={isPartSelected(partKey) || hoveredPart === partKey ? "url(#glow)" : undefined}
                  onMouseEnter={() => setHoveredPart(partKey)}
                  onMouseLeave={() => setHoveredPart(null)}
                  onClick={() => handlePartClick(partKey)}
                />

                {/* Labels for hovered or selected parts */}
                {(hoveredPart === partKey || isPartSelected(partKey)) && (
                  <>
                    {/* Label background */}
                    <rect
                      x={part.center.x - (part.label.length * 4)}
                      y={part.center.y - 25}
                      width={part.label.length * 8}
                      height={20}
                      fill="hsl(var(--xray-background))"
                      stroke="hsl(var(--xray-highlight))"
                      strokeWidth="1"
                      rx="4"
                      className="opacity-90"
                    />
                    {/* Label text */}
                    <text
                      x={part.center.x}
                      y={part.center.y - 10}
                      textAnchor="middle"
                      fill="#fff" // dark text for visibility on white
                      className="text-xs font-bold pointer-events-none"
                      style={{ fontSize: '11px' }}
                    >
                      {part.label}
                    </text>
                  </>
                )}
              </g>
            ))}

            {/* Connection lines to show bone relationships */}
            <g stroke="hsl(var(--xray-joint))" strokeWidth="1" opacity="0.3" strokeDasharray="2,2">
              {/* Spine connections */}
              <line x1="330" y1="190" x2="330" y2="460" />
              {/* Arm bone connections */}
              <line x1="240" y1="310" x2="225" y2="390" />
              <line x1="420" y1="310" x2="435" y2="390" />
              {/* Leg bone connections */}
              <line x1="280" y1="440" x2="260" y2="550" />
              <line x1="380" y1="440" x2="400" y2="550" />
            </g>
          </svg>
        </div>
      </div>

      {selectedBodyPart && (
        <div className={`mt-6 ${isRTL ? 'text-right' : 'text-center'}`}>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-xray-highlight/20 to-blue-600/20 border border-xray-highlight/50 ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-3 h-3 rounded-full bg-xray-highlight animate-pulse"></div>
            <span className={`text-xray-bone font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('xray.selected')}:
              <span className="text-xray-highlight">
                {t(`xray.bodyParts.${selectedBodyPart}`) || anatomicalParts[selectedBodyPart as keyof typeof anatomicalParts]?.label || selectedBodyPart}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Main XRay Component
const XRay = () => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [patientName, setPatientName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [requestingDoctor, setRequestingDoctor] = useState("");
  const [clinicalIndication, setClinicalIndication] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Doctor selection states
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
  const [doctorSearchResults, setDoctorSearchResults] = useState<Doctor[]>([]);
  const [isSearchingDoctors, setIsSearchingDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDoctorSearchResults, setShowDoctorSearchResults] = useState(false);
  const doctorSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Patient search states
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Doctor search function
  const searchDoctors = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setDoctorSearchResults([]);
      setShowDoctorSearchResults(false);
      return;
    }

    try {
      setIsSearchingDoctors(true);

      const { data: doctors, error } = await supabase
        .from('doctors')
        .select(`
          *,
          clinics:clinic_id (
            name,
            name_ar
          )
        `)
        .or(`name.ilike.%${searchTerm}%,name_ar.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%,specialty_ar.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .eq('is_available', true)
        .order('name', { ascending: true })
        .limit(10);

      if (error) {
        throw error;
      }

      // Transform the data to match our interface
      const transformedDoctors: Doctor[] = (doctors || []).map((doctor: {
        id: string;
        name: string;
        name_ar?: string;
        specialty: string;
        specialty_ar?: string;
        clinic_id: string;
        clinics?: { name?: string };
        email: string;
        phone?: string;
        is_available: boolean;
        price: number;
        created_at?: string;
        updated_at?: string;
      }) => ({
        id: doctor.id,
        name: doctor.name,
        name_ar: doctor.name_ar,
        specialty: doctor.specialty,
        specialty_ar: doctor.specialty_ar,
        clinic_id: doctor.clinic_id,
        clinic_name: doctor.clinics?.name || "Unknown Clinic",
        email: doctor.email,
        phone: doctor.phone,
        is_available: doctor.is_available,
        price: doctor.price,
        created_at: doctor.created_at,
        updated_at: doctor.updated_at
      }));

      setDoctorSearchResults(transformedDoctors);
      setShowDoctorSearchResults(true);
    } catch (error) {
      console.error('Error searching doctors:', error);
      toast({
        title: t('xray.errors.searchError'),
        description: t('xray.errors.doctorSearchFailed'),
        variant: "destructive",
      });
      setDoctorSearchResults([]);
      setShowDoctorSearchResults(false);
    } finally {
      setIsSearchingDoctors(false);
    }
  };

  // Patient search function
  const searchPatients = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setIsSearching(true);

      const { data: patients, error } = await supabase
        .from('userinfo')
        .select('*')
        .or(`user_email.ilike.%${searchTerm}%,english_username_a.ilike.%${searchTerm}%,english_username_d.ilike.%${searchTerm}%,arabic_username_a.ilike.%${searchTerm}%,arabic_username_d.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%`)
        .eq('user_roles', 'Patient')
        .order('english_username_a', { ascending: true })
        .limit(10);

      if (error) {
        throw error;
      }

      setSearchResults(patients || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching patients:', error);
      toast({
        title: t('xray.errors.searchError'),
        description: t('xray.errors.patientSearchFailed'),
        variant: "destructive",
      });
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle doctor search input change with debouncing
  const handleDoctorSearchChange = (value: string) => {
    setDoctorSearchTerm(value);

    // Clear existing timeout
    if (doctorSearchTimeoutRef.current) {
      clearTimeout(doctorSearchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    doctorSearchTimeoutRef.current = setTimeout(() => {
      searchDoctors(value);
    }, 300);
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setRequestingDoctor(doctor.name);
    setDoctorSearchTerm(doctor.name);
    setShowDoctorSearchResults(false);
    setDoctorSearchResults([]);
  };

  // Clear doctor selection
  const clearDoctorSelection = () => {
    setSelectedDoctor(null);
    setRequestingDoctor("");
    setDoctorSearchTerm("");
    setShowDoctorSearchResults(false);
    setDoctorSearchResults([]);
  };

  // Handle search input change with debouncing
  const handleSearchChange = (value: string) => {
    setPatientSearchTerm(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchPatients(value);
    }, 300);
  };

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientName(`${patient.english_username_a} ${patient.english_username_d || ''}`.trim());
    setDateOfBirth(patient.date_of_birth || '');
    setPatientSearchTerm(`${patient.english_username_a} ${patient.english_username_d || ''}`.trim());
    setShowSearchResults(false);
    setSearchResults([]);
  };

  // Clear patient selection
  const clearPatientSelection = () => {
    setSelectedPatient(null);
    setPatientName("");
    setDateOfBirth("");
    setPatientSearchTerm("");
    setShowSearchResults(false);
    setSearchResults([]);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (doctorSearchTimeoutRef.current) {
        clearTimeout(doctorSearchTimeoutRef.current);
      }
    };
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.patient-search-container')) {
        setShowSearchResults(false);
      }
      if (!target.closest('.doctor-search-container')) {
        setShowDoctorSearchResults(false);
      }
    };

    if (showSearchResults || showDoctorSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSearchResults, showDoctorSearchResults]);

  // Body parts list for dropdown
  const bodyPartsOptions = [
    // SKULL AND FACIAL BONES
    { value: "skull", label: "Skull" },
    { value: "frontal_bone", label: "Frontal Bone" },
    { value: "left_parietal_bone", label: "Left Parietal Bone" },
    { value: "right_parietal_bone", label: "Right Parietal Bone" },
    { value: "left_temporal_bone", label: "Left Temporal Bone" },
    { value: "right_temporal_bone", label: "Right Temporal Bone" },
    { value: "occipital_bone", label: "Occipital Bone" },
    { value: "sphenoid_bone", label: "Sphenoid Bone" },
    { value: "ethmoid_bone", label: "Ethmoid Bone" },
    { value: "left_nasal_bone", label: "Left Nasal Bone" },
    { value: "right_nasal_bone", label: "Right Nasal Bone" },
    { value: "left_maxilla", label: "Left Maxilla" },
    { value: "right_maxilla", label: "Right Maxilla" },
    { value: "mandible", label: "Mandible (Lower Jaw)" },
    { value: "left_zygomatic_bone", label: "Left Zygomatic Bone (Cheekbone)" },
    { value: "right_zygomatic_bone", label: "Right Zygomatic Bone (Cheekbone)" },
    { value: "left_palatine_bone", label: "Left Palatine Bone" },
    { value: "right_palatine_bone", label: "Right Palatine Bone" },
    { value: "left_lacrimal_bone", label: "Left Lacrimal Bone" },
    { value: "right_lacrimal_bone", label: "Right Lacrimal Bone" },
    { value: "left_inferior_nasal_concha", label: "Left Inferior Nasal Concha" },
    { value: "right_inferior_nasal_concha", label: "Right Inferior Nasal Concha" },
    { value: "vomer", label: "Vomer" },

    // EAR BONES (OSSICLES)
    { value: "left_malleus", label: "Left Malleus" },
    { value: "right_malleus", label: "Right Malleus" },
    { value: "left_incus", label: "Left Incus" },
    { value: "right_incus", label: "Right Incus" },
    { value: "left_stapes", label: "Left Stapes" },
    { value: "right_stapes", label: "Right Stapes" },

    // HYOID BONE
    { value: "hyoid_bone", label: "Hyoid Bone" },

    // VERTEBRAL COLUMN
    { value: "cervical_spine", label: "Cervical Spine" },
    { value: "c1_atlas", label: "C1 (Atlas)" },
    { value: "c2_axis", label: "C2 (Axis)" },
    { value: "c3_vertebra", label: "C3 Vertebra" },
    { value: "c4_vertebra", label: "C4 Vertebra" },
    { value: "c5_vertebra", label: "C5 Vertebra" },
    { value: "c6_vertebra", label: "C6 Vertebra" },
    { value: "c7_vertebra", label: "C7 Vertebra" },
    { value: "thoracic_spine", label: "Thoracic Spine" },
    { value: "t1_vertebra", label: "T1 Vertebra" },
    { value: "t2_vertebra", label: "T2 Vertebra" },
    { value: "t3_vertebra", label: "T3 Vertebra" },
    { value: "t4_vertebra", label: "T4 Vertebra" },
    { value: "t5_vertebra", label: "T5 Vertebra" },
    { value: "t6_vertebra", label: "T6 Vertebra" },
    { value: "t7_vertebra", label: "T7 Vertebra" },
    { value: "t8_vertebra", label: "T8 Vertebra" },
    { value: "t9_vertebra", label: "T9 Vertebra" },
    { value: "t10_vertebra", label: "T10 Vertebra" },
    { value: "t11_vertebra", label: "T11 Vertebra" },
    { value: "t12_vertebra", label: "T12 Vertebra" },
    { value: "lumbar_spine", label: "Lumbar Spine" },
    { value: "l1_vertebra", label: "L1 Vertebra" },
    { value: "l2_vertebra", label: "L2 Vertebra" },
    { value: "l3_vertebra", label: "L3 Vertebra" },
    { value: "l4_vertebra", label: "L4 Vertebra" },
    { value: "l5_vertebra", label: "L5 Vertebra" },
    { value: "sacrum", label: "Sacrum" },
    { value: "coccyx", label: "Coccyx (Tailbone)" },

    // THORACIC CAGE
    { value: "sternum", label: "Sternum" },
    { value: "manubrium", label: "Manubrium" },
    { value: "sternal_body", label: "Sternal Body" },
    { value: "xiphoid_process", label: "Xiphoid Process" },
    { value: "ribs_left", label: "Left Ribs" },
    { value: "ribs_right", label: "Right Ribs" },
    { value: "left_1st_rib", label: "Left 1st Rib" },
    { value: "right_1st_rib", label: "Right 1st Rib" },
    { value: "left_2nd_rib", label: "Left 2nd Rib" },
    { value: "right_2nd_rib", label: "Right 2nd Rib" },
    { value: "left_3rd_rib", label: "Left 3rd Rib" },
    { value: "right_3rd_rib", label: "Right 3rd Rib" },
    { value: "left_4th_rib", label: "Left 4th Rib" },
    { value: "right_4th_rib", label: "Right 4th Rib" },
    { value: "left_5th_rib", label: "Left 5th Rib" },
    { value: "right_5th_rib", label: "Right 5th Rib" },
    { value: "left_6th_rib", label: "Left 6th Rib" },
    { value: "right_6th_rib", label: "Right 6th Rib" },
    { value: "left_7th_rib", label: "Left 7th Rib" },
    { value: "right_7th_rib", label: "Right 7th Rib" },
    { value: "left_8th_rib", label: "Left 8th Rib" },
    { value: "right_8th_rib", label: "Right 8th Rib" },
    { value: "left_9th_rib", label: "Left 9th Rib" },
    { value: "right_9th_rib", label: "Right 9th Rib" },
    { value: "left_10th_rib", label: "Left 10th Rib" },
    { value: "right_10th_rib", label: "Right 10th Rib" },
    { value: "left_11th_rib", label: "Left 11th Rib" },
    { value: "right_11th_rib", label: "Right 11th Rib" },
    { value: "left_12th_rib", label: "Left 12th Rib" },
    { value: "right_12th_rib", label: "Right 12th Rib" },

    // UPPER LIMB BONES
    { value: "clavicle_left", label: "Left Clavicle" },
    { value: "clavicle_right", label: "Right Clavicle" },
    { value: "scapula_left", label: "Left Scapula" },
    { value: "scapula_right", label: "Right Scapula" },
    { value: "humerus_left", label: "Left Humerus" },
    { value: "humerus_right", label: "Right Humerus" },
    { value: "radius_left", label: "Left Radius" },
    { value: "radius_right", label: "Right Radius" },
    { value: "ulna_left", label: "Left Ulna" },
    { value: "ulna_right", label: "Right Ulna" },

    // HAND BONES (LEFT)
    { value: "hand_left", label: "Left Hand" },
    { value: "left_scaphoid", label: "Left Scaphoid" },
    { value: "left_lunate", label: "Left Lunate" },
    { value: "left_triquetral", label: "Left Triquetral" },
    { value: "left_pisiform", label: "Left Pisiform" },
    { value: "left_trapezium", label: "Left Trapezium" },
    { value: "left_trapezoid", label: "Left Trapezoid" },
    { value: "left_capitate", label: "Left Capitate" },
    { value: "left_hamate", label: "Left Hamate" },
    { value: "left_1st_metacarpal", label: "Left 1st Metacarpal" },
    { value: "left_2nd_metacarpal", label: "Left 2nd Metacarpal" },
    { value: "left_3rd_metacarpal", label: "Left 3rd Metacarpal" },
    { value: "left_4th_metacarpal", label: "Left 4th Metacarpal" },
    { value: "left_5th_metacarpal", label: "Left 5th Metacarpal" },
    { value: "left_thumb_proximal_phalanx", label: "Left Thumb Proximal Phalanx" },
    { value: "left_thumb_distal_phalanx", label: "Left Thumb Distal Phalanx" },
    { value: "left_index_proximal_phalanx", label: "Left Index Proximal Phalanx" },
    { value: "left_index_middle_phalanx", label: "Left Index Middle Phalanx" },
    { value: "left_index_distal_phalanx", label: "Left Index Distal Phalanx" },
    { value: "left_middle_proximal_phalanx", label: "Left Middle Proximal Phalanx" },
    { value: "left_middle_middle_phalanx", label: "Left Middle Middle Phalanx" },
    { value: "left_middle_distal_phalanx", label: "Left Middle Distal Phalanx" },
    { value: "left_ring_proximal_phalanx", label: "Left Ring Proximal Phalanx" },
    { value: "left_ring_middle_phalanx", label: "Left Ring Middle Phalanx" },
    { value: "left_ring_distal_phalanx", label: "Left Ring Distal Phalanx" },
    { value: "left_pinky_proximal_phalanx", label: "Left Pinky Proximal Phalanx" },
    { value: "left_pinky_middle_phalanx", label: "Left Pinky Middle Phalanx" },
    { value: "left_pinky_distal_phalanx", label: "Left Pinky Distal Phalanx" },

    // HAND BONES (RIGHT)
    { value: "hand_right", label: "Right Hand" },
    { value: "right_scaphoid", label: "Right Scaphoid" },
    { value: "right_lunate", label: "Right Lunate" },
    { value: "right_triquetral", label: "Right Triquetral" },
    { value: "right_pisiform", label: "Right Pisiform" },
    { value: "right_trapezium", label: "Right Trapezium" },
    { value: "right_trapezoid", label: "Right Trapezoid" },
    { value: "right_capitate", label: "Right Capitate" },
    { value: "right_hamate", label: "Right Hamate" },
    { value: "right_1st_metacarpal", label: "Right 1st Metacarpal" },
    { value: "right_2nd_metacarpal", label: "Right 2nd Metacarpal" },
    { value: "right_3rd_metacarpal", label: "Right 3rd Metacarpal" },
    { value: "right_4th_metacarpal", label: "Right 4th Metacarpal" },
    { value: "right_5th_metacarpal", label: "Right 5th Metacarpal" },
    { value: "right_thumb_proximal_phalanx", label: "Right Thumb Proximal Phalanx" },
    { value: "right_thumb_distal_phalanx", label: "Right Thumb Distal Phalanx" },
    { value: "right_index_proximal_phalanx", label: "Right Index Proximal Phalanx" },
    { value: "right_index_middle_phalanx", label: "Right Index Middle Phalanx" },
    { value: "right_index_distal_phalanx", label: "Right Index Distal Phalanx" },
    { value: "right_middle_proximal_phalanx", label: "Right Middle Proximal Phalanx" },
    { value: "right_middle_middle_phalanx", label: "Right Middle Middle Phalanx" },
    { value: "right_middle_distal_phalanx", label: "Right Middle Distal Phalanx" },
    { value: "right_ring_proximal_phalanx", label: "Right Ring Proximal Phalanx" },
    { value: "right_ring_middle_phalanx", label: "Right Ring Middle Phalanx" },
    { value: "right_ring_distal_phalanx", label: "Right Ring Distal Phalanx" },
    { value: "right_pinky_proximal_phalanx", label: "Right Pinky Proximal Phalanx" },
    { value: "right_pinky_middle_phalanx", label: "Right Pinky Middle Phalanx" },
    { value: "right_pinky_distal_phalanx", label: "Right Pinky Distal Phalanx" },

    // PELVIC GIRDLE
    { value: "pelvis", label: "Pelvis" },
    { value: "left_iliac", label: "Left Ilium" },
    { value: "right_iliac", label: "Right Ilium" },
    { value: "left_ischium", label: "Left Ischium" },
    { value: "right_ischium", label: "Right Ischium" },
    { value: "left_pubis", label: "Left Pubis" },
    { value: "right_pubis", label: "Right Pubis" },

    // LOWER LIMB BONES
    { value: "femur_left", label: "Left Femur" },
    { value: "femur_right", label: "Right Femur" },
    { value: "patella_left", label: "Left Patella (Kneecap)" },
    { value: "patella_right", label: "Right Patella (Kneecap)" },
    { value: "tibia_left", label: "Left Tibia" },
    { value: "tibia_right", label: "Right Tibia" },
    { value: "fibula_left", label: "Left Fibula" },
    { value: "fibula_right", label: "Right Fibula" },

    // FOOT BONES (LEFT)
    { value: "foot_left", label: "Left Foot" },
    { value: "left_calcaneus", label: "Left Calcaneus (Heel)" },
    { value: "left_talus", label: "Left Talus" },
    { value: "left_navicular", label: "Left Navicular" },
    { value: "left_cuboid", label: "Left Cuboid" },
    { value: "left_medial_cuneiform", label: "Left Medial Cuneiform" },
    { value: "left_intermediate_cuneiform", label: "Left Intermediate Cuneiform" },
    { value: "left_lateral_cuneiform", label: "Left Lateral Cuneiform" },
    { value: "left_1st_metatarsal", label: "Left 1st Metatarsal" },
    { value: "left_2nd_metatarsal", label: "Left 2nd Metatarsal" },
    { value: "left_3rd_metatarsal", label: "Left 3rd Metatarsal" },
    { value: "left_4th_metatarsal", label: "Left 4th Metatarsal" },
    { value: "left_5th_metatarsal", label: "Left 5th Metatarsal" },
    { value: "left_big_toe_proximal_phalanx", label: "Left Big Toe Proximal Phalanx" },
    { value: "left_big_toe_distal_phalanx", label: "Left Big Toe Distal Phalanx" },
    { value: "left_2nd_toe_proximal_phalanx", label: "Left 2nd Toe Proximal Phalanx" },
    { value: "left_2nd_toe_middle_phalanx", label: "Left 2nd Toe Middle Phalanx" },
    { value: "left_2nd_toe_distal_phalanx", label: "Left 2nd Toe Distal Phalanx" },
    { value: "left_3rd_toe_proximal_phalanx", label: "Left 3rd Toe Proximal Phalanx" },
    { value: "left_3rd_toe_middle_phalanx", label: "Left 3rd Toe Middle Phalanx" },
    { value: "left_3rd_toe_distal_phalanx", label: "Left 3rd Toe Distal Phalanx" },
    { value: "left_4th_toe_proximal_phalanx", label: "Left 4th Toe Proximal Phalanx" },
    { value: "left_4th_toe_middle_phalanx", label: "Left 4th Toe Middle Phalanx" },
    { value: "left_4th_toe_distal_phalanx", label: "Left 4th Toe Distal Phalanx" },
    { value: "left_5th_toe_proximal_phalanx", label: "Left 5th Toe Proximal Phalanx" },
    { value: "left_5th_toe_middle_phalanx", label: "Left 5th Toe Middle Phalanx" },
    { value: "left_5th_toe_distal_phalanx", label: "Left 5th Toe Distal Phalanx" },

    // FOOT BONES (RIGHT)
    { value: "foot_right", label: "Right Foot" },
    { value: "right_calcaneus", label: "Right Calcaneus (Heel)" },
    { value: "right_talus", label: "Right Talus" },
    { value: "right_navicular", label: "Right Navicular" },
    { value: "right_cuboid", label: "Right Cuboid" },
    { value: "right_medial_cuneiform", label: "Right Medial Cuneiform" },
    { value: "right_intermediate_cuneiform", label: "Right Intermediate Cuneiform" },
    { value: "right_lateral_cuneiform", label: "Right Lateral Cuneiform" },
    { value: "right_1st_metatarsal", label: "Right 1st Metatarsal" },
    { value: "right_2nd_metatarsal", label: "Right 2nd Metatarsal" },
    { value: "right_3rd_metatarsal", label: "Right 3rd Metatarsal" },
    { value: "right_4th_metatarsal", label: "Right 4th Metatarsal" },
    { value: "right_5th_metatarsal", label: "Right 5th Metatarsal" },
    { value: "right_big_toe_proximal_phalanx", label: "Right Big Toe Proximal Phalanx" },
    { value: "right_big_toe_distal_phalanx", label: "Right Big Toe Distal Phalanx" },
    { value: "right_2nd_toe_proximal_phalanx", label: "Right 2nd Toe Proximal Phalanx" },
    { value: "right_2nd_toe_middle_phalanx", label: "Right 2nd Toe Middle Phalanx" },
    { value: "right_2nd_toe_distal_phalanx", label: "Right 2nd Toe Distal Phalanx" },
    { value: "right_3rd_toe_proximal_phalanx", label: "Right 3rd Toe Proximal Phalanx" },
    { value: "right_3rd_toe_middle_phalanx", label: "Right 3rd Toe Middle Phalanx" },
    { value: "right_3rd_toe_distal_phalanx", label: "Right 3rd Toe Distal Phalanx" },
    { value: "right_4th_toe_proximal_phalanx", label: "Right 4th Toe Proximal Phalanx" },
    { value: "right_4th_toe_middle_phalanx", label: "Right 4th Toe Middle Phalanx" },
    { value: "right_4th_toe_distal_phalanx", label: "Right 4th Toe Distal Phalanx" },
    { value: "right_5th_toe_proximal_phalanx", label: "Right 5th Toe Proximal Phalanx" },
    { value: "right_5th_toe_middle_phalanx", label: "Right 5th Toe Middle Phalanx" },
    { value: "right_5th_toe_distal_phalanx", label: "Right 5th Toe Distal Phalanx" },

    // JOINTS
    { value: "shoulder_left", label: "Left Shoulder" },
    { value: "shoulder_right", label: "Right Shoulder" },
    { value: "elbow_left", label: "Left Elbow" },
    { value: "elbow_right", label: "Right Elbow" },
    { value: "wrist_left", label: "Left Wrist" },
    { value: "wrist_right", label: "Right Wrist" },
    { value: "hip_left", label: "Left Hip" },
    { value: "hip_right", label: "Right Hip" },
    { value: "knee_left", label: "Left Knee" },
    { value: "knee_right", label: "Right Knee" },
    { value: "ankle_left", label: "Left Ankle" },
    { value: "ankle_right", label: "Right Ankle" },

    // SESAMOID BONES
    { value: "left_thumb_sesamoid", label: "Left Thumb Sesamoid Bones" },
    { value: "right_thumb_sesamoid", label: "Right Thumb Sesamoid Bones" },
    { value: "left_big_toe_sesamoid", label: "Left Big Toe Sesamoid Bones" },
    { value: "right_big_toe_sesamoid", label: "Right Big Toe Sesamoid Bones" }
  ];

  const handleBodyPartSelect = (bodyPart: string) => {
    setSelectedBodyPart(bodyPart);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <>
      <SEOHead
        title={t('xray.seo.title')}
        description={t('xray.seo.description')}
        keywords={t('xray.seo.keywords')}
        url="https://bethlehemmedcenter.com/xray"
      />
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 md:p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-2">
{/* Header */}
<div className="mb-6 text-center px-2 pt-8">
  <div className="flex items-center mb-4 justify-center">
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
      <Camera className="w-8 h-8 text-white" />
    </div>
  </div>
  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4 text-center px-2 break-words leading-loose whitespace-normal py-2">
    {t('xray.title')}
  </h1>
  <p className="text-slate-600 text-base md:text-lg w-full text-center mx-auto px-2 break-words">
              {t('xray.subtitle')}
            </p>
          </div>

          <div className={`grid xl:grid-cols-3 gap-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Patient Information Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className={`bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-t-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                <CardTitle className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end text-right' : 'justify-start text-left'}`}>
                  <User className="w-6 h-6" />
                  {t('xray.patientInfo.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Patient Search */}
                <div className="space-y-2 patient-search-container">
                  <Label htmlFor="patientSearch" className={`text-sm font-semibold text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('xray.patientInfo.searchPatient')}
                  </Label>
                  <div className="relative">
                    <Search className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="patientSearch"
                      value={patientSearchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={t('xray.patientInfo.searchPlaceholder')}
                      className={`h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-10 text-left'}`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                    {isSearching && (
                      <Loader2 className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 animate-spin ${isRTL ? 'left-3' : 'right-3'}`} />
                    )}
                    {selectedPatient && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearPatientSelection}
                        className={`absolute top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-red-100 ${isRTL ? 'left-3' : 'right-3'}`}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((patient) => (
                        <div
                          key={patient.userid}
                          onClick={() => handlePatientSelect(patient)}
                          className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                        >
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                            <div className={isRTL ? 'text-right' : 'text-left'}>
                              <p className="font-medium text-slate-900">
                                {patient.english_username_a} {patient.english_username_d || ''}
                              </p>
                              <p className="text-sm text-slate-600">{patient.user_email}</p>
                              {patient.id_number && (
                                <p className="text-xs text-slate-500">{t('xray.patientInfo.id')}: {patient.id_number}</p>
                              )}
                            </div>
                            <div className={isRTL ? 'text-left' : 'text-right'}>
                              {patient.date_of_birth && (
                                <p className="text-sm text-slate-600">
                                  {t('xray.patientInfo.dob')}: {new Date(patient.date_of_birth).toLocaleDateString()}
                                </p>
                              )}
                              {patient.gender_user && (
                                <p className="text-xs text-slate-500 capitalize">{patient.gender_user}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Results Message */}
                  {showSearchResults && searchResults.length === 0 && patientSearchTerm.trim() && !isSearching && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                      <p className={`text-slate-600 ${isRTL ? 'text-right' : 'text-center'}`}>{t('xray.patientInfo.noPatientsFound')}</p>
                    </div>
                  )}
                </div>

                {/* Selected Patient Info */}
                {selectedPatient && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">{t('xray.patientInfo.patientSelected')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <span className="font-medium text-slate-700">{t('xray.patientInfo.name')}:</span>
                        <span className={`text-slate-600 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                          {selectedPatient.english_username_a} {selectedPatient.english_username_d || ''}
                        </span>
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <span className="font-medium text-slate-700">{t('xray.patientInfo.email')}:</span>
                        <span className={`text-slate-600 ${isRTL ? 'mr-2' : 'ml-2'}`}>{selectedPatient.user_email}</span>
                      </div>
                      {selectedPatient.id_number && (
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                          <span className="font-medium text-slate-700">{t('xray.patientInfo.id')}:</span>
                          <span className={`text-slate-600 ${isRTL ? 'mr-2' : 'ml-2'}`}>{selectedPatient.id_number}</span>
                        </div>
                      )}
                      {selectedPatient.gender_user && (
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                          <span className="font-medium text-slate-700">{t('xray.patientInfo.gender')}:</span>
                          <span className={`text-slate-600 capitalize ${isRTL ? 'mr-2' : 'ml-2'}`}>{selectedPatient.gender_user}</span>
                        </div>
                      )}
                      {selectedPatient.date_of_birth && (
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                          <span className="font-medium text-slate-700">{t('xray.patientInfo.dateOfBirth')}:</span>
                          <span className={`text-slate-600 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                            {new Date(selectedPatient.date_of_birth).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Manual Entry Fields (Hidden when patient is selected) */}
                {!selectedPatient && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="patientName" className={`text-sm font-semibold text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('xray.patientInfo.manualName')}
                      </Label>
                      <Input
                        id="patientName"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder={t('xray.patientInfo.namePlaceholder')}
                        className={`h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className={`text-sm font-semibold text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('xray.patientInfo.manualDob')}
                      </Label>
                      <div className="relative">
                        <Calendar className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 ${isRTL ? 'right-3' : 'left-3'}`} />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className={`h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'pr-10 text-right [&::-webkit-datetime-edit-text]:text-right [&::-webkit-datetime-edit-month-field]:text-right [&::-webkit-datetime-edit-day-field]:text-right [&::-webkit-datetime-edit-year-field]:text-right [&::-webkit-datetime-edit]:text-right' : 'pl-10 text-left'}`}
                          dir={isRTL ? 'rtl' : 'ltr'}
                          style={isRTL ? {
                            textAlign: 'right',
                            direction: 'rtl'
                          } : {
                            textAlign: 'left',
                            direction: 'ltr'
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Doctor Search */}
                <div className="space-y-2 doctor-search-container">
                  <Label htmlFor="doctorSearch" className={`text-sm font-semibold text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('xray.doctorInfo.title')}
                  </Label>
                  <div className="relative">
                    <Search className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="doctorSearch"
                      value={doctorSearchTerm}
                      onChange={(e) => handleDoctorSearchChange(e.target.value)}
                      placeholder={t('xray.doctorInfo.searchPlaceholder')}
                      className={`h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-10 text-left'}`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                    {isSearchingDoctors && (
                      <Loader2 className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 animate-spin ${isRTL ? 'left-3' : 'right-3'}`} />
                    )}
                    {selectedDoctor && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearDoctorSelection}
                        className={`absolute top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-red-100 ${isRTL ? 'left-3' : 'right-3'}`}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  {/* Doctor Search Results Dropdown */}
                  {showDoctorSearchResults && doctorSearchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {doctorSearchResults.map((doctor) => (
                        <div
                          key={doctor.id}
                          onClick={() => handleDoctorSelect(doctor)}
                          className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                        >
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                            <div className={isRTL ? 'text-right' : 'text-left'}>
                              <p className="font-medium text-slate-900">
                                {t('xray.doctorInfo.drPrefix')} {doctor.name}
                              </p>
                              <p className="text-sm text-slate-600">{doctor.specialty}</p>
                              <p className="text-xs text-slate-500">{doctor.clinic_name}</p>
                            </div>
                            <div className={isRTL ? 'text-left' : 'text-right'}>
                              <p className="text-sm text-slate-600">{doctor.email}</p>
                              {doctor.phone && (
                                <p className="text-xs text-slate-500">{doctor.phone}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Doctor Results Message */}
                  {showDoctorSearchResults && doctorSearchResults.length === 0 && doctorSearchTerm.trim() && !isSearchingDoctors && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                      <p className={`text-slate-600 ${isRTL ? 'text-right' : 'text-center'}`}>{t('xray.doctorInfo.noDoctorsFound')}</p>
                    </div>
                  )}
                </div>

                {/* Selected Doctor Info */}
                {selectedDoctor && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">{t('xray.doctorInfo.doctorSelected')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <span className="font-medium text-slate-700">{t('xray.doctorInfo.name')}:</span>
                        <span className={`text-slate-600 ${isRTL ? 'mr-2' : 'ml-2'}`}>{t('xray.doctorInfo.drPrefix')} {selectedDoctor.name}</span>
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <span className="font-medium text-slate-700">{t('xray.doctorInfo.specialty')}:</span>
                        <span className={`text-slate-600 ${isRTL ? 'mr-2' : 'ml-2'}`}>{selectedDoctor.specialty}</span>
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <span className="font-medium text-slate-700">{t('xray.doctorInfo.clinic')}:</span>
                        <span className={`text-slate-600 ${isRTL ? 'mr-2' : 'ml-2'}`}>{selectedDoctor.clinic_name}</span>
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <span className="font-medium text-slate-700">{t('xray.doctorInfo.email')}:</span>
                        <span className={`text-slate-600 ${isRTL ? 'mr-2' : 'ml-2'}`}>{selectedDoctor.email}</span>
                      </div>
                      {selectedDoctor.phone && (
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                          <span className="font-medium text-slate-700">{t('xray.doctorInfo.phone')}:</span>
                          <span className={`text-slate-600 ${isRTL ? 'mr-2' : 'ml-2'}`}>{selectedDoctor.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="clinicalIndication" className={`text-sm font-semibold text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('xray.clinicalIndication.title')}
                  </Label>
                  <Textarea
                    id="clinicalIndication"
                    value={clinicalIndication}
                    onChange={(e) => setClinicalIndication(e.target.value)}
                    placeholder={t('xray.clinicalIndication.placeholder')}
                    rows={4}
                    className={`border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none ${isRTL ? 'text-right' : 'text-left'}`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Anatomical Selection Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className={`bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-t-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                <CardTitle className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end text-right' : 'justify-start text-left'}`}>
                  <Stethoscope className="w-6 h-6" />
                  {t('xray.bodyPartSelection.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <AnatomicalSkeleton
                  selectedBodyPart={selectedBodyPart}
                  onBodyPartSelect={handleBodyPartSelect}
                />

                {/* Fallback Dropdown */}
                <div className="mt-6 space-y-2">
                  <Label className={`text-sm font-semibold text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('xray.bodyPartSelection.manualSelection')}
                  </Label>
                  <Select value={selectedBodyPart} onValueChange={setSelectedBodyPart}>
                    <SelectTrigger className={`h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'} ${isRTL ? '[&>svg]:right-3 [&>svg]:left-auto' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                      <SelectValue placeholder={t('xray.bodyPartSelection.placeholder')} />
                    </SelectTrigger>
                    <SelectContent dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : 'text-left'}>
                      {bodyPartsOptions.map((part) => (
                        <SelectItem key={part.value} value={part.value} className={isRTL ? 'text-right' : 'text-left'}>
                          {t(`xray.bodyParts.${part.value}`) || part.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* File Upload Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className={`bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-t-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                <CardTitle className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end text-right' : 'justify-start text-left'}`}>
                  <Upload className="w-6 h-6" />
                  {t('xray.fileUpload.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer hover:bg-slate-50 ${isDragging
                    ? "border-blue-500 bg-blue-50"
                    : file
                      ? "border-green-500 bg-green-50"
                      : "border-slate-300"
                    } ${isRTL ? 'text-right' : 'text-center'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <input
                    id="fileInput"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/jpeg,image/png,image/jpg"
                  />

                  {file ? (
                    <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-center'}`}>
                      <div className={`flex ${isRTL ? 'justify-end' : 'justify-center'}`}>
                        <CheckCircle className="w-16 h-16 text-green-500" />
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-center'}>
                        <p className="text-lg font-semibold text-green-700">{t('xray.fileUpload.fileSelected')}</p>
                        <p className="text-slate-600 mt-1 break-all">{file.name}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <div className={`flex ${isRTL ? 'justify-end' : 'justify-center'}`}>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          variant="outline"
                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        >
                          <X className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {t('xray.fileUpload.removeFile')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-center'}`}>
                      <div className={`flex ${isRTL ? 'justify-end' : 'justify-center'}`}>
                        <Upload className={`w-16 h-16 ${isDragging ? "text-blue-500" : "text-slate-400"}`} />
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-center'}>
                        <p className="text-lg font-semibold text-slate-700">
                          {t('xray.fileUpload.dragDropText')}
                        </p>
                        <p className="text-slate-500 mt-1">{t('xray.fileUpload.clickToBrowse')}</p>
                      </div>
                      <div className={`text-sm text-slate-500 ${isRTL ? 'text-right' : 'text-center'}`}>
                        {t('xray.fileUpload.supportedFormats')}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className={`mt-8 flex gap-4 ${isRTL ? 'justify-center flex-row-reverse' : 'justify-center'}`}>
            <Button
              size="lg"
              className={`px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${isRTL ? 'flex-row-reverse' : ''}`}
              disabled={!(selectedPatient || patientName) || !selectedBodyPart || !file || !selectedDoctor}
            >
              <CheckCircle className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('xray.actions.saveRecord')}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className={`px-8 py-4 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}
              onClick={() => {
                setPatientName("");
                setDateOfBirth("");
                setRequestingDoctor("");
                setClinicalIndication("");
                setSelectedBodyPart("");
                setFile(null);
                clearPatientSelection();
                clearDoctorSelection();
              }}
            >
              {t('xray.actions.resetForm')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default XRay;
