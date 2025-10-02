import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from '../i18n';

const EnhancedClickableSkeleton = ({ selectedBodyPart, onBodyPartSelect }) => {
    const { t } = useTranslation();
    const [hoveredPart, setHoveredPart] = useState(null);

    const skeletonParts = {
        // SKULL AND FACE
        skull: {
            paths: [
                // Main skull vault
                "M200,20 Q240,15 280,25 Q320,40 340,80 Q345,120 340,160 Q320,180 280,185 Q240,188 200,188 Q160,188 120,185 Q80,180 60,160 Q55,120 60,80 Q80,40 120,25 Q160,15 200,20 Z",
                // Jaw (mandible)
                "M140,170 Q120,175 110,185 Q105,195 110,205 Q120,215 140,220 Q200,225 260,220 Q280,215 290,205 Q295,195 290,185 Q280,175 260,170 Q200,168 140,170 Z",
                // Eye sockets
                "M160,90 Q150,80 150,100 Q150,120 160,130 Q170,135 180,130 Q190,120 190,100 Q190,80 180,85 Q170,80 160,90 Z",
                "M220,85 Q210,80 210,100 Q210,120 220,130 Q230,135 240,130 Q250,120 250,100 Q250,80 240,85 Q230,80 220,85 Z",
                // Nasal cavity
                "M200,110 Q195,105 195,125 Q195,145 200,150 Q205,145 205,125 Q205,105 200,110 Z"
            ],
            center: { x: 200, y: 120 },
            label: t('xray.bodyParts.skull') || "Skull"
        },

        // CERVICAL SPINE
        cervical_spine: {
            paths: [
                "M198,188 Q196,190 196,210 Q196,215 198,217 Q202,217 202,215 Q202,210 202,190 Q202,188 198,188 Z",
                // C1-C7 vertebrae
                "M195,200 Q190,195 190,205 Q190,210 195,212 Q205,212 210,210 Q210,205 210,195 Q205,200 195,200 Z",
                "M195,215 Q190,210 190,220 Q190,225 195,227 Q205,227 210,225 Q210,220 210,210 Q205,215 195,215 Z"
            ],
            center: { x: 200, y: 210 },
            label: t('xray.bodyParts.cervical_spine') || "Cervical Spine"
        },

        // CLAVICLES (COLLAR BONES)
        clavicle_left: {
            paths: [
                "M140,240 Q110,235 90,245 Q85,250 90,255 Q110,260 140,255 Q145,250 140,240 Z"
            ],
            center: { x: 115, y: 248 },
            label: i18n.language === 'ar' ? 'الترقوة اليسرى' : "Left Clavicle"
        },
        clavicle_right: {
            paths: [
                "M260,240 Q290,235 310,245 Q315,250 310,255 Q290,260 260,255 Q255,250 260,240 Z"
            ],
            center: { x: 285, y: 248 },
            label: i18n.language === 'ar' ? 'الترقوة اليمنى' : "Right Clavicle"
        },

        // SCAPULAS (SHOULDER BLADES)
        scapula_left: {
            paths: [
                "M120,260 Q90,255 80,280 Q75,310 85,340 Q95,350 120,345 Q135,330 135,300 Q135,280 120,260 Z"
            ],
            center: { x: 108, y: 300 },
            label: i18n.language === 'ar' ? 'لوح الكتف الأيسر' : "Left Scapula"
        },
        scapula_right: {
            paths: [
                "M280,260 Q310,255 320,280 Q325,310 315,340 Q305,350 280,345 Q265,330 265,300 Q265,280 280,260 Z"
            ],
            center: { x: 292, y: 300 },
            label: i18n.language === 'ar' ? 'لوح الكتف الأيمن' : "Right Scapula"
        },

        // RIBS (12 pairs)
        ribs: {
            paths: [
                // Right ribs (1-12)
                "M200,250 Q250,245 290,260 Q310,280 305,300 Q280,285 240,275 Q210,270 200,250 Z", // Rib 1R
                "M200,265 Q255,260 295,280 Q315,305 310,325 Q285,310 245,300 Q210,285 200,265 Z", // Rib 2R
                "M200,280 Q260,275 300,300 Q320,330 315,355 Q290,340 250,325 Q210,300 200,280 Z", // Rib 3R
                "M200,295 Q265,290 305,320 Q325,355 320,385 Q295,370 255,350 Q210,315 200,295 Z", // Rib 4R
                "M200,310 Q270,305 310,340 Q330,380 325,415 Q300,400 260,375 Q210,330 200,310 Z", // Rib 5R
                "M200,325 Q275,320 315,360 Q335,405 330,445 Q305,430 265,400 Q210,345 200,325 Z", // Rib 6R
                "M200,340 Q280,335 320,380 Q340,430 335,475 Q310,460 270,425 Q210,360 200,340 Z", // Rib 7R
                "M200,355 Q285,350 325,400 Q345,455 340,505 Q315,490 275,450 Q210,375 200,355 Z", // Rib 8R
                "M200,370 Q290,365 330,420 Q350,480 345,535 Q320,520 280,475 Q210,390 200,370 Z", // Rib 9R
                "M200,385 Q295,380 335,440 Q355,505 350,565 Q325,550 285,500 Q210,405 200,385 Z", // Rib 10R
                "M200,400 Q300,395 340,460 Q360,530 355,595 Q330,580 290,525 Q210,420 200,400 Z", // Rib 11R
                "M200,415 Q305,410 345,480 Q365,555 360,625 Q335,610 295,550 Q210,435 200,415 Z", // Rib 12R

                // Left ribs (1-12)
                "M200,250 Q150,245 110,260 Q90,280 95,300 Q120,285 160,275 Q190,270 200,250 Z", // Rib 1L
                "M200,265 Q145,260 105,280 Q85,305 90,325 Q115,310 155,300 Q190,285 200,265 Z", // Rib 2L
                "M200,280 Q140,275 100,300 Q80,330 85,355 Q110,340 150,325 Q190,300 200,280 Z", // Rib 3L
                "M200,295 Q135,290 95,320 Q75,355 80,385 Q105,370 145,350 Q190,315 200,295 Z", // Rib 4L
                "M200,310 Q130,305 90,340 Q70,380 75,415 Q100,400 140,375 Q190,330 200,310 Z", // Rib 5L
                "M200,325 Q125,320 85,360 Q65,405 70,445 Q95,430 135,400 Q190,345 200,325 Z", // Rib 6L
                "M200,340 Q120,335 80,380 Q60,430 65,475 Q90,460 130,425 Q190,360 200,340 Z", // Rib 7L
                "M200,355 Q115,350 75,400 Q55,455 60,505 Q85,490 125,450 Q190,375 200,355 Z", // Rib 8L
                "M200,370 Q110,365 70,420 Q50,480 55,535 Q80,520 120,475 Q190,390 200,370 Z", // Rib 9L
                "M200,385 Q105,380 65,440 Q45,505 50,565 Q75,550 115,500 Q190,405 200,385 Z", // Rib 10L
                "M200,400 Q100,395 60,460 Q40,530 45,595 Q70,580 110,525 Q190,420 200,400 Z", // Rib 11L
                "M200,415 Q95,410 55,480 Q35,555 40,625 Q65,610 105,550 Q190,435 200,415 Z"  // Rib 12L
            ],
            center: { x: 200, y: 335 },
            label: t('xray.bodyParts.ribs') || "Ribs"
        },

        // STERNUM
        sternum: {
            paths: [
                "M195,250 Q190,248 190,280 Q190,350 190,420 Q190,440 195,442 Q205,442 210,440 Q210,420 210,350 Q210,280 210,248 Q205,250 195,250 Z"
            ],
            center: { x: 200, y: 345 },
            label: t('xray.bodyParts.sternum') || "Sternum"
        },

        // THORACIC SPINE
        thoracic_spine: {
            paths: [
                // T1-T12 vertebrae
                "M198,230 Q195,228 195,250 Q195,270 195,290 Q195,310 195,330 Q195,350 195,370 Q195,390 195,410 Q195,430 198,432 Q202,432 205,430 Q205,410 205,390 Q205,370 205,350 Q205,330 205,310 Q205,290 205,270 Q205,250 205,228 Q202,230 198,230 Z",
                // Individual vertebrae indicators
                "M193,240 Q188,238 188,242 Q188,246 193,248 Q207,248 212,246 Q212,242 212,238 Q207,240 193,240 Z",
                "M193,260 Q188,258 188,262 Q188,266 193,268 Q207,268 212,266 Q212,262 212,258 Q207,260 193,260 Z",
                "M193,280 Q188,278 188,282 Q188,286 193,288 Q207,288 212,286 Q212,282 212,278 Q207,280 193,280 Z",
                "M193,300 Q188,298 188,302 Q188,306 193,308 Q207,308 212,306 Q212,302 212,298 Q207,300 193,300 Z",
                "M193,320 Q188,318 188,322 Q188,326 193,328 Q207,328 212,326 Q212,322 212,318 Q207,320 193,320 Z",
                "M193,340 Q188,338 188,342 Q188,346 193,348 Q207,348 212,346 Q212,342 212,338 Q207,340 193,340 Z",
                "M193,360 Q188,358 188,362 Q188,366 193,368 Q207,368 212,366 Q212,362 212,358 Q207,360 193,360 Z",
                "M193,380 Q188,378 188,382 Q188,386 193,388 Q207,388 212,386 Q212,382 212,378 Q207,380 193,380 Z",
                "M193,400 Q188,398 188,402 Q188,406 193,408 Q207,408 212,406 Q212,402 212,398 Q207,400 193,400 Z",
                "M193,420 Q188,418 188,422 Q188,426 193,428 Q207,428 212,426 Q212,422 212,418 Q207,420 193,420 Z"
            ],
            center: { x: 200, y: 330 },
            label: t('xray.bodyParts.thoracic_spine') || "Thoracic Spine"
        },

        // HUMERUS (ARM BONES)
        humerus_left: {
            paths: [
                "M110,270 Q105,268 95,290 Q85,340 80,390 Q78,410 82,412 Q88,412 92,410 Q97,390 107,340 Q117,290 115,270 Q112,268 110,270 Z"
            ],
            center: { x: 98, y: 340 },
            label: i18n.language === 'ar' ? 'عظم العضد الأيسر' : "Left Humerus"
        },
        humerus_right: {
            paths: [
                "M290,270 Q295,268 305,290 Q315,340 320,390 Q322,410 318,412 Q312,412 308,410 Q303,390 293,340 Q283,290 285,270 Q288,268 290,270 Z"
            ],
            center: { x: 302, y: 340 },
            label: i18n.language === 'ar' ? 'عظم العضد الأيمن' : "Right Humerus"
        },

        // RADIUS AND ULNA (FOREARM BONES)
        radius_left: {
            paths: [
                "M85,410 Q83,408 78,450 Q73,500 70,540 Q68,560 72,562 Q76,562 78,560 Q83,540 88,500 Q93,450 90,410 Q88,408 85,410 Z"
            ],
            center: { x: 81, y: 485 },
            label: i18n.language === 'ar' ? 'عظم الكعبرة الأيسر' : "Left Radius"
        },
        ulna_left: {
            paths: [
                "M95,410 Q97,408 102,450 Q107,500 110,540 Q112,560 108,562 Q104,562 102,560 Q97,540 92,500 Q87,450 90,410 Q92,408 95,410 Z"
            ],
            center: { x: 99, y: 485 },
            label: i18n.language === 'ar' ? 'عظم الزند الأيسر' : "Left Ulna"
        },
        radius_right: {
            paths: [
                "M315,410 Q317,408 322,450 Q327,500 330,540 Q332,560 328,562 Q324,562 322,560 Q317,540 312,500 Q307,450 310,410 Q312,408 315,410 Z"
            ],
            center: { x: 319, y: 485 },
            label: i18n.language === 'ar' ? 'عظم الكعبرة الأيمن' : "Right Radius"
        },
        ulna_right: {
            paths: [
                "M305,410 Q303,408 298,450 Q293,500 290,540 Q288,560 292,562 Q296,562 298,560 Q303,540 308,500 Q313,450 310,410 Q308,408 305,410 Z"
            ],
            center: { x: 301, y: 485 },
            label: i18n.language === 'ar' ? 'عظم الزند الأيمن' : "Right Ulna"
        },

        // HAND BONES (DETAILED)
        hand_left: {
            paths: [
                // Carpals (wrist bones)
                "M70,560 Q65,558 60,565 Q58,570 62,575 Q70,577 78,575 Q82,570 78,565 Q75,558 70,560 Z",
                "M75,575 Q70,573 65,580 Q63,585 67,590 Q75,592 83,590 Q87,585 83,580 Q80,573 75,575 Z",
                // Metacarpals (palm bones)
                "M62,590 Q60,588 55,620 Q53,635 57,637 Q61,637 63,635 Q68,620 70,590 Q68,588 62,590 Z", // 1st metacarpal
                "M70,590 Q68,588 63,625 Q61,640 65,642 Q69,642 71,640 Q76,625 78,590 Q76,588 70,590 Z", // 2nd metacarpal
                "M78,590 Q76,588 71,625 Q69,640 73,642 Q77,642 79,640 Q84,625 86,590 Q84,588 78,590 Z", // 3rd metacarpal
                "M86,590 Q84,588 79,620 Q77,635 81,637 Q85,637 87,635 Q92,620 94,590 Q92,588 86,590 Z", // 4th metacarpal
                "M94,590 Q92,588 87,615 Q85,630 89,632 Q93,632 95,630 Q100,615 102,590 Q100,588 94,590 Z", // 5th metacarpal
                // Phalanges (finger bones)
                "M57,637 Q55,635 50,655 Q48,665 52,667 Q56,667 58,665 Q63,655 65,637 Q63,635 57,637 Z", // Thumb proximal
                "M52,667 Q50,665 45,680 Q43,690 47,692 Q51,692 53,690 Q58,680 60,667 Q58,665 52,667 Z", // Thumb distal
                // Finger phalanges for each finger...
                "M65,642 Q63,640 58,665 Q56,675 60,677 Q64,677 66,675 Q71,665 73,642 Q71,640 65,642 Z",
                "M60,677 Q58,675 53,695 Q51,705 55,707 Q59,707 61,705 Q66,695 68,677 Q66,675 60,677 Z",
                "M55,707 Q53,705 48,720 Q46,730 50,732 Q54,732 56,730 Q61,720 63,707 Q61,705 55,707 Z"
            ],
            center: { x: 75, y: 645 },
            label: i18n.language === 'ar' ? 'اليد اليسرى' : "Left Hand"
        },

        hand_right: {
            paths: [
                // Carpals (wrist bones)
                "M330,560 Q335,558 340,565 Q342,570 338,575 Q330,577 322,575 Q318,570 322,565 Q325,558 330,560 Z",
                "M325,575 Q330,573 335,580 Q337,585 333,590 Q325,592 317,590 Q313,585 317,580 Q320,573 325,575 Z",
                // Metacarpals (palm bones)
                "M338,590 Q340,588 345,620 Q347,635 343,637 Q339,637 337,635 Q332,620 330,590 Q332,588 338,590 Z", // 1st metacarpal
                "M330,590 Q332,588 337,625 Q339,640 335,642 Q331,642 329,640 Q324,625 322,590 Q324,588 330,590 Z", // 2nd metacarpal
                "M322,590 Q324,588 329,625 Q331,640 327,642 Q323,642 321,640 Q316,625 314,590 Q316,588 322,590 Z", // 3rd metacarpal
                "M314,590 Q316,588 321,620 Q323,635 319,637 Q315,637 313,635 Q308,620 306,590 Q308,588 314,590 Z", // 4th metacarpal
                "M306,590 Q308,588 313,615 Q315,630 311,632 Q307,632 305,630 Q300,615 298,590 Q300,588 306,590 Z", // 5th metacarpal
                // Phalanges (finger bones)
                "M343,637 Q345,635 350,655 Q352,665 348,667 Q344,667 342,665 Q337,655 335,637 Q337,635 343,637 Z", // Thumb proximal
                "M348,667 Q350,665 355,680 Q357,690 353,692 Q349,692 347,690 Q342,680 340,667 Q342,665 348,667 Z", // Thumb distal
                // Additional finger phalanges
                "M335,642 Q337,640 342,665 Q344,675 340,677 Q336,677 334,675 Q329,665 327,642 Q329,640 335,642 Z",
                "M340,677 Q342,675 347,695 Q349,705 345,707 Q341,707 339,705 Q334,695 332,677 Q334,675 340,677 Z",
                "M345,707 Q347,705 352,720 Q354,730 350,732 Q346,732 344,730 Q339,720 337,707 Q339,705 345,707 Z"
            ],
            center: { x: 325, y: 645 },
            label: i18n.language === 'ar' ? 'اليد اليمنى' : "Right Hand"
        },

        // LUMBAR SPINE
        lumbar_spine: {
            paths: [
                // L1-L5 vertebrae
                "M198,430 Q195,428 195,470 Q195,490 195,510 Q195,530 195,550 Q195,570 198,572 Q202,572 205,570 Q205,550 205,530 Q205,510 205,490 Q205,470 205,428 Q202,430 198,430 Z",
                // Individual lumbar vertebrae
                "M192,445 Q187,443 187,447 Q187,451 192,453 Q208,453 213,451 Q213,447 213,443 Q208,445 192,445 Z",
                "M192,465 Q187,463 187,467 Q187,471 192,473 Q208,473 213,471 Q213,467 213,463 Q208,465 192,465 Z",
                "M192,485 Q187,483 187,487 Q187,491 192,493 Q208,493 213,491 Q213,487 213,483 Q208,485 192,485 Z",
                "M192,505 Q187,503 187,507 Q187,511 192,513 Q208,513 213,511 Q213,507 213,503 Q208,505 192,505 Z",
                "M192,525 Q187,523 187,527 Q187,531 192,533 Q208,533 213,531 Q213,527 213,523 Q208,525 192,525 Z"
            ],
            center: { x: 200, y: 500 },
            label: t('xray.bodyParts.lumbar_spine') || "Lumbar Spine"
        },

        // PELVIS (DETAILED)
        pelvis: {
            paths: [
                // Ilium (hip bones)
                "M150,570 Q120,565 100,590 Q90,620 95,650 Q105,680 130,685 Q150,680 165,660 Q170,630 165,600 Q160,580 150,570 Z", // Left ilium
                "M250,570 Q280,565 300,590 Q310,620 305,650 Q295,680 270,685 Q250,680 235,660 Q230,630 235,600 Q240,580 250,570 Z", // Right ilium
                // Sacrum
                "M190,570 Q185,568 185,610 Q185,630 185,650 Q185,670 190,672 Q210,672 215,670 Q215,650 215,630 Q215,610 215,568 Q210,570 190,570 Z",
                // Ischium and pubis
                "M130,685 Q125,683 120,700 Q115,720 120,740 Q125,745 135,743 Q145,740 150,720 Q155,700 150,685 Q145,683 130,685 Z", // Left ischiopubic ramus
                "M270,685 Q275,683 280,700 Q285,720 280,740 Q275,745 265,743 Q255,740 250,720 Q245,700 250,685 Q255,683 270,685 Z", // Right ischiopubic ramus
                // Pubic symphysis
                "M185,700 Q180,698 180,720 Q180,730 185,732 Q215,732 220,730 Q220,720 220,698 Q215,700 185,700 Z"
            ],
            center: { x: 200, y: 625 },
            label: t('xray.bodyParts.pelvis') || "Pelvis"
        },

        // FEMUR (THIGH BONES)
        femur_left: {
            paths: [
                "M140,740 Q135,738 125,800 Q115,880 110,960 Q108,980 112,982 Q118,982 122,980 Q127,960 137,880 Q147,800 145,740 Q142,738 140,740 Z",
                // Femoral head
                "M140,740 Q135,735 130,740 Q125,745 130,750 Q135,755 140,750 Q145,745 140,740 Z"
            ],
            center: { x: 128, y: 860 },
            label: i18n.language === 'ar' ? 'عظم الفخذ الأيسر' : "Left Femur"
        },
        femur_right: {
            paths: [
                "M260,740 Q265,738 275,800 Q285,880 290,960 Q292,980 288,982 Q282,982 278,980 Q273,960 263,880 Q253,800 255,740 Q258,738 260,740 Z",
                // Femoral head
                "M260,740 Q265,735 270,740 Q275,745 270,750 Q265,755 260,750 Q255,745 260,740 Z"
            ],
            center: { x: 272, y: 860 },
            label: i18n.language === 'ar' ? 'عظم الفخذ الأيمن' : "Right Femur"
        },

        // PATELLA (KNEECAPS)
        patella_left: {
            paths: [
                "M118,975 Q113,973 113,980 Q113,987 118,989 Q125,989 130,987 Q130,980 130,973 Q125,975 118,975 Z"
            ],
            center: { x: 121, y: 981 },
            label: i18n.language === 'ar' ? 'الرضفة اليسرى' : "Left Patella"
        },
        patella_right: {
            paths: [
                "M282,975 Q287,973 287,980 Q287,987 282,989 Q275,989 270,987 Q270,980 270,973 Q275,975 282,975 Z"
            ],
            center: { x: 279, y: 981 },
            label: i18n.language === 'ar' ? 'الرضفة اليمنى' : "Right Patella"
        },

        // TIBIA AND FIBULA (LEG BONES)
        tibia_left: {
            paths: [
                "M115,990 Q113,988 108,1080 Q103,1170 100,1220 Q98,1240 102,1242 Q106,1242 108,1240 Q113,1220 118,1170 Q123,1080 120,990 Q118,988 115,990 Z"
            ],
            center: { x: 111, y: 1115 },
            label: i18n.language === 'ar' ? 'عظم القصبة الأيسر' : "Left Tibia"
        },
        fibula_left: {
            paths: [
                "M125,995 Q127,993 132,1085 Q137,1175 140,1225 Q142,1245 138,1247 Q134,1247 132,1245 Q127,1225 122,1175 Q117,1085 120,995 Q122,993 125,995 Z"
            ],
            center: { x: 129, y: 1120 },
            label: i18n.language === 'ar' ? 'عظم الشظية الأيسر' : "Left Fibula"
        },
        tibia_right: {
            paths: [
                "M285,990 Q287,988 292,1080 Q297,1170 300,1220 Q302,1240 298,1242 Q294,1242 292,1240 Q287,1220 282,1170 Q277,1080 280,990 Q282,988 285,990 Z"
            ],
            center: { x: 289, y: 1115 },
            label: i18n.language === 'ar' ? 'عظم القصبة الأيمن' : "Right Tibia"
        },
        fibula_right: {
            paths: [
                "M275,995 Q273,993 268,1085 Q263,1175 260,1225 Q258,1245 262,1247 Q266,1247 268,1245 Q273,1225 278,1175 Q283,1085 280,995 Q278,993 275,995 Z"
            ],
            center: { x: 271, y: 1120 },
            label: i18n.language === 'ar' ? 'عظم الشظية الأيمن' : "Right Fibula"
        },

        // FOOT BONES (DETAILED)
        foot_left: {
            paths: [
                // Tarsals (ankle/heel bones)
                "M100,1240 Q95,1238 90,1250 Q88,1260 92,1265 Q100,1267 108,1265 Q112,1260 108,1250 Q105,1238 100,1240 Z", // Talus
                "M95,1265 Q90,1263 85,1275 Q83,1285 87,1290 Q95,1292 103,1290 Q107,1285 103,1275 Q100,1263 95,1265 Z", // Calcaneus
                "M92,1290 Q87,1288 82,1300 Q80,1310 84,1315 Q92,1317 100,1315 Q104,1310 100,1300 Q97,1288 92,1290 Z", // Navicular
                // Metatarsals (foot bones)
                "M84,1315 Q82,1313 77,1340 Q75,1355 79,1357 Q83,1357 85,1355 Q90,1340 92,1315 Q90,1313 84,1315 Z", // 1st metatarsal
                "M92,1315 Q90,1313 85,1345 Q83,1360 87,1362 Q91,1362 93,1360 Q98,1345 100,1315 Q98,1313 92,1315 Z", // 2nd metatarsal
                "M100,1315 Q98,1313 93,1345 Q91,1360 95,1362 Q99,1362 101,1360 Q106,1345 108,1315 Q106,1313 100,1315 Z", // 3rd metatarsal
                "M108,1315 Q106,1313 101,1340 Q99,1355 103,1357 Q107,1357 109,1355 Q114,1340 116,1315 Q114,1313 108,1315 Z", // 4th metatarsal
                "M116,1315 Q114,1313 109,1335 Q107,1350 111,1352 Q115,1352 117,1350 Q122,1335 124,1315 Q122,1313 116,1315 Z", // 5th metatarsal
                // Phalanges (toe bones)
                "M79,1357 Q77,1355 72,1375 Q70,1385 74,1387 Q78,1387 80,1385 Q85,1375 87,1357 Q85,1355 79,1357 Z", // Big toe proximal
                "M74,1387 Q72,1385 67,1400 Q65,1410 69,1412 Q73,1412 75,1410 Q80,1400 82,1387 Q80,1385 74,1387 Z", // Big toe distal
                // Additional toe phalanges for each toe
                "M87,1362 Q85,1360 80,1380 Q78,1390 82,1392 Q86,1392 88,1390 Q93,1380 95,1362 Q93,1360 87,1362 Z",
                "M95,1362 Q93,1360 88,1380 Q86,1390 90,1392 Q94,1392 96,1390 Q101,1380 103,1362 Q101,1360 95,1362 Z",
                "M103,1357 Q101,1355 96,1375 Q94,1385 98,1387 Q102,1387 104,1385 Q109,1375 111,1357 Q109,1355 103,1357 Z",
                "M111,1352 Q109,1350 104,1370 Q102,1380 106,1382 Q110,1382 112,1380 Q117,1370 119,1352 Q117,1350 111,1352 Z"
            ],
            center: { x: 95, y: 1335 },
            label: i18n.language === 'ar' ? 'القدم اليسرى' : "Left Foot"
        },

        foot_right: {
            paths: [
                // Tarsals (ankle/heel bones)
                "M300,1240 Q305,1238 310,1250 Q312,1260 308,1265 Q300,1267 292,1265 Q288,1260 292,1250 Q295,1238 300,1240 Z", // Talus
                "M305,1265 Q310,1263 315,1275 Q317,1285 313,1290 Q305,1292 297,1290 Q293,1285 297,1275 Q300,1263 305,1265 Z", // Calcaneus
                "M308,1290 Q313,1288 318,1300 Q320,1310 316,1315 Q308,1317 300,1315 Q296,1310 300,1300 Q303,1288 308,1290 Z", // Navicular
                // Metatarsals (foot bones)
                "M316,1315 Q318,1313 323,1340 Q325,1355 321,1357 Q317,1357 315,1355 Q310,1340 308,1315 Q310,1313 316,1315 Z", // 1st metatarsal
                "M308,1315 Q310,1313 315,1345 Q317,1360 313,1362 Q309,1362 307,1360 Q302,1345 300,1315 Q302,1313 308,1315 Z", // 2nd metatarsal
                "M300,1315 Q302,1313 307,1345 Q309,1360 305,1362 Q301,1362 299,1360 Q294,1345 292,1315 Q294,1313 300,1315 Z", // 3rd metatarsal
                "M292,1315 Q294,1313 299,1340 Q301,1355 297,1357 Q293,1357 291,1355 Q286,1340 284,1315 Q286,1313 292,1315 Z", // 4th metatarsal
                "M284,1315 Q286,1313 291,1335 Q293,1350 289,1352 Q285,1352 283,1350 Q278,1335 276,1315 Q278,1313 284,1315 Z", // 5th metatarsal
                // Phalanges (toe bones)
                "M321,1357 Q323,1355 328,1375 Q330,1385 326,1387 Q322,1387 320,1385 Q315,1375 313,1357 Q315,1355 321,1357 Z", // Big toe proximal
                "M326,1387 Q328,1385 333,1400 Q335,1410 331,1412 Q327,1412 325,1410 Q320,1400 318,1387 Q320,1385 326,1387 Z", // Big toe distal
                // Additional toe phalanges
                "M313,1362 Q315,1360 320,1380 Q322,1390 318,1392 Q314,1392 312,1390 Q307,1380 305,1362 Q307,1360 313,1362 Z",
                "M305,1362 Q307,1360 312,1380 Q314,1390 310,1392 Q306,1392 304,1390 Q299,1380 297,1362 Q299,1360 305,1362 Z",
                "M297,1357 Q299,1355 304,1375 Q306,1385 302,1387 Q298,1387 296,1385 Q291,1375 289,1357 Q291,1355 297,1357 Z",
                "M289,1352 Q291,1350 296,1370 Q298,1380 294,1382 Q290,1382 288,1380 Q283,1370 281,1352 Q283,1350 289,1352 Z"
            ],
            center: { x: 305, y: 1335 },
            label: i18n.language === 'ar' ? 'القدم اليمنى' : "Right Foot"
        }
    };

    // Enhanced mapping for form values
    const getFormValue = (skeletonPart) => {
        const mapping = {
            skull: "skull",
            cervical_spine: "spine",
            thoracic_spine: "spine",
            lumbar_spine: "spine",
            ribs: "chest",
            sternum: "chest",
            clavicle_left: "shoulder",
            clavicle_right: "shoulder",
            scapula_left: "shoulder",
            scapula_right: "shoulder",
            humerus_left: "shoulder",
            humerus_right: "shoulder",
            radius_left: "elbow",
            ulna_left: "elbow",
            radius_right: "elbow",
            ulna_right: "elbow",
            hand_left: "hand",
            hand_right: "hand",
            pelvis: "pelvis",
            femur_left: "hip",
            femur_right: "hip",
            patella_left: "knee",
            patella_right: "knee",
            tibia_left: "knee",
            fibula_left: "knee",
            tibia_right: "knee",
            fibula_right: "knee",
            foot_left: "foot",
            foot_right: "foot"
        };
        return mapping[skeletonPart] || skeletonPart;
    };

    const handlePartClick = (partKey) => {
        const formValue = getFormValue(partKey);
        onBodyPartSelect(formValue);
    };

    const isPartSelected = (partKey) => {
        const formValue = getFormValue(partKey);
        return selectedBodyPart === formValue;
    };

    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                {i18n.language === 'ar' ? 'انقر على جزء الجسم للاختيار' : 'Click on body part to select'}
            </h3>

            <div className="flex justify-center">
                <svg
                    width="400"
                    height="1450"
                    viewBox="0 0 400 1450"
                    className="max-w-full h-auto bg-gray-900 rounded-lg"
                    style={{ filter: 'contrast(1.2) brightness(0.9)' }}
                >
                    {/* X-ray background effect */}
                    <defs>
                        <filter id="xrayGlow">
                            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Render all skeleton parts */}
                    {Object.entries(skeletonParts).map(([partKey, part]) => (
                        <g key={partKey} filter="url(#xrayGlow)">
                            {part.paths.map((path, pathIndex) => (
                                <path
                                    key={`${partKey}-${pathIndex}`}
                                    d={path}
                                    fill={isPartSelected(partKey) ? "#60a5fa" : hoveredPart === partKey ? "#93c5fd" : "none"}
                                    stroke={isPartSelected(partKey) ? "#3b82f6" : hoveredPart === partKey ? "#60a5fa" : "#e5e7eb"}
                                    strokeWidth="1.5"
                                    className="cursor-pointer transition-all duration-200"
                                    onMouseEnter={() => setHoveredPart(partKey)}
                                    onMouseLeave={() => setHoveredPart(null)}
                                    onClick={() => handlePartClick(partKey)}
                                    opacity={isPartSelected(partKey) ? 0.8 : hoveredPart === partKey ? 0.6 : 0.9}
                                />
                            ))}

                            {/* Labels for hovered or selected parts */}
                            {(hoveredPart === partKey || isPartSelected(partKey)) && (
                                <text
                                    x={part.center.x}
                                    y={part.center.y - 20}
                                    textAnchor="middle"
                                    className="fill-white text-xs font-medium pointer-events-none"
                                    style={{ fontSize: '11px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                                >
                                    {part.label}
                                </text>
                            )}
                        </g>
                    ))}

                    {/* Joint markers */}
                    {/* Shoulder joints */}
                    <circle cx="140" cy="270" r="3" fill="#fbbf24" opacity="0.7" />
                    <circle cx="260" cy="270" r="3" fill="#fbbf24" opacity="0.7" />

                    {/* Elbow joints */}
                    <circle cx="90" cy="410" r="2" fill="#fbbf24" opacity="0.7" />
                    <circle cx="310" cy="410" r="2" fill="#fbbf24" opacity="0.7" />

                    {/* Wrist joints */}
                    <circle cx="75" cy="570" r="2" fill="#fbbf24" opacity="0.7" />
                    <circle cx="325" cy="570" r="2" fill="#fbbf24" opacity="0.7" />

                    {/* Hip joints */}
                    <circle cx="140" cy="740" r="4" fill="#fbbf24" opacity="0.7" />
                    <circle cx="260" cy="740" r="4" fill="#fbbf24" opacity="0.7" />

                    {/* Knee joints */}
                    <circle cx="120" cy="985" r="3" fill="#fbbf24" opacity="0.7" />
                    <circle cx="280" cy="985" r="3" fill="#fbbf24" opacity="0.7" />

                    {/* Ankle joints */}
                    <circle cx="105" cy="1245" r="2" fill="#fbbf24" opacity="0.7" />
                    <circle cx="295" cy="1245" r="2" fill="#fbbf24" opacity="0.7" />
                </svg>
            </div>

            {selectedBodyPart && (
                <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {i18n.language === 'ar' ? 'المختار: ' : 'Selected: '}{t(`xray.bodyParts.${selectedBodyPart}`) || selectedBodyPart.charAt(0).toUpperCase() + selectedBodyPart.slice(1)}
                    </span>
                </div>
            )}
        </div>
    );
};

export default EnhancedClickableSkeleton;