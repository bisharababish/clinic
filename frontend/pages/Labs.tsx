import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../hooks/useAuth";
import SEOHead from "../src/components/seo/SEOHead";
import { useNavigate } from "react-router-dom";
import { getDefaultRouteForRole } from "../lib/rolePermissions";
import { supabase } from "../lib/supabase";
import { cn } from "../lib/utils";
import { FileUploadService, UploadProgress } from "../lib/fileUploadService";
import { Skeleton } from "../components/ui/skeleton";

// Import shadcn/ui components
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { AlertCircle, CheckCircle, Download, Trash2, File, Clock, RefreshCw, Eye, X } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { createNotification } from "../lib/deletionRequests";
import FileUpload from "../components/ui/file-upload";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import Paragraph from '@tiptap/extension-paragraph';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Image from '@tiptap/extension-image';
import { LanguageContext } from '../components/contexts/LanguageContext';
import type { Editor } from '@tiptap/react';
import './LabsTiptap.css';

interface Patient {
  userid: number;
  english_username_a: string;
  english_username_d: string;
  arabic_username_a: string;
  arabic_username_d: string;
  user_email: string;
  user_roles: string;
  date_of_birth?: string;
  blood_type?: string;
  phone_number?: string;
  address?: string;
}

interface LabResult {
  id?: number;
  patient_id: number;
  patient_name: string;
  patient_email: string;
  date_of_birth: string;
  blood_type?: string;
  test_date: string;
  test_type: string;
  test_results: string;
  doctor_notes: string;
  created_by: number;
  created_at?: string;
  updated_at?: string;
}

interface LabAttachment {
  id: number;
  lab_result_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  created_at: string;
}

// Skeleton Loading Component for Labs
const LabsSkeletonLoading = ({ isRTL }: { isRTL: boolean }) => (
  <div className={cn("min-h-screen bg-background text-foreground", isRTL ? 'rtl' : 'ltr')} dir={isRTL ? 'rtl' : 'ltr'}>
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Title Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-80 mb-2" />
        </div>

        {/* Main Card Skeleton */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Patient Selection Skeleton */}
                <div className="md:col-span-2">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Patient Name Skeleton */}
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Patient Email Skeleton */}
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Date of Birth Skeleton */}
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Blood Type Skeleton */}
                <div>
                  <Skeleton className="h-4 w-18 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Test Date Skeleton */}
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Test Type Skeleton */}
                <div className="md:col-span-2">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Test Results Editor Skeleton */}
                <div className="md:col-span-2">
                  <Skeleton className="h-4 w-20 mb-2" />
                  {/* Toolbar Skeleton */}
                  <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded-t-md">
                    {[...Array(12)].map((_, index) => (
                      <Skeleton key={index} className="h-8 w-12" />
                    ))}
                  </div>
                  {/* Editor Content Skeleton */}
                  <Skeleton className="h-32 w-full rounded-b-md" />
                </div>

                {/* Doctor Notes Editor Skeleton */}
                <div className="md:col-span-2">
                  <Skeleton className="h-4 w-20 mb-2" />
                  {/* Toolbar Skeleton */}
                  <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded-t-md">
                    {[...Array(12)].map((_, index) => (
                      <Skeleton key={index} className="h-8 w-12" />
                    ))}
                  </div>
                  {/* Editor Content Skeleton */}
                  <Skeleton className="h-24 w-full rounded-b-md" />
                </div>

                {/* File Upload Skeleton */}
                <div className="md:col-span-2">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Skeleton className="h-12 w-12 mx-auto mb-4" />
                      <Skeleton className="h-4 w-48 mx-auto mb-2" />
                      <Skeleton className="h-3 w-32 mx-auto" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button Skeleton */}
              <div className="flex justify-end">
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
);

// User Authentication Skeleton Loading
const UserAuthSkeletonLoading = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center">
      <Skeleton className="w-8 h-8 mx-auto mb-4 rounded-full" />
      <Skeleton className="h-6 w-32 mx-auto" />
    </div>
  </div>
);

const Labs = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, isRTL } = useContext(LanguageContext);
  const isFetchingRef = useRef(false);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [labData, setLabData] = useState({
    patientName: "",
    patientId: "",
    patientEmail: "",
    dateOfBirth: "",
    bloodType: "",
    testDate: "",
    testType: "",
    testResults: "",
    doctorNotes: ""
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  // --- File upload state ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [savedLabResultId, setSavedLabResultId] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<LabAttachment[]>([]);

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

  // --- File upload handlers ---
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
    setError(null);
  };
  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  const handleUploadProgress = (progress: UploadProgress[]) => {
    setUploadProgress(progress);
  };
  const uploadFiles = async (labResultId: number, currentUserId: number) => {
    if (selectedFiles.length === 0) return;
    try {
      setIsUploading(true);
      setError(null);
      const uploadedFiles = await FileUploadService.uploadFiles(
        selectedFiles,
        labResultId,
        handleUploadProgress
      );
      await FileUploadService.saveFileMetadata(uploadedFiles, labResultId, currentUserId);
      setSelectedFiles([]);
      setUploadProgress([]);
      await loadAttachments(labResultId);
    } catch (error) {
      setError(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);

    }
  };

  const loadAttachments = async (labResultId: number) => {
    try {
      const attachmentsData = await FileUploadService.getLabAttachments(labResultId);
      const mappedAttachments = Array.isArray(attachmentsData)
        ? attachmentsData.map((att: Record<string, unknown>) => ({
          id: att.id as number,
          lab_result_id: att.lab_result_id as number,
          file_name: att.file_name as string,
          file_path: att.file_path as string,
          file_size: att.file_size as number,
          mime_type: att.mime_type as string,
          uploaded_by: att.uploaded_by as number,
          created_at: att.created_at as string,
        }))
        : [];
      setAttachments(mappedAttachments);
    } catch (error) {
      setError(`Failed to load attachments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  const handleDownloadFile = async (attachment: LabAttachment) => {
    try {
      const downloadUrl = await FileUploadService.getFileUrl(attachment.file_path);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  const handleDeleteAttachment = async (attachment: LabAttachment) => {
    try {
      await FileUploadService.deleteFile(attachment.id, attachment.file_path);
      setAttachments(prev => prev.filter(a => a.id !== attachment.id));
    } catch (error) {
      setError(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Load service requests for lab
  const loadServiceRequests = async () => {
    try {
      setLoadingRequests(true);
      // Get requests that are secretary_confirmed OR payment_required (after secretary confirms, even if not paid yet)
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('service_type', 'lab')
        .in('status', ['secretary_confirmed', 'payment_required', 'in_progress', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich service requests with pricing information
      if (data && data.length > 0) {
        const enrichedRequests = await Promise.all(
          data.map(async (request) => {
            let serviceName = '';
            let serviceNameAr = '';
            
            if (request.service_subtype) {
              const { data: pricingData } = await supabase
                .from('service_pricing')
                .select('service_name, service_name_ar')
                .eq('service_type', 'lab')
                .eq('service_subtype', request.service_subtype)
                .single();
              
              if (pricingData) {
                serviceName = pricingData.service_name || '';
                serviceNameAr = pricingData.service_name_ar || '';
              }
            }
            
            return {
              ...request,
              service_name: serviceName,
              service_name_ar: serviceNameAr
            };
          })
        );
        
        setServiceRequests(enrichedRequests);
      } else {
        setServiceRequests([]);
      }
    } catch (err: unknown) {
      console.error('Error loading service requests:', err);
      setError(isRTL ? 'فشل تحميل الطلبات' : 'Failed to load service requests');
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

      const request = serviceRequests.find(r => r.id === requestId);
      if (request) {
        await createNotification(
          request.patient_email,
          isRTL ? 'تحديث حالة الطلب' : 'Request Status Updated',
          isRTL
            ? `تم تحديث حالة طلب المختبر إلى ${newStatus === 'in_progress' ? 'قيد التنفيذ' : 'مكتمل'}`
            : `Your lab request status has been updated to ${newStatus === 'in_progress' ? 'in progress' : 'completed'}`,
          'info',
          'service_requests',
          requestId.toString()
        );
      }

      await loadServiceRequests();
    } catch (err: unknown) {
      console.error('Error updating request status:', err);
      setError(isRTL ? 'فشل تحديث حالة الطلب' : 'Failed to update request status');
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Role-based access control
  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    const userRole = user.role?.toLowerCase();
    if (userRole !== 'lab' && userRole !== 'admin') {
      const defaultRoute = getDefaultRouteForRole(userRole);
      navigate(defaultRoute, { replace: true });
      return;
    }
  }, [user, navigate]);

  // Fetch patients on component mount
  useEffect(() => {
    let isMounted = true;

    const initializeComponent = async () => {
      if (!user) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      const userRole = user.role?.toLowerCase();
      if (userRole !== 'lab' && userRole !== 'admin') {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      await createLabResultsTableIfNotExists();
      await fetchPatients();
      await loadServiceRequests();
    };

    initializeComponent();

    return () => {
      isMounted = false;
      isFetchingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load service requests on mount
  useEffect(() => {
    loadServiceRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      isFetchingRef.current = false;
    };
  }, []);
  const createLabResultsTableIfNotExists = async () => {
    try {
      // Check if lab_results table exists by trying to select from it
      const { error } = await supabase
        .from('lab_results')
        .select('id')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, but we can't create it via client
        console.log('lab_results table does not exist. Please create it in Supabase with the following SQL:');
        console.log(`
          CREATE TABLE lab_results (
            id SERIAL PRIMARY KEY,
            patient_id INTEGER REFERENCES userinfo(userid),
            patient_name TEXT NOT NULL,
            patient_email TEXT NOT NULL,
            date_of_birth DATE,
            blood_type TEXT,
            test_date DATE NOT NULL,
            test_type TEXT NOT NULL,
            test_results TEXT NOT NULL,
            doctor_notes TEXT,
            created_by INTEGER REFERENCES userinfo(userid),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
      }
    } catch (error) {
      console.error('Error checking lab_results table:', error);
    }
  };

  const fetchPatients = async () => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      // First, fetch all patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('userinfo')
        .select(`
        userid, 
        english_username_a, 
        english_username_d,
        arabic_username_a, 
        arabic_username_d,
        user_email, 
        user_roles, 
        date_of_birth, 
        phone_number, 
        address
      `)
        .eq('user_roles', 'Patient')
        .order('english_username_a');

      if (patientsError) {
        console.error('Database error:', patientsError);
        throw patientsError;
      }

      if (!patientsData || patientsData.length === 0) {
        setPatients([]);
        return;
      }

      // Get all patient IDs
      const patientIds = patientsData.map(p => p.userid);

      // Fetch blood types for all patients from patient_health_info
      const { data: healthData, error: healthError } = await supabase
        .from('patient_health_info')
        .select('patient_id, blood_type')
        .in('patient_id', patientIds);

      if (healthError) {
        console.warn('Could not fetch health data:', healthError);
      }

      // Create a map of patient_id to blood_type for quick lookup
      const bloodTypeMap = new Map();
      if (healthData) {
        healthData.forEach(item => {
          bloodTypeMap.set(item.patient_id, item.blood_type);
        });
      }

      // Merge blood type data with patient data
      const mappedPatients = patientsData.map(patient => ({
        ...patient,
        blood_type: bloodTypeMap.get(patient.userid) || null
      }));

      console.log('Patients loaded:', mappedPatients.length);
      console.log('Sample patient with blood type:', mappedPatients[0]);
      setPatients(mappedPatients);

    } catch (error) {
      console.error('Error fetching patients:', error);
      setError(`Failed to load patients: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  const handlePatientSelect = (patientId: string) => {
    if (!patientId) {
      setSelectedPatient(null);
      setLabData(prev => ({
        ...prev,
        patientName: "",
        patientId: "",
        patientEmail: "",
        dateOfBirth: "",
        bloodType: ""
      }));
      return;
    }

    const patient = patients.find(p => p.userid.toString() === patientId);
    if (patient) {
      setSelectedPatient(patient);

      // Use the correct name fields from your schema
      const patientName = isRTL
        ? `${patient.arabic_username_a || ''} ${patient.arabic_username_d || ''}`.trim()
        : `${patient.english_username_a || ''} ${patient.english_username_d || ''}`.trim();

      // Format date of birth if it exists
      let formattedDOB = "";
      if (patient.date_of_birth) {
        try {
          // Handle different date formats
          const dobDate = new Date(patient.date_of_birth);
          if (!isNaN(dobDate.getTime())) {
            formattedDOB = dobDate.toISOString().split('T')[0]; // YYYY-MM-DD format
          }
        } catch (error) {
          console.warn('Error parsing date of birth:', error);
        }
      }

      setLabData(prev => ({
        ...prev,
        patientName: patientName,
        patientId: patient.userid.toString(),
        patientEmail: patient.user_email || "",
        dateOfBirth: formattedDOB,
        bloodType: patient.blood_type || ""
      }));

      console.log('Selected patient:', {
        name: patientName,
        dob: formattedDOB,
        bloodType: patient.blood_type,
        email: patient.user_email
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLabData(prev => ({
      ...prev,
      [name]: value
    }));

    if (isSaved) setIsSaved(false);
    if (error) setError(null);
  };
  const handleBloodTypeChange = (value: string) => {
    setLabData(prev => ({
      ...prev,
      bloodType: value === "not_specified" ? "" : value
    }));

    if (isSaved) setIsSaved(false);
    if (error) setError(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }

    if (!labData.testDate || !labData.testType || !labData.testResults) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get current user's userid from the database
      let currentUserId = 1; // fallback
      if (user?.email) {
        const { data: userData, error: userError } = await supabase
          .from('userinfo')
          .select('userid')
          .eq('user_email', user.email)
          .single();

        if (!userError && userData) {
          currentUserId = userData.userid; // Don't parse here, keep as bigint
        }
      }

      // Save blood type to patient's record if it was changed
      // Save blood type to patient_health_info if it was changed
      if (labData.bloodType && labData.bloodType !== selectedPatient.blood_type) {
        // Check if patient has a health info record
        const { data: existingHealth, error: checkError } = await supabase
          .from('patient_health_info')
          .select('id')
          .eq('patient_id', selectedPatient.userid)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.warn('Error checking health info:', checkError);
        }

        if (existingHealth) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('patient_health_info')
            .update({ blood_type: labData.bloodType })
            .eq('patient_id', selectedPatient.userid);

          if (updateError) {
            console.warn('Failed to update blood type:', updateError);
          } else {
            console.log('Blood type updated successfully');
          }
        } else {
          // Create new record with blood type
          const { error: insertError } = await supabase
            .from('patient_health_info')
            .insert({
              patient_id: selectedPatient.userid,
              blood_type: labData.bloodType,
              created_by_user_id: currentUserId,
              created_by_email: user?.email,
              created_by_name: user?.name,
              created_by_role: user?.role
            });

          if (insertError) {
            console.warn('Failed to insert blood type:', insertError);
          } else {
            console.log('Blood type record created successfully');
          }
        }
      }

      // Prepare lab result data - ensure all integers are properly converted
      const labResult = {
        patient_id: selectedPatient.userid,
        // Convert bigint to integer
        patient_name: labData.patientName || `${selectedPatient.english_username_a || ''} ${selectedPatient.english_username_d || ''}`.trim(),
        patient_email: labData.patientEmail || selectedPatient.user_email || '',
        date_of_birth: labData.dateOfBirth || null,
        blood_type: labData.bloodType || null,
        test_date: labData.testDate,
        test_type: labData.testType,
        test_results: labData.testResults,
        doctor_notes: labData.doctorNotes || '',
        created_by: currentUserId
      };

      // Debug: Log the exact data being sent
      console.log('Lab result with types:', {
        ...labResult,
        patient_id_type: typeof labResult.patient_id,
        created_by_type: typeof labResult.created_by,
        patient_name_length: labResult.patient_name.length,
        patient_email_length: labResult.patient_email.length
      });

      console.log('Saving lab result:', labResult); // Debug log

      const { data, error } = await supabase
        .from('lab_results')
        .insert(labResult)
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      setIsSaved(true);
      console.log("Lab results saved successfully:", data);

      const newLabResultId = data && data[0] && data[0].id;
      if (selectedFiles.length > 0 && newLabResultId) {
        await uploadFiles(newLabResultId, currentUserId);
        const attachmentsData = await FileUploadService.getLabAttachments(newLabResultId);
        console.log('Attachments after upload:', attachmentsData);
      }

      // Clear form after successful save
      setTimeout(() => {
        setSelectedPatient(null);
        setLabData({
          patientName: "",
          patientId: "",
          patientEmail: "",
          dateOfBirth: "",
          bloodType: "",
          testDate: "",
          testType: "",
          testResults: "",
          doctorNotes: ""
        });
        setIsSaved(false);
      }, 3000);

    } catch (error: unknown) {
      console.error('Error saving lab results:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      if (isFetchingRef.current) {
        isFetchingRef.current = false;
      }
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        setError(`Failed to save lab results: ${error.message}`);
      } else if (typeof error === 'object' && error !== null) {
        console.error('Error object:', error);
        setError(`Failed to save lab results: ${JSON.stringify(error)}`);
      } else {
        console.error('Unknown error type:', typeof error, error);
        setError('Failed to save lab results: Unknown error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const TiptapToolbar = React.memo(({ editor, isRTL }: { editor: Editor | null, isRTL: boolean }) => {
    if (!editor) return null;

    const handleButtonClick = (action: () => void) => {
      return (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        action();
      };
    };

    return (
      <div className="tiptap-toolbar" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
          onMouseDown={handleButtonClick(() => editor.chain().focus().toggleBold().run())}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title={isRTL ? 'عريض' : 'Bold'}
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
          onMouseDown={handleButtonClick(() => editor.chain().focus().toggleItalic().run())}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title={isRTL ? 'مائل' : 'Italic'}
        >
          <em>I</em>
        </button>

        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
          onMouseDown={handleButtonClick(() => editor.chain().focus().toggleUnderline().run())}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          title={isRTL ? 'تحته خط' : 'Underline'}
        >
          <u>U</u>
        </button>

        <div className="toolbar-separator"></div>

        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
          onMouseDown={handleButtonClick(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}
          title={isRTL ? 'عنوان رئيسي' : 'Heading 1'}
        >
          H1
        </button>

        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
          onMouseDown={handleButtonClick(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
          title={isRTL ? 'عنوان فرعي' : 'Heading 2'}
        >
          H2
        </button>

        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('paragraph') ? 'is-active' : ''}`}
          onMouseDown={handleButtonClick(() => editor.chain().focus().setParagraph().run())}
          title={isRTL ? 'نص عادي' : 'Paragraph'}
        >
          P
        </button>

        <div className="toolbar-separator"></div>

        <button
          type="button"
          className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
          onMouseDown={handleButtonClick(() => editor.chain().focus().setTextAlign('left').run())}
          title={isRTL ? 'محاذاة يسار' : 'Align Left'}
        >
          ⇤
        </button>

        <button
          type="button"
          className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
          onMouseDown={handleButtonClick(() => editor.chain().focus().setTextAlign('center').run())}
          title={isRTL ? 'توسيط' : 'Center'}
        >
          ≡
        </button>

        <button
          type="button"
          className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
          onMouseDown={handleButtonClick(() => editor.chain().focus().setTextAlign('right').run())}
          title={isRTL ? 'محاذاة يمين' : 'Align Right'}
        >
          ⇥
        </button>

        <div className="toolbar-separator"></div>

        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
          onMouseDown={handleButtonClick(() => editor.chain().focus().toggleBulletList().run())}
          title={isRTL ? 'قائمة نقطية' : 'Bullet List'}
        >
          •
        </button>

        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
          onMouseDown={handleButtonClick(() => editor.chain().focus().toggleOrderedList().run())}
          title={isRTL ? 'قائمة مرتبة' : 'Numbered List'}
        >
          1.
        </button>

        <div className="toolbar-separator"></div>

        <button
          type="button"
          className="toolbar-btn"
          onMouseDown={handleButtonClick(() => editor.chain().focus().unsetAllMarks().clearNodes().run())}
          title={isRTL ? 'مسح التنسيق' : 'Clear Format'}
        >
          ✕
        </button>
      </div>
    );
  });

  // Initialize editors with better content management
  const testResultsEditor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'listItem'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: isRTL ? 'right' : 'left'
      }),
      Placeholder.configure({
        placeholder: isRTL ? 'أدخل نتائج الفحص التفصيلية' : 'Enter detailed test results'
      }),
      Underline,
      Link,
      Heading.configure({ levels: [1, 2] }),
      Paragraph,
      Bold,
      Italic,
      BulletList,
      OrderedList,
      ListItem,
      Image,
    ],
    content: labData.testResults || '',
    editorProps: {
      attributes: {
        dir: isRTL ? 'rtl' : 'ltr',
        style: `text-align: ${isRTL ? 'right' : 'left'}; min-height: 120px;`,
      },
    },
    onUpdate: useCallback(({ editor }) => {
      const html = editor.getHTML();
      setLabData(prev => ({ ...prev, testResults: html }));
    }, []),
    immediatelyRender: false,
  });

  const doctorNotesEditor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'listItem'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: isRTL ? 'right' : 'left'
      }),
      Placeholder.configure({
        placeholder: isRTL ? 'أدخل ملاحظات أو توصيات إضافية' : 'Enter additional notes or recommendations'
      }),
      Underline,
      Link,
      Heading.configure({ levels: [1, 2] }),
      Paragraph,
      Bold,
      Italic,
      BulletList,
      OrderedList,
      ListItem,
      Image,
    ],
    content: labData.doctorNotes || '',
    editorProps: {
      attributes: {
        dir: isRTL ? 'rtl' : 'ltr',
        style: `text-align: ${isRTL ? 'right' : 'left'}; min-height: 80px;`,
      },
    },
    onUpdate: useCallback(({ editor }) => {
      const html = editor.getHTML();
      setLabData(prev => ({ ...prev, doctorNotes: html }));
    }, []),
    immediatelyRender: false,
  });

  useEffect(() => {
    if (testResultsEditor && !testResultsEditor.isDestroyed) {
      const currentContent = testResultsEditor.getHTML();
      if (currentContent !== labData.testResults) {
        testResultsEditor.commands.setContent(labData.testResults || '');
      }
    }
  }, [labData.testResults, testResultsEditor]);

  useEffect(() => {
    if (doctorNotesEditor && !doctorNotesEditor.isDestroyed) {
      const currentContent = doctorNotesEditor.getHTML();
      if (currentContent !== labData.doctorNotes) {
        doctorNotesEditor.commands.setContent(labData.doctorNotes || '');
      }
    }
  }, [labData.doctorNotes, doctorNotesEditor]);
  if (!user) {
    return <UserAuthSkeletonLoading />;
  }

  // Access denied for non-lab/admin users
  const userRole = user.role?.toLowerCase();
  if (userRole !== 'lab' && userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background sm:p-6 lg:p-8">
        <Card className="max-w-md w-full bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-6 h-6" />
              {t('labs.accessRestricted') || 'Access Restricted'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive/90">
              {t('labs.accessDeniedMessage', { role: user.role }) || `This page is only accessible to Lab and Admin users. Your role: ${user.role}`}
            </p>
            <Button
              onClick={() => navigate(getDefaultRouteForRole(user.role))}
              className="mt-4 w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('labs.goToDashboard') || 'Go to Your Dashboard'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show skeleton loading while data is being fetched
  if (isLoading) {
    return <LabsSkeletonLoading isRTL={isRTL} />;
  }

  // Show error state if loading failed
  if (error && patients.length === 0) {
    return (
      <div className={cn("min-h-screen bg-background text-foreground", isRTL ? 'rtl' : 'ltr')} dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
              {t('labs.title') || 'Laboratory Management'}
            </h1>

            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('error') || 'Error'}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="text-center mt-4">
              <Button onClick={fetchPatients} variant="outline">
                {t('labs.retry') || 'Retry'}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Laboratory Management - Bethlehem Medical Center"
        description="Comprehensive laboratory management system at Bethlehem Medical Center. Manage lab results, patient testing, and medical laboratory services."
        keywords="laboratory management, lab results, medical testing, Bethlehem Medical Center, laboratory services, patient testing"
        url="https://bethlehemmedcenter.com/labs"
      />
      <div className={cn("min-h-screen bg-background text-foreground", isRTL ? 'rtl' : 'ltr')} dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t('labs.title') || 'Laboratory Management'}
            </h1>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('error') || 'Error'}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}



            <Card className="mt-6">
              <CardHeader>
                <CardTitle>
                  {t('labs.labTestInformation') || 'Lab Test Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                    {/* Patient Selection */}
                    <div className="md:col-span-2">
                      <Label htmlFor="patientSelect">
                        {isRTL ? 'اختر المريض' : 'Select Patient'}
                      </Label>
                      <Select
                        onValueChange={(value) => handlePatientSelect(value)}
                        value={selectedPatient?.userid.toString() || ""}
                        disabled={isLoading}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        <SelectTrigger id="patientSelect" className="w-full">
                          <SelectValue placeholder={
                            isLoading
                              ? (isRTL ? 'جاري تحميل المرضى...' : 'Loading patients...')
                              : (isRTL ? 'اختر مريضاً' : 'Choose a patient')
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => {
                            const displayName = isRTL
                              ? (patient.arabic_username_a || patient.english_username_a)
                              : (patient.english_username_a || patient.arabic_username_a);

                            return (
                              <SelectItem key={patient.userid} value={patient.userid.toString()}>
                                {displayName} - {patient.user_email}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Patient Name (Read-only) */}
                    <div>
                      <Label htmlFor="patientName">{isRTL ? 'اسم المريض' : 'Patient Name'}</Label>
                      <Input
                        id="patientName"
                        name="patientName"
                        type="text"
                        value={labData.patientName}
                        readOnly
                        placeholder={isRTL ? 'اختر مريضاً أولاً' : 'Select a patient first'}
                      />
                    </div>

                    {/* Patient Email (Read-only) */}
                    <div>
                      <Label htmlFor="patientEmail">{isRTL ? 'البريد الإلكتروني للمريض' : 'Patient Email'}</Label>
                      <Input
                        id="patientEmail"
                        name="patientEmail"
                        type="email"
                        value={labData.patientEmail}
                        readOnly
                        placeholder={isRTL ? 'البريد الإلكتروني للمريض' : 'Patient email'}
                      />
                    </div>

                    {/* Date of Birth (Read-only) */}
                    <div>
                      <Label htmlFor="dateOfBirth">{isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={labData.dateOfBirth}
                        readOnly
                      />
                    </div>

                    {/* Blood Type - Select dropdown with Arabic translations */}
                    <div>
                      <Label htmlFor="bloodType">{isRTL ? 'فصيلة الدم' : 'Blood Type'}</Label>
                      <Select
                        onValueChange={handleBloodTypeChange}
                        value={labData.bloodType || "not_specified"}
                        disabled={isLoading}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        <SelectTrigger id="bloodType" className="w-full">
                          <SelectValue placeholder={isRTL ? 'اختر فصيلة الدم' : 'Select blood type'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_specified">
                            {isRTL ? 'غير محدد' : 'Not specified'}
                          </SelectItem>
                          <SelectItem value="A+">
                            {isRTL ? 'أ+' : 'A+'}
                          </SelectItem>
                          <SelectItem value="A-">
                            {isRTL ? 'أ-' : 'A-'}
                          </SelectItem>
                          <SelectItem value="B+">
                            {isRTL ? 'ب+' : 'B+'}
                          </SelectItem>
                          <SelectItem value="B-">
                            {isRTL ? 'ب-' : 'B-'}
                          </SelectItem>
                          <SelectItem value="AB+">
                            {isRTL ? 'أب+' : 'AB+'}
                          </SelectItem>
                          <SelectItem value="AB-">
                            {isRTL ? 'أب-' : 'AB-'}
                          </SelectItem>
                          <SelectItem value="O+">
                            {isRTL ? 'و+' : 'O+'}
                          </SelectItem>
                          <SelectItem value="O-">
                            {isRTL ? 'و-' : 'O-'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Test Date */}
                    <div>
                      <Label htmlFor="testDate">{isRTL ? 'تاريخ الفحص' : 'Test Date'}</Label>
                      <input
                        id="testDate"
                        name="testDate"
                        type="date"
                        value={labData.testDate}
                        onChange={handleChange}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    {/* Test Type */}
                    <div className="md:col-span-2">
                      <Label htmlFor="testType">{isRTL ? 'نوع الفحص' : 'Test Type'}</Label>
                      <Input
                        id="testType"
                        name="testType"
                        type="text"
                        value={labData.testType}
                        onChange={handleChange}
                        placeholder={isRTL ? 'أدخل نوع الفحص (مثل: فحص الدم)' : 'Enter test type (e.g., Blood Test)'}
                        required
                      />
                    </div>
                    {/* Test Results */}
                    {isClient && testResultsEditor && (
                      <div className="md:col-span-2">
                        <Label id="testResults-label">{isRTL ? 'نتائج الفحص' : 'Test Results'}</Label>
                        <TiptapToolbar editor={testResultsEditor} isRTL={isRTL} />
                        <EditorContent editor={testResultsEditor} className="tiptap-editor" aria-labelledby="testResults-label" />
                      </div>
                    )}

                    {/* Doctor Notes */}
                    {userRole !== 'lab' && isClient && doctorNotesEditor && (
                      <div className="md:col-span-2">
                        <Label id="doctorNotes-label">{isRTL ? 'ملاحظات الطبيب' : 'Doctor Notes'}</Label>
                        <TiptapToolbar editor={doctorNotesEditor} isRTL={isRTL} />
                        <EditorContent editor={doctorNotesEditor} className="tiptap-editor" aria-labelledby="doctorNotes-label" />
                      </div>
                    )}

                    {/* File Upload */}
                    <div className="md:col-span-2">
                      <Label>{isRTL ? 'المرفقات' : 'Attachments'}</Label>
                      <FileUpload
                        onFilesSelected={handleFilesSelected}
                        selectedFiles={selectedFiles}
                        onFileRemove={handleFileRemove}
                        maxFiles={5}
                        maxFileSize={10 * 1024 * 1024} // 10MB
                        disabled={isLoading || isUploading}
                        isRTL={isRTL}
                        translations={{
                          dragAndDrop: isRTL ? 'اسحب وأفلت الملفات هنا، أو' : 'Drag and drop files here, or',
                          browse: isRTL ? 'تصفح' : 'browse',
                          maxFiles: isRTL ? 'حد أقصى {maxFiles} ملفات، حتى {maxSize} ميجابايت لكل ملف' : 'Maximum {maxFiles} files, up to {maxSize}MB each',
                          acceptedTypes: isRTL ? 'المقبول: PDF، الصور، النصوص، مستندات Word' : 'Accepted: PDF, Images, Text, Word documents',
                          selectedFiles: isRTL ? 'الملفات المحددة' : 'Selected Files',
                          fileTooLarge: isRTL ? 'الملف {fileName} كبير جداً. الحد الأقصى للحجم هو {maxSize} ميجابايت' : 'File {fileName} is too large. Maximum size is {maxSize}MB',
                          fileTypeNotAllowed: isRTL ? 'نوع الملف {fileType} غير مسموح' : 'File type {fileType} is not allowed',
                          maximumFilesAllowed: isRTL ? 'حد أقصى {maxFiles} ملفات مسموح' : 'Maximum {maxFiles} files allowed'
                        }}
                      />
                    </div>

                    {/* Upload Progress */}
                    {uploadProgress.length > 0 && (
                      <div className="md:col-span-2">
                        <Label>{isRTL ? 'تقدم التحميل' : 'Upload Progress'}</Label>
                        <div className="space-y-2">
                          {uploadProgress.map((progress, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{progress.file.name}</p>
                                <div className="w-full bg-background rounded-full h-2 mt-1">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${progress.status === 'completed' ? 'bg-green-500' : progress.status === 'error' ? 'bg-red-500' : 'bg-primary'}`}
                                    style={{ width: `${progress.progress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {progress.status === 'completed' ? 'Completed' : progress.status === 'error' ? progress.error : `${progress.progress}%`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Saved Attachments */}
                    {attachments.length > 0 && (
                      <div className="md:col-span-2">
                        <Label>{isRTL ? 'المرفقات المحفوظة' : 'Saved Attachments'}</Label>
                        <div className="space-y-2">
                          {attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center space-x-3">
                                <File className="w-4 h-4" />
                                <div>
                                  <p className="text-sm font-medium">{attachment.file_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadFile(attachment)}
                                  className="text-primary hover:text-primary/80"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAttachment(attachment)}
                                  className="text-destructive hover:text-destructive/80"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Success message */}
                  {isSaved && (
                    <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>{t('success') || 'Success'}</AlertTitle>
                      <AlertDescription>
                        {t('labs.saveSuccess') || 'Lab results saved successfully!'}
                      </AlertDescription>
                    </Alert>
                  )}
                  {/* Submit button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading || !selectedPatient}
                      className="w-full sm:w-auto"
                    >
                      {isLoading
                        ? (isRTL ? 'جاري الحفظ...' : 'Saving...')
                        : (isRTL ? 'حفظ نتائج المختبر' : 'Save Lab Results')
                      }
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Service Requests Card */}
            <Card className="mt-6">
              <CardHeader>
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CardTitle className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Clock className="w-6 h-6" />
                    {isRTL ? 'طلبات الخدمة' : 'Service Requests'}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadServiceRequests}
                    disabled={loadingRequests}
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingRequests ? 'animate-spin' : ''} ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'تحديث' : 'Refresh'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingRequests ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
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
        </main>
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
                  <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'نوع الخدمة' : 'Service Type'}</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {isRTL ? 'مختبر' : 'Lab'}
                  </Badge>
                </div>
                {selectedRequest.service_subtype && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'الاختبار المطلوب' : 'Requested Test'}</h3>
                    <div className="space-y-1">
                      <p className="text-gray-700 font-medium">
                        {isRTL 
                          ? (selectedRequest.service_name_ar || selectedRequest.service_name || selectedRequest.service_subtype)
                          : (selectedRequest.service_name || selectedRequest.service_name_ar || selectedRequest.service_subtype)
                        }
                      </p>
                      {selectedRequest.service_subtype && (
                        <p className="text-sm text-gray-500">
                          {isRTL ? 'رمز الاختبار' : 'Test Code'}: {selectedRequest.service_subtype}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {(selectedRequest.price !== null && selectedRequest.price !== undefined) && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'السعر' : 'Price'}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-blue-600">
                        ₪{selectedRequest.price} {selectedRequest.currency || 'ILS'}
                      </p>
                      {selectedRequest.payment_status && (
                        <Badge 
                          variant={selectedRequest.payment_status === 'paid' ? 'default' : 'secondary'}
                          className={selectedRequest.payment_status === 'paid' ? 'bg-green-500' : ''}
                        >
                          {isRTL 
                            ? (selectedRequest.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع')
                            : (selectedRequest.payment_status === 'paid' ? 'Paid' : 'Unpaid')
                          }
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'الحالة' : 'Status'}</h3>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                {selectedRequest.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'ملاحظات الطبيب' : 'Doctor Notes'}</h3>
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.notes}</p>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'التواريخ' : 'Timestamps'}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{isRTL ? 'تاريخ الطلب: ' : 'Requested: '}{new Date(selectedRequest.created_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}</p>
                    {selectedRequest.secretary_confirmed_at && (
                      <p className="text-green-600">
                        {isRTL ? 'تم التأكيد من قبل السكرتارية: ' : 'Confirmed by Secretary: '}{new Date(selectedRequest.secretary_confirmed_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
                      </p>
                    )}
                    {selectedRequest.completed_at && (
                      <p className="text-blue-600">
                        {isRTL ? 'تم الإكمال: ' : 'Completed: '}{new Date(selectedRequest.completed_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
                      </p>
                    )}
                    {selectedRequest.updated_at && (
                      <p className="text-gray-500 text-xs">
                        {isRTL ? 'آخر تحديث: ' : 'Last Updated: '}{new Date(selectedRequest.updated_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
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

export default Labs;
