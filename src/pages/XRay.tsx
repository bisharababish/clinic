import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  FileX,
  User,
  Calendar,
  Stethoscope,
  Camera,
  X,
} from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '../lib/supabase';
import i18n from '../i18n';

// Clickable Skeleton Component
const ClickableSkeleton = ({ selectedBodyPart, onBodyPartSelect }) => {
  const { t } = useTranslation();
  const [hoveredPart, setHoveredPart] = useState(null);

  const bodyParts = {
    skull: {
      path: "M200,40 Q160,20 120,40 Q100,60 100,100 Q100,140 130,160 Q170,170 200,170 Q230,170 270,160 Q300,140 300,100 Q300,60 280,40 Q240,20 200,40 Z",
      center: { x: 200, y: 100 },
      label: t('xray.bodyParts.skull') || "Skull"
    },
    shoulder_left: {
      path: "M120,180 Q90,170 70,190 Q60,210 70,230 Q90,240 120,230 Q130,210 120,180 Z",
      center: { x: 95, y: 205 },
      label: i18n.language === 'ar' ? 'الكتف الأيسر' : "Left Shoulder"
    },
    shoulder_right: {
      path: "M280,180 Q310,170 330,190 Q340,210 330,230 Q310,240 280,230 Q270,210 280,180 Z",
      center: { x: 305, y: 205 },
      label: i18n.language === 'ar' ? 'الكتف الأيمن' : "Right Shoulder"
    },
    chest: {
      path: "M140,180 Q130,170 130,200 Q130,250 140,280 Q200,290 260,280 Q270,250 270,200 Q270,170 260,180 Q200,185 140,180 Z",
      center: { x: 200, y: 230 },
      label: t('xray.bodyParts.chest') || "Chest"
    },
    elbow_left: {
      path: "M80,260 Q60,250 50,270 Q50,290 60,300 Q80,310 90,290 Q90,270 80,260 Z",
      center: { x: 70, y: 280 },
      label: i18n.language === 'ar' ? 'الكوع الأيسر' : "Left Elbow"
    },
    elbow_right: {
      path: "M320,260 Q340,250 350,270 Q350,290 340,300 Q320,310 310,290 Q310,270 320,260 Z",
      center: { x: 330, y: 280 },
      label: i18n.language === 'ar' ? 'الكوع الأيمن' : "Right Elbow"
    },
    hand_left: {
      path: "M40,340 Q20,330 15,350 Q15,370 25,380 Q45,390 55,370 Q55,350 40,340 Z",
      center: { x: 35, y: 360 },
      label: i18n.language === 'ar' ? 'اليد اليسرى' : "Left Hand"
    },
    hand_right: {
      path: "M360,340 Q380,330 385,350 Q385,370 375,380 Q355,390 345,370 Q345,350 360,340 Z",
      center: { x: 365, y: 360 },
      label: i18n.language === 'ar' ? 'اليد اليمنى' : "Right Hand"
    },
    spine: {
      path: "M190,180 Q185,180 185,450 Q185,460 195,460 Q205,460 205,450 Q205,180 200,180 Q195,180 190,180 Z",
      center: { x: 195, y: 320 },
      label: t('xray.bodyParts.spine') || "Spine"
    },
    pelvis: {
      path: "M150,440 Q140,430 140,460 Q140,480 160,490 Q200,495 240,490 Q260,480 260,460 Q260,430 250,440 Q200,445 150,440 Z",
      center: { x: 200, y: 465 },
      label: t('xray.bodyParts.pelvis') || "Pelvis"
    },
    hip_left: {
      path: "M140,460 Q120,450 110,470 Q110,490 120,500 Q140,510 150,490 Q150,470 140,460 Z",
      center: { x: 130, y: 480 },
      label: i18n.language === 'ar' ? 'الورك الأيسر' : "Left Hip"
    },
    hip_right: {
      path: "M260,460 Q280,450 290,470 Q290,490 280,500 Q260,510 250,490 Q250,470 260,460 Z",
      center: { x: 270, y: 480 },
      label: i18n.language === 'ar' ? 'الورك الأيمن' : "Right Hip"
    },
    knee_left: {
      path: "M130,580 Q110,570 105,590 Q105,610 115,620 Q135,630 145,610 Q145,590 130,580 Z",
      center: { x: 125, y: 600 },
      label: i18n.language === 'ar' ? 'الركبة اليسرى' : "Left Knee"
    },
    knee_right: {
      path: "M270,580 Q290,570 295,590 Q295,610 285,620 Q265,630 255,610 Q255,590 270,580 Z",
      center: { x: 275, y: 600 },
      label: i18n.language === 'ar' ? 'الركبة اليمنى' : "Right Knee"
    },
    ankle_left: {
      path: "M125,720 Q105,710 100,730 Q100,750 110,760 Q130,770 140,750 Q140,730 125,720 Z",
      center: { x: 120, y: 740 },
      label: i18n.language === 'ar' ? 'الكاحل الأيسر' : "Left Ankle"
    },
    ankle_right: {
      path: "M275,720 Q295,710 300,730 Q300,750 290,760 Q270,770 260,750 Q260,730 275,720 Z",
      center: { x: 280, y: 740 },
      label: i18n.language === 'ar' ? 'الكاحل الأيمن' : "Right Ankle"
    },
    foot_left: {
      path: "M90,760 Q70,750 60,770 Q60,790 80,800 Q120,810 140,790 Q140,770 120,760 Q105,755 90,760 Z",
      center: { x: 100, y: 780 },
      label: i18n.language === 'ar' ? 'القدم اليسرى' : "Left Foot"
    },
    foot_right: {
      path: "M310,760 Q330,750 340,770 Q340,790 320,800 Q280,810 260,790 Q260,770 280,760 Q295,755 310,760 Z",
      center: { x: 300, y: 780 },
      label: i18n.language === 'ar' ? 'القدم اليمنى' : "Right Foot"
    }
  };

  // Map skeleton parts to form values
  const getFormValue = (skeletonPart) => {
    const mapping = {
      skull: "skull",
      chest: "chest",
      spine: "spine",
      pelvis: "pelvis",
      shoulder_left: "shoulder",
      shoulder_right: "shoulder",
      elbow_left: "elbow",
      elbow_right: "elbow",
      hand_left: "hand",
      hand_right: "hand",
      hip_left: "hip",
      hip_right: "hip",
      knee_left: "knee",
      knee_right: "knee",
      ankle_left: "ankle",
      ankle_right: "ankle",
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
          height="820"
          viewBox="0 0 400 820"
          className="max-w-full h-auto"
        >
          {/* Body outline (non-clickable) */}
          <path
            d="M200,170 Q170,175 150,200 Q140,240 145,280 Q150,440 155,500 Q160,520 140,540 Q130,580 125,620 Q120,720 120,740 Q115,760 100,780 M200,170 Q230,175 250,200 Q260,240 255,280 Q250,440 245,500 Q240,520 260,540 Q270,580 275,620 Q280,720 280,740 Q285,760 300,780"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
            strokeDasharray="5,5"
          />

          {/* Arms */}
          <path
            d="M150,200 Q120,210 90,240 Q70,270 50,300 Q30,330 20,360 M250,200 Q280,210 310,240 Q330,270 350,300 Q370,330 380,360"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
            strokeDasharray="5,5"
          />

          {/* Legs */}
          <path
            d="M155,500 Q150,540 145,580 Q140,620 135,660 Q130,700 125,740 Q120,780 100,800 M245,500 Q250,540 255,580 Q260,620 265,660 Q270,700 275,740 Q280,780 300,800"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
            strokeDasharray="5,5"
          />

          {/* Clickable body parts */}
          {Object.entries(bodyParts).map(([partKey, part]) => (
            <g key={partKey}>
              <path
                d={part.path}
                fill={isPartSelected(partKey) ? "#3b82f6" : hoveredPart === partKey ? "#60a5fa" : "#f3f4f6"}
                stroke={isPartSelected(partKey) ? "#1d4ed8" : "#9ca3af"}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPart(partKey)}
                onMouseLeave={() => setHoveredPart(null)}
                onClick={() => handlePartClick(partKey)}
              />
              {(hoveredPart === partKey || isPartSelected(partKey)) && (
                <text
                  x={part.center.x}
                  y={part.center.y - 15}
                  textAnchor="middle"
                  className="fill-gray-700 text-xs font-medium pointer-events-none"
                  style={{ fontSize: '12px' }}
                >
                  {part.label}
                </text>
              )}
            </g>
          ))}
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

// XRay Skeleton Loading Component
const XRaySkeletonLoading = ({ isRTL }: { isRTL: boolean }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 md:p-6">
    <div className="max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Skeleton className="w-14 h-14 rounded-full" />
        </div>
        <Skeleton className="h-9 w-96 mx-auto mb-2" />
        <Skeleton className="h-6 w-80 mx-auto" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient Information Skeleton */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-black to-blue-700 p-6">
            <div className="flex items-center text-white">
              <User className="w-6 h-6 mr-3" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
          <div className="p-6 space-y-4">
            {/* Patient Search */}
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>

            {/* Date of Birth */}
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>

            {/* Requesting Doctor */}
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>

            {/* Clinical Indication */}
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>

        {/* Body Part Selection Skeleton */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-black to-blue-700 p-6">
            <div className="flex items-center text-white">
              <Stethoscope className="w-6 h-6 mr-3" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
          <div className="p-6">
            {/* Body Skeleton */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <Skeleton className="h-6 w-64 mx-auto mb-4" />
              <div className="flex justify-center">
                <Skeleton className="w-96 h-96 rounded-lg" />
              </div>
            </div>

            {/* Dropdown Skeleton */}
            <div className="mt-6">
              <Skeleton className="h-4 w-36 mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>

        {/* File Upload Skeleton */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-black to-blue-700 p-6">
            <div className="flex items-center text-white">
              <Upload className="w-6 h-6 mr-3" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
          <div className="p-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Skeleton className="w-16 h-16" />
                </div>
                <div>
                  <Skeleton className="h-6 w-64 mx-auto mb-2" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>
                <Skeleton className="h-4 w-56 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Skeleton */}
      <div className="mt-8 text-center">
        <Skeleton className="h-14 w-48 mx-auto rounded-lg" />
      </div>
    </div>
  </div>
);

// Authentication/Loading Skeleton
const AuthSkeletonLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
    <div className="text-center">
      <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
      <Skeleton className="h-6 w-48 mx-auto" />
    </div>
  </div>
);

const XRay = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");

  // Form state for body part, doctor, etc.
  const [formFields, setFormFields] = useState({
    bodyPart: "",
    requestingDoctor: "",
    indication: "",
  });

  const fileInputRef = useRef(null);
  const isFetchingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const getImageUrl = (imagePath) => {
    const { data } = supabase.storage
      .from("xray-images")
      .getPublicUrl(imagePath);
    return data.publicUrl;
  };

  // Check auth status and initialize
  useEffect(() => {
    const initializeComponent = async () => {
      if (isInitializedRef.current) return; // Prevent multiple initializations

      isFetchingRef.current = true;
      try {
        setIsLoading(true);
        setIsInitializing(true);
        setError(""); // Reset error

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        console.log("Current user:", user);
        if (!user) {
          setError("Please log in to upload X-ray images");
          return;
        }

        // Fetch data in parallel
        await Promise.all([
          fetchPatients(),
          fetchDoctors()
        ]);

        isInitializedRef.current = true; // Mark as initialized

      } catch (err) {
        console.error("Error initializing component:", err);
        setError(`Failed to initialize: ${err.message}`);
      } finally {
        setIsInitializing(false);
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    initializeComponent();
  }, []); // Empty dependency array to run only once
  // ADD THIS NEW useEffect after the initialization one:
  useEffect(() => {
    return () => {
      // Cleanup function
      setIsLoading(false);
      setIsInitializing(false);
      setError("");
      isFetchingRef.current = false;
      isInitializedRef.current = false;
    };
  }, []);
  // Fetch patients
  const fetchPatients = async () => {

    try {
      const { data, error } = await supabase
        .from("userinfo")
        .select("userid, english_username_a, english_username_d, date_of_birth")
        .eq("user_roles", "Patient");

      if (error) {
        console.error("Error fetching patients:", error);
        throw error;
      }

      console.log("Fetched patients:", data);
      setPatients(data || []);
    } catch (err) {
      console.error("Error fetching patients:", err.message);
      throw new Error(`Failed to load patients: ${err.message}`);
    }
  };

  // Fetch doctors
  const fetchDoctors = async () => {

    try {
      const { data, error } = await supabase
        .from("userinfo")
        .select("userid, english_username_a, english_username_d")
        .eq("user_roles", "Doctor");

      if (error) {
        console.error("Error fetching doctors:", error);
        throw error;
      }

      console.log("Fetched doctors:", data);
      setDoctors(data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err.message);
      // Don't throw here as doctors are optional
    }
  };

  const handleDoctorSearch = (e) => {
    setDoctorSearchTerm(e.target.value);
    if (error && !error.includes('Please log in')) setError("");

  };

  const handleSelectDoctor = (doctor) => {
    console.log("Selected doctor:", doctor);
    setSelectedDoctor(doctor);
    setFormFields((prev) => ({
      ...prev,
      requestingDoctor: `${doctor.english_username_a} ${doctor.english_username_d}`,
    }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (error && !error.includes('Please log in')) setError("");

  };

  const handleSelectPatient = (patient) => {
    console.log("Selected patient:", patient);
    setSelectedPatient(patient);
    setFormFields((prev) => ({
      ...prev,
      patientName: `${patient.english_username_a} ${patient.english_username_d}`,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
    if (error && !error.includes('Please log in')) setError("");

  };

  // Handle body part selection from skeleton
  const handleBodyPartSelect = (bodyPart) => {
    setFormFields((prev) => ({ ...prev, bodyPart }));
        if (error && !error.includes('Please log in')) setError("");

  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Invalid file type. Please select a JPEG or PNG image.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File too large. Please select a file smaller than 10MB.");
      return;
    }

    setFile(selectedFile);
    setAnnouncement(`File selected: ${selectedFile.name}`);
    if (isSaved) setIsSaved(false);
    if (error) setError("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeFile = () => {
    setFile(null);
    setAnnouncement("File removed");
    if (error) setError("");
  };

  const handleSave = async () => {
    setError(""); // ADD THIS LINE

    // Validation
    if (!selectedPatient) {
      setError(t('xray.fillRequiredFields') || "Please select a patient");
      return;
    }

    if (!file) {
      setError(t('xray.fillRequiredFields') || "Please select an X-ray image");
      return;
    }

    if (!formFields.bodyPart) {
      setError(t('xray.fillRequiredFields') || "Please select a body part");
      return;
    }

    setIsUploading(true);
    setError("");
    setAnnouncement("");

    try {
      console.log("=== STARTING X-RAY UPLOAD ===");

      // 1. Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log("Auth check:", { hasUser: !!user, authError });

      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
      }

      if (!user) {
        throw new Error("User not authenticated. Please log in.");
      }

      // 2. Upload file to storage
      console.log("Uploading file to storage...");
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filePath = `xrays/${timestamp}-${cleanFileName}`;

      console.log("File path:", filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("xray-images")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      console.log("Upload result:", { uploadData, uploadError });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      console.log("✅ File uploaded successfully");

      // 3. Test database connection first
      console.log("Testing database connection...");
      const { data: testData, error: testError } = await supabase
        .from("xray_images")
        .select("id")
        .limit(1);

      console.log("Database connection test:", { testData, testError });

      if (testError) {
        throw new Error(`Database connection failed: ${testError.message}`);
      }

      // 4. Prepare database record
      console.log("Preparing database record...");
      console.log("Selected patient data:", selectedPatient);
      console.log("Form fields:", formFields);

      const insertData: {
        patient_id: number;
        body_part: string;
        image_url: string;
        patient_name?: string;
        date_of_birth?: string;
        indication?: string;
        requesting_doctor?: string;
      } = {
        patient_id: parseInt(selectedPatient.userid),
        body_part: formFields.bodyPart.trim(),
        image_url: filePath
      };

      // Add optional fields if they exist
      if (selectedPatient.english_username_a && selectedPatient.english_username_d) {
        insertData.patient_name = `${selectedPatient.english_username_a.trim()} ${selectedPatient.english_username_d.trim()}`;
      }

      if (selectedPatient.date_of_birth) {
        insertData.date_of_birth = selectedPatient.date_of_birth;
      }

      if (formFields.indication && formFields.indication.trim()) {
        insertData.indication = formFields.indication.trim();
      }

      if (formFields.requestingDoctor && formFields.requestingDoctor.trim()) {
        insertData.requesting_doctor = formFields.requestingDoctor.trim();
      }

      console.log("Final insert data:", insertData);

      // 5. Insert into database with detailed error logging
      console.log("Inserting into database...");
      const { data: dbData, error: dbError } = await supabase
        .from("xray_images")
        .insert(insertData)
        .select();

      console.log("Database insert result:", { dbData, dbError });

      if (dbError) {
        console.error("Database error details:", {
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
          code: dbError.code
        });

        // Delete uploaded file if database insert fails
        console.log("Deleting uploaded file due to database error...");
        await supabase.storage
          .from("xray-images")
          .remove([filePath]);

        throw new Error(`Database error: ${dbError.message} (Code: ${dbError.code})`);
      }

      if (!dbData || dbData.length === 0) {
        console.error("No data returned from database insert");
        // Delete uploaded file if no data returned
        await supabase.storage
          .from("xray-images")
          .remove([filePath]);

        throw new Error("Failed to save X-ray record - no data returned");
      }

      console.log("✅ Successfully saved X-ray record:", dbData[0]);

      // Success!
      setIsSaved(true);
      setAnnouncement("X-ray uploaded and saved successfully!");

      // Reset form after 3 seconds
      setTimeout(() => {
        resetForm(); // Use the new reset function
      }, 3000);

    } catch (err) {
      console.error("=== UPLOAD ERROR ===", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };
  const resetForm = () => {
    setSelectedPatient(null);
    setSelectedDoctor(null);
    setFile(null);
    setFormFields({ bodyPart: "", requestingDoctor: "", indication: "" });
    setIsSaved(false);
    setAnnouncement("");
    setDoctorSearchTerm("");
    setSearchTerm("");
    setError("");
  };
  // Show auth skeleton while checking user
  if (isInitializing) {
    return <AuthSkeletonLoading />;
  }

  // Show skeleton loading while data is being fetched
  if (isLoading) {
    return <XRaySkeletonLoading isRTL={isRTL} />;
  }

  // Show error state if there's a critical error
  if (error && (error.includes('Please log in') || (patients.length === 0 && doctors.length === 0 && !isInitializing))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isRTL ? 'خطأ' : 'Error'}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {isRTL ? 'تحديث الصفحة' : 'Refresh Page'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t('xray.pageTitle') || 'X-Ray Image Upload System'}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('xray.pageDescription') || 'Securely upload and manage medical X-ray images'}
          </p>
        </div>

        {/* Status Messages */}
        {isSaved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
            <span className="text-green-800 font-medium">{t('xray.saveSuccess') || 'X-ray saved successfully!'}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {announcement && !error && !isSaved && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
            <span className="text-blue-800">{announcement}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-black to-blue-700 p-6">
              <div className="flex items-center text-white">
                <User className="w-6 h-6 mr-3" />
                <h2 className="text-xl font-semibold">{t('xray.patientInformation') || 'Patient Information'}</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('xray.selectPatient') || 'Select Patient'}
                </label>
                <input
                  type="text"
                  placeholder={t('xray.searchPatientPlaceholder') || 'Search patients...'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  value={searchTerm}
                  onChange={handleSearch}
                  disabled={isLoading}
                />
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  onChange={(e) => {
                    const patient = patients.find(p => p.userid === parseInt(e.target.value));
                    if (patient) {
                      handleSelectPatient(patient);
                    }
                  }}
                  value={selectedPatient?.userid || ""}
                  disabled={isLoading}
                >
                  <option value="">{t('xray.selectPatientOption') || 'Choose a patient...'}</option>
                  {patients
                    .filter((p) =>
                      `${p.english_username_a} ${p.english_username_d}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((p) => (
                      <option key={p.userid} value={p.userid}>
                        {`${p.english_username_a} ${p.english_username_d}`} (ID: {p.userid})
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      value={selectedPatient?.date_of_birth || ""}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('xray.requestingDoctor') || 'Requesting Doctor'}
                </label>
                <input
                  type="text"
                  placeholder={t('xray.searchDoctorPlaceholder') || 'Search doctors...'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  value={doctorSearchTerm}
                  onChange={handleDoctorSearch}
                  disabled={isLoading}
                />
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  onChange={(e) => {
                    const doctor = doctors.find(d => d.userid === parseInt(e.target.value));
                    if (doctor) {
                      handleSelectDoctor(doctor);
                    } else if (e.target.value === "") {
                      setSelectedDoctor(null);
                      setFormFields(prev => ({ ...prev, requestingDoctor: "" }));
                    }
                  }}
                  value={selectedDoctor?.userid || ""}
                  disabled={isLoading}
                >
                  <option value="">{t('xray.selectDoctorOption') || 'Choose a doctor...'}</option>
                  {doctors
                    .filter((d) =>
                      `${d.english_username_a} ${d.english_username_d}`
                        .toLowerCase()
                        .includes(doctorSearchTerm.toLowerCase())
                    )
                    .map((d) => (
                      <option key={d.userid} value={d.userid}>
                        Dr. {`${d.english_username_a} ${d.english_username_d}`} (ID: {d.userid})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('xray.clinicalIndication') || 'Clinical Indication'}
                </label>
                <textarea
                  name="indication"
                  value={formFields.indication}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={t('xray.indicationPlaceholder') || 'Enter clinical indication...'}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Body Part Selection with Skeleton */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-black to-blue-700 p-6">
              <div className="flex items-center text-white">
                <Stethoscope className="w-6 h-6 mr-3" />
                <h2 className="text-xl font-semibold">{t('xray.bodyPart') || 'Body Part Selection'}</h2>
              </div>
            </div>
            <div className="p-6">
              {/* Clickable Skeleton */}
              <ClickableSkeleton
                selectedBodyPart={formFields.bodyPart}
                onBodyPartSelect={handleBodyPartSelect}
              />

              {/* Traditional Dropdown as backup */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('xray.selectFromDropdown')}
                </label>
                <select
                  name="bodyPart"
                  value={formFields.bodyPart}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <option value="">{t('xray.selectBodyPart') || 'Select body part...'}</option>
                  <option value="chest">{t('xray.bodyParts.chest') || 'Chest'}</option>
                  <option value="knee">{t('xray.bodyParts.knee') || 'Knee'}</option>
                  <option value="spine">{t('xray.bodyParts.spine') || 'Spine'}</option>
                  <option value="hand">{t('xray.bodyParts.hand') || 'Hand'}</option>
                  <option value="foot">{t('xray.bodyParts.foot') || 'Foot'}</option>
                  <option value="skull">{t('xray.bodyParts.skull') || 'Skull'}</option>
                  <option value="pelvis">{t('xray.bodyParts.pelvis') || 'Pelvis'}</option>
                  <option value="shoulder">{t('xray.bodyParts.shoulder') || 'Shoulder'}</option>
                  <option value="elbow">{t('xray.bodyParts.elbow') || 'Elbow'}</option>
                  <option value="wrist">{t('xray.bodyParts.wrist') || 'Wrist'}</option>
                  <option value="ankle">{t('xray.bodyParts.ankle') || 'Ankle'}</option>
                  <option value="hip">{t('xray.bodyParts.hip') || 'Hip'}</option>
                </select>
              </div>
            </div>
          </div>
          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-black to-blue-700 p-6">
              <div className="flex items-center text-white">
                <Upload className="w-6 h-6 mr-3" />
                <h2 className="text-xl font-semibold">{t('xray.uploadXrayImage') || 'Upload X-ray Image'}</h2>
              </div>
            </div>
            <div className="p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer hover:bg-gray-50 ${isLoading || isUploading ? "opacity-50 cursor-not-allowed" :
                  isDragging ? "border-blue-500 bg-blue-50" :
                    file ? "border-green-500 bg-green-50" : "border-gray-300"
                  }`}
                onDragOver={!isLoading && !isUploading ? handleDragOver : undefined}
                onDragLeave={!isLoading && !isUploading ? handleDragLeave : undefined}
                onDrop={!isLoading && !isUploading ? handleDrop : undefined}
                onClick={!isLoading && !isUploading ? triggerFileInput : undefined}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg"
                  disabled={isLoading || isUploading}
                />
                {file ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-green-700">{t('xray.fileSelected') || 'File Selected'}</p>
                      <p className="text-gray-600 mt-1 break-all">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      disabled={isLoading || isUploading}
                      className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('xray.removeFile') || 'Remove File'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Upload className={`w-16 h-16 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        {t('xray.dragAndDrop') || 'Drag and drop your X-ray image'}
                      </p>
                      <p className="text-gray-500 mt-1">{t('xray.orClickToBrowse') || 'or click to browse'}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('xray.supportedFormats') || 'Supported formats: JPEG, PNG (Max 10MB)'}
                    </div>
                  </div>
                )}
              </div>
              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Uploading...</span>
                    <span className="text-sm text-gray-500">Processing</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "100%" }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSave}
            disabled={!selectedPatient || !file || !formFields.bodyPart || isUploading || isLoading}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${selectedPatient && file && formFields.bodyPart && !isUploading && !isLoading
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            {isUploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                {t('xray.uploadingXray') || 'Uploading X-ray...'}
              </div>
            ) : (
              t('xray.saveXrayRecord') || 'Save X-ray Record'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default XRay;