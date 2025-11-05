import React, { useState, useEffect, useRef, useCallback } from "react";
import SEOHead from "../src/components/seo/SEOHead";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Stethoscope,
  Activity,
  X,
  Search,
  Loader2,
  Clock,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { createNotification } from "../lib/deletionRequests";

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

// Main Ultrasound Component
const Ultrasound = () => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
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

  // Service requests states
  interface ServiceRequest {
    id: number;
    patient_email: string;
    patient_name: string;
    doctor_name: string;
    service_type: string;
    service_subtype?: string;
    service_name?: string;
    service_name_ar?: string;
    price?: number;
    currency?: string;
    payment_status?: string;
    status: string;
    notes?: string;
    secretary_confirmed_at?: string | null;
    completed_at?: string | null;
    created_at: string;
    updated_at: string;
  }
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);

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
        title: t('ultrasound.errors.searchError') || 'Search Error',
        description: t('ultrasound.errors.doctorSearchFailed') || 'Failed to search doctors. Please try again.',
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
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
        title: t('ultrasound.errors.searchError') || 'Search Error',
        description: t('ultrasound.errors.patientSearchFailed') || 'Failed to search patients. Please try again.',
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
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

  // Load service requests for ultrasound
  const loadServiceRequests = async () => {
    try {
      setLoadingRequests(true);
      // Get requests that are secretary_confirmed OR payment_required (after secretary confirms, even if not paid yet)
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('service_type', 'ultrasound')
        .in('status', ['secretary_confirmed', 'payment_required', 'in_progress', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load pricing info for requests with subtypes
      if (data) {
        for (const request of data) {
          if (request.service_subtype) {
            const { data: pricingData } = await supabase
              .from('service_pricing')
              .select('service_name, service_name_ar')
              .eq('service_type', 'ultrasound')
              .eq('service_subtype', request.service_subtype)
              .single();

            if (pricingData) {
              request.service_name = pricingData.service_name;
              request.service_name_ar = pricingData.service_name_ar;
            }
          }
        }
      }

      setServiceRequests(data || []);
    } catch (err: unknown) {
      console.error('Error loading service requests:', err);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل تحميل الطلبات' : 'Failed to load service requests',
        variant: 'destructive',
      });
    } finally {
      setLoadingRequests(false);
    }
  };

  // Update request status
  const updateRequestStatus = async (requestId: number, newStatus: string) => {
    try {
      const updateData: { status: string; completed_at?: string } = { status: newStatus };

      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      // Notify patient
      const request = serviceRequests.find(r => r.id === requestId);
      if (request) {
        await createNotification(
          request.patient_email,
          isRTL ? 'تحديث حالة الطلب' : 'Request Status Updated',
          isRTL
            ? `تم تحديث حالة طلب الموجات فوق الصوتية إلى ${newStatus === 'in_progress' ? 'قيد التنفيذ' : 'مكتمل'}`
            : `Your ultrasound request status has been updated to ${newStatus === 'in_progress' ? 'in progress' : 'completed'}`,
          'info',
          'service_requests',
          requestId.toString()
        );
      }

      toast({
        title: isRTL ? 'نجح' : 'Success',
        description: isRTL ? 'تم تحديث حالة الطلب' : 'Request status updated',
        style: { backgroundColor: '#16a34a', color: '#fff' },
      });

      await loadServiceRequests();
    } catch (err: unknown) {
      console.error('Error updating request status:', err);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل تحديث حالة الطلب' : 'Failed to update request status',
        variant: 'destructive',
      });
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; labelAr: string; className: string }> = {
      pending: { label: 'Pending', labelAr: 'قيد الانتظار', className: 'bg-yellow-100 text-yellow-800' },
      secretary_confirmed: { label: 'Confirmed', labelAr: 'تم التأكيد', className: 'bg-blue-100 text-blue-800' },
      payment_required: { label: 'Payment Required', labelAr: 'يتطلب الدفع', className: 'bg-orange-100 text-orange-800' },
      in_progress: { label: 'In Progress', labelAr: 'قيد التنفيذ', className: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Completed', labelAr: 'مكتمل', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', labelAr: 'ملغي', className: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <Badge className={statusInfo.className}>
        {isRTL ? statusInfo.labelAr : statusInfo.label}
      </Badge>
    );
  };

  // Load service requests on mount
  useEffect(() => {
    loadServiceRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Handle body parts selection with toggle
  const handleBodyPartToggle = (bodyPart: string) => {
    setSelectedBodyParts(prev => {
      if (prev.includes(bodyPart)) {
        // Remove the body part if it's already selected
        return prev.filter(part => part !== bodyPart);
      } else {
        // Add the body part if it's not selected
        return [...prev, bodyPart];
      }
    });
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

  const handleSubmit = async () => {
    if (!file || selectedBodyParts.length === 0) {
      toast({
        title: t('ultrasound.errors.missingData') || 'Missing Data',
        description: t('ultrasound.errors.selectBodyPartAndFile') || 'Please select at least one body part and upload a file.',
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
      return;
    }

    // Patient is required - either selected from search or manually entered with valid name
    if (!selectedPatient && (!patientName || !patientName.trim())) {
      toast({
        title: t('ultrasound.errors.missingData') || 'Missing Data',
        description: t('ultrasound.errors.patientRequired') || 'Please select a patient or enter patient name.',
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
      return;
    }

    // If no patient selected, we need at least patient name and date of birth
    if (!selectedPatient && (!dateOfBirth || !dateOfBirth.trim())) {
      toast({
        title: t('ultrasound.errors.missingData') || 'Missing Data',
        description: t('ultrasound.errors.dobRequired') || 'Please enter patient date of birth.',
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
      return;
    }

    try {
      // Upload file to Supabase Storage with patient-specific folder
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      // ✅ NEW: Store in patient-specific folder
      const filePath = `patient_${selectedPatient.userid}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ultrasound-images')
        .upload(filePath, file); // Use filePath instead of fileName

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ultrasound-images')
        .getPublicUrl(fileName);
      // Prepare patient data - patient_id is required, so if no patient selected,
      // we need to create a temporary patient entry or use a placeholder
      // For now, we'll require patient selection or use a fallback patient_id
      let finalPatientId: number;
      let finalPatientName: string;
      let finalDateOfBirth: string | null;

      if (selectedPatient) {
        finalPatientId = selectedPatient.userid;
        finalPatientName = selectedPatient.english_username_a || '';
        finalDateOfBirth = selectedPatient.date_of_birth || null;
      } else {
        // For manual entry without patient selection, we need to create a patient
        // or use a system patient ID. For now, we'll throw an error asking to select patient.
        // Alternatively, we could create a temporary patient record.
        toast({
          title: t('ultrasound.errors.patientRequired') || 'Patient Required',
          description: t('ultrasound.errors.selectPatientFromList') || 'Please select a patient from the search results. Manual entry requires patient registration first.',
          variant: "destructive",
          className: "bg-red-50 border-red-200 text-red-800",
        });
        return;
      }

      // Insert record with the full path
      const { error: insertError } = await supabase
        .from('ultrasound_images')
        .insert({
          patient_id: selectedPatient.userid,
          patient_name: selectedPatient.english_username_a,
          date_of_birth: selectedPatient.date_of_birth,
          body_part: selectedBodyParts,
          indication: clinicalIndication || null,
          requesting_doctor: selectedDoctor?.name || requestingDoctor || null,
          image_url: filePath  // ✅ Store the full path including patient folder
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: t('ultrasound.success.title') || 'Success',
        description: t('ultrasound.success.saved') || `Ultrasound record saved successfully for ${selectedBodyParts.length} body part(s).`,
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Reset form
      setSelectedBodyParts([]);
      setPatientName("");
      setDateOfBirth("");
      setRequestingDoctor("");
      setClinicalIndication("");
      setFile(null);
      setSelectedPatient(null);
      setSelectedDoctor(null);
      setPatientSearchTerm("");
      setDoctorSearchTerm("");

    } catch (error: unknown) {
      console.error('Error saving Ultrasound record:', error);

      // Show detailed error message to help debug
      let errorMessage = t('ultrasound.errors.tryAgain') || 'Failed to save Ultrasound record. Please try again.';

      if (error && typeof error === 'object' && 'message' in error) {
        const err = error as { message?: string; code?: string; details?: string; hint?: string };
        if (err.message) {
          errorMessage = err.message;
        }

        if (err.code) {
          // Handle specific error codes
          switch (err.code) {
            case '42501': // Insufficient privilege
              errorMessage = 'Permission denied. Please check your role permissions.';
              break;
            case 'PGRST301': // RLS policy violation
              errorMessage = 'Access denied. Your role may not have permission to save ultrasound records.';
              break;
            case '23503': // Foreign key violation
              errorMessage = 'Invalid patient data. Please select a valid patient.';
              break;
            default:
              errorMessage = `Error (${err.code}): ${err.message || 'Please try again.'}`;
          }
        }
      }

      toast({
        title: t('ultrasound.errors.saveFailed') || 'Save Failed',
        description: errorMessage,
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    }
  };

  return (
    <>
      <SEOHead
        title={t('ultrasound.seo.title')}
        description={t('ultrasound.seo.description')}
        keywords={t('ultrasound.seo.keywords')}
        url="https://bethlehemmedcenter.com/ultrasound"
      />
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 md:p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-2">
          {/* Header */}
          <div className="mb-6 text-center px-2 pt-8">
            <div className="flex items-center mb-4 justify-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4 text-center px-2 break-words leading-loose whitespace-normal py-2">
              {t('ultrasound.title')}
            </h1>
            <p className="text-slate-600 text-base md:text-lg w-full text-center mx-auto px-2 break-words">
              {t('ultrasound.subtitle')}
            </p>
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Patient Information Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className={`bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-t-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                <CardTitle className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end text-right' : 'justify-start text-left'}`}>
                  <User className="w-6 h-6" />
                  {t('ultrasound.patientInfo.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Patient Search */}
                <div className="space-y-2 patient-search-container">
                  <Label htmlFor="patientSearch" className={`text-sm font-semibold text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('ultrasound.patientInfo.searchPatient')}
                  </Label>
                  <div className="relative">
                    <Search className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="patientSearch"
                      value={patientSearchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={t('ultrasound.patientInfo.searchPlaceholder')}
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
                                <p className="text-xs text-slate-500">{t('ultrasound.patientInfo.id')}: {patient.id_number}</p>
                              )}
                            </div>
                            <div className={isRTL ? 'text-left' : 'text-right'}>
                              {patient.date_of_birth && (
                                <p className="text-sm text-slate-600">
                                  {t('ultrasound.patientInfo.dob')}: {new Date(patient.date_of_birth).toLocaleDateString()}
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
                      <p className={`text-slate-600 ${isRTL ? 'text-right' : 'text-center'}`}>{t('ultrasound.patientInfo.noPatientsFound')}</p>
                    </div>
                  )}
                </div>

                {/* Selected Patient Info */}
                {selectedPatient && (
                  <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="font-semibold text-green-800 text-sm md:text-base">{t('ultrasound.patientInfo.patientSelected')}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                      <div className={`${isRTL ? 'text-right' : 'text-left'} break-words`}>
                        <span className="font-medium text-slate-700">{t('ultrasound.patientInfo.name')}: </span>
                        <span className={`text-slate-600 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                          {selectedPatient.english_username_a} {selectedPatient.english_username_d || ''}
                        </span>
                      </div>
                      <div className={`${isRTL ? 'text-right' : 'text-left'} break-words`}>
                        <span className="font-medium text-slate-700">{t('ultrasound.patientInfo.email')}: </span>
                        <span className={`text-slate-600 ${isRTL ? 'mr-1' : 'ml-1'} block sm:inline`}>{selectedPatient.user_email}</span>
                      </div>
                      {selectedPatient.id_number && (
                        <div className={`${isRTL ? 'text-right' : 'text-left'} break-words`}>
                          <span className="font-medium text-slate-700">{t('ultrasound.patientInfo.id')}: </span>
                          <span className={`text-slate-600 ${isRTL ? 'mr-1' : 'ml-1'}`}>{selectedPatient.id_number}</span>
                        </div>
                      )}
                      {selectedPatient.gender_user && (
                        <div className={`${isRTL ? 'text-right' : 'text-left'} break-words`}>
                          <span className="font-medium text-slate-700">{t('ultrasound.patientInfo.gender')}: </span>
                          <span className={`text-slate-600 capitalize ${isRTL ? 'mr-1' : 'ml-1'}`}>{selectedPatient.gender_user}</span>
                        </div>
                      )}
                      {selectedPatient.date_of_birth && (
                        <div className={`${isRTL ? 'text-right' : 'text-left'} break-words`}>
                          <span className="font-medium text-slate-700">{t('ultrasound.patientInfo.dateOfBirth')}: </span>
                          <span className={`text-slate-600 ${isRTL ? 'mr-1' : 'ml-1'}`}>
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
                        {t('ultrasound.patientInfo.manualName')}
                      </Label>
                      <Input
                        id="patientName"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder={t('ultrasound.patientInfo.namePlaceholder')}
                        className={`h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className={`text-sm font-semibold text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('ultrasound.patientInfo.manualDob')}
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
                    {t('ultrasound.doctorInfo.title')}
                  </Label>
                  <div className="relative">
                    <Search className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="doctorSearch"
                      value={doctorSearchTerm}
                      onChange={(e) => handleDoctorSearchChange(e.target.value)}
                      placeholder={t('ultrasound.doctorInfo.searchPlaceholder')}
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
                                {t('ultrasound.doctorInfo.drPrefix')} {doctor.name}
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
                      <p className={`text-slate-600 ${isRTL ? 'text-right' : 'text-center'}`}>{t('ultrasound.doctorInfo.noDoctorsFound')}</p>
                    </div>
                  )}
                </div>

                {/* Selected Doctor Info */}
                {selectedDoctor && (
                  <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="font-semibold text-blue-800 text-sm md:text-base">{t('ultrasound.doctorInfo.doctorSelected')}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                      <div className={`${isRTL ? 'text-right' : 'text-left'} break-words`}>
                        <span className="font-medium text-slate-700">{t('ultrasound.doctorInfo.name')}: </span>
                        <span className={`text-slate-600 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('ultrasound.doctorInfo.drPrefix')} {selectedDoctor.name}</span>
                      </div>
                      <div className={`${isRTL ? 'text-right' : 'text-left'} break-words`}>
                        <span className="font-medium text-slate-700">{t('ultrasound.doctorInfo.specialty')}: </span>
                        <span className={`text-slate-600 ${isRTL ? 'mr-1' : 'ml-1'}`}>{selectedDoctor.specialty}</span>
                      </div>
                      <div className={`${isRTL ? 'text-right' : 'text-left'} break-words`}>
                        <span className="font-medium text-slate-700">{t('ultrasound.doctorInfo.clinic')}: </span>
                        <span className={`text-slate-600 ${isRTL ? 'mr-1' : 'ml-1'}`}>{selectedDoctor.clinic_name}</span>
                      </div>
                      <div className={`${isRTL ? 'text-right' : 'text-left'} break-words`}>
                        <span className="font-medium text-slate-700">{t('ultrasound.doctorInfo.email')}: </span>
                        <span className={`text-slate-600 ${isRTL ? 'mr-1' : 'ml-1'} block sm:inline`}>{selectedDoctor.email}</span>
                      </div>
                      {selectedDoctor.phone && (
                        <div className={`${isRTL ? 'text-right' : 'text-left'} break-words`}>
                          <span className="font-medium text-slate-700">{t('ultrasound.doctorInfo.phone')}: </span>
                          <span className={`text-slate-600 ${isRTL ? 'mr-1' : 'ml-1'}`}>{selectedDoctor.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="clinicalIndication" className={`text-sm font-semibold text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('ultrasound.clinicalIndication.title')}
                  </Label>
                  <Textarea
                    id="clinicalIndication"
                    value={clinicalIndication}
                    onChange={(e) => setClinicalIndication(e.target.value)}
                    placeholder={t('ultrasound.clinicalIndication.placeholder')}
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
                  {t('ultrasound.bodyPartSelection.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Label className={`text-sm font-semibold text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('ultrasound.bodyPartSelection.placeholder')}
                  </Label>

                  {/* Selected body parts count */}
                  {selectedBodyParts.length > 0 && (
                    <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-green-800">
                        {selectedBodyParts.length} {t('ultrasound.selected') || 'Selected'}
                      </span>
                    </div>
                  )}

                  {/* Checkbox grid for body parts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                    {[
                      { value: 'neck', label: t('ultrasound.bodyParts.neck') || 'Neck' },
                      { value: 'head', label: t('ultrasound.bodyParts.head') || 'Head' },
                      { value: 'abdomen', label: t('ultrasound.bodyParts.abdomen') || 'Abdomen' },
                      { value: 'abdomen_kidney', label: t('ultrasound.bodyParts.abdomen_kidney') || 'Abdomen (Kidney)' },
                      { value: 'abdomen_spleen', label: t('ultrasound.bodyParts.abdomen_spleen') || 'Abdomen (Spleen)' },
                      { value: 'abdomen_liver', label: t('ultrasound.bodyParts.abdomen_liver') || 'Abdomen (Liver)' },
                      { value: 'abdomen_stomach', label: t('ultrasound.bodyParts.abdomen_stomach') || 'Abdomen (Stomach)' },
                      { value: 'spine', label: t('ultrasound.bodyParts.spine') || 'Spine' },
                      { value: 'scrotum', label: t('ultrasound.bodyParts.scrotum') || 'Scrotum' },
                      { value: 'hip', label: t('ultrasound.bodyParts.hip') || 'Hip (Infant)' },
                    ].map((bodyPart) => (
                      <div
                        key={bodyPart.value}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-slate-50 ${selectedBodyParts.includes(bodyPart.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200'
                          } ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}
                        onClick={() => handleBodyPartToggle(bodyPart.value)}
                      >
                        <Checkbox
                          id={bodyPart.value}
                          checked={selectedBodyParts.includes(bodyPart.value)}
                          onCheckedChange={() => handleBodyPartToggle(bodyPart.value)}
                        />
                        <label
                          htmlFor={bodyPart.value}
                          className={`text-sm font-medium text-slate-700 cursor-pointer flex-1 ${isRTL ? 'text-right' : 'text-left'}`}
                          dir={isRTL ? 'rtl' : 'ltr'}
                        >
                          {bodyPart.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Clear all button */}
                  {selectedBodyParts.length > 0 && (
                    <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBodyParts([])}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {t('ultrasound.actions.clearAll') || 'Clear All'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* File Upload Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className={`bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-t-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                <CardTitle className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end text-right' : 'justify-start text-left'}`}>
                  <Upload className="w-6 h-6" />
                  {t('ultrasound.fileUpload.title')}
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
                        <p className="text-lg font-semibold text-green-700">{t('ultrasound.fileUpload.fileSelected')}</p>
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
                          {t('ultrasound.fileUpload.removeFile')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center">
                      <div className="flex justify-center">
                        <Upload className={`w-16 h-16 ${isDragging ? "text-blue-500" : "text-slate-400"}`} />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-slate-700">
                          {t('ultrasound.fileUpload.dragDropText')}
                        </p>
                        <p className="text-slate-500 mt-1">{t('ultrasound.fileUpload.clickToBrowse')}</p>
                      </div>
                      <div className="text-sm text-slate-500 text-center">
                        {t('ultrasound.fileUpload.supportedFormats')}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Service Requests Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm xl:col-span-3">
              <CardHeader className={`bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-t-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CardTitle className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end text-right' : 'justify-start text-left'}`}>
                    <Clock className="w-6 h-6" />
                    {isRTL ? 'طلبات الخدمة' : 'Service Requests'}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadServiceRequests}
                    disabled={loadingRequests}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingRequests ? 'animate-spin' : ''} ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'تحديث' : 'Refresh'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loadingRequests ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className={`ml-2 ${isRTL ? 'mr-2 ml-0' : ''}`}>{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
                  </div>
                ) : serviceRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>{isRTL ? 'لا توجد طلبات' : 'No service requests'}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceRequests.map((request) => (
                      <div
                        key={request.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="flex-1">
                            <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                              <h3 className="font-semibold text-gray-900">{request.patient_name}</h3>
                              {getStatusBadge(request.status)}
                              {request.status === 'pending' && (
                                <Badge className="bg-gray-100 text-gray-600 text-xs">
                                  {isRTL ? 'بانتظار تأكيد السكرتارية' : 'Awaiting Secretary Confirmation'}
                                </Badge>
                              )}
                            </div>
                            <div className={`space-y-1 text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                              <p>
                                <span className="font-medium">{isRTL ? 'الطبيب: ' : 'Doctor: '}</span>
                                {request.doctor_name}
                              </p>
                              {request.service_name || request.service_name_ar ? (
                                <p>
                                  <span className="font-medium">{isRTL ? 'نوع الفحص: ' : 'Service: '}</span>
                                  {isRTL ? (request.service_name_ar || request.service_name) : (request.service_name || request.service_name_ar)}
                                </p>
                              ) : null}
                              {request.price && (
                                <p>
                                  <span className="font-medium">{isRTL ? 'السعر: ' : 'Price: '}</span>
                                  ₪{request.price} {request.currency || 'ILS'}
                                </p>
                              )}
                              {request.notes && (
                                <p>
                                  <span className="font-medium">{isRTL ? 'ملاحظات: ' : 'Notes: '}</span>
                                  {request.notes}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                {isRTL ? 'تاريخ الطلب: ' : 'Requested: '}
                                {new Date(request.created_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
                              </p>
                              {request.secretary_confirmed_at && (
                                <p className="text-xs text-green-600">
                                  {isRTL ? 'تم التأكيد من السكرتارية: ' : 'Confirmed by Secretary: '}
                                  {new Date(request.secretary_confirmed_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className={`flex flex-col gap-2 ${isRTL ? 'ml-4' : 'ml-4'}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRequestDetails(true);
                              }}
                            >
                              <Eye className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {isRTL ? 'التفاصيل' : 'Details'}
                            </Button>
                            {(request.status === 'secretary_confirmed' || request.status === 'payment_required') ? (
                              <Button
                                size="sm"
                                onClick={() => updateRequestStatus(request.id, 'in_progress')}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                {isRTL ? 'بدء العمل' : 'Start Work'}
                              </Button>
                            ) : request.status === 'in_progress' ? (
                              <Button
                                size="sm"
                                onClick={() => updateRequestStatus(request.id, 'completed')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {isRTL ? 'إكمال' : 'Complete'}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className={`mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 ${isRTL ? 'justify-center' : 'justify-center'}`}>
            <Button
              size="lg"
              className={`w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${isRTL ? 'flex-row-reverse' : ''}`}
              disabled={!selectedPatient || selectedBodyParts.length === 0 || !file || !selectedDoctor}
              onClick={handleSubmit}
            >
              <CheckCircle className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('ultrasound.actions.saveRecord')}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className={`w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}
              onClick={() => {
                setPatientName("");
                setDateOfBirth("");
                setRequestingDoctor("");
                setClinicalIndication("");
                setSelectedBodyParts([]);
                setFile(null);
                clearPatientSelection();
                clearDoctorSelection();
              }}
            >
              {t('ultrasound.actions.resetForm')}
            </Button>
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {showRequestDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className={`bg-gradient-to-r from-slate-900 to-blue-900 text-white ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CardTitle>{isRTL ? 'تفاصيل الطلب' : 'Request Details'}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowRequestDetails(false);
                    setSelectedRequest(null);
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'المريض' : 'Patient'}</h3>
                  <p className="text-gray-700">{selectedRequest.patient_name}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.patient_email}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'الطبيب' : 'Doctor'}</h3>
                  <p className="text-gray-700">{selectedRequest.doctor_name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'الحالة' : 'Status'}</h3>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                {selectedRequest.service_name || selectedRequest.service_name_ar ? (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'نوع الخدمة' : 'Service Type'}</h3>
                    <p className="text-gray-700">
                      {isRTL ? (selectedRequest.service_name_ar || selectedRequest.service_name) : (selectedRequest.service_name || selectedRequest.service_name_ar)}
                    </p>
                  </div>
                ) : null}
                {selectedRequest.price && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'السعر' : 'Price'}</h3>
                    <p className="text-gray-700">₪{selectedRequest.price} {selectedRequest.currency || 'ILS'}</p>
                  </div>
                )}
                {selectedRequest.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'ملاحظات' : 'Notes'}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.notes}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'التواريخ' : 'Timestamps'}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{isRTL ? 'تاريخ الطلب: ' : 'Requested: '}{new Date(selectedRequest.created_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}</p>
                    {selectedRequest.secretary_confirmed_at && (
                      <p className="text-green-600">
                        {isRTL ? 'تم التأكيد: ' : 'Confirmed: '}{new Date(selectedRequest.secretary_confirmed_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
                      </p>
                    )}
                    {selectedRequest.completed_at && (
                      <p className="text-blue-600">
                        {isRTL ? 'تم الإكمال: ' : 'Completed: '}{new Date(selectedRequest.completed_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default Ultrasound;

