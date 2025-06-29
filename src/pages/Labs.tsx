import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getDefaultRouteForRole } from "../lib/rolePermissions";
import { supabase } from "../lib/supabase";
import { cn } from "../lib/utils";
import { FileUploadService, UploadProgress } from "../lib/fileUploadService";

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
import { AlertCircle, CheckCircle, Download, Trash2, File } from "lucide-react";
import FileUpload from "../components/ui/file-upload";

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

const Labs = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- File upload state ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [savedLabResultId, setSavedLabResultId] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<LabAttachment[]>([]);

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
      setAttachments(attachmentsData);
    } catch (error) { }
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
    fetchPatients();
    createLabResultsTableIfNotExists();
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
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
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
  blood_type, 
  phone_number, 
  address
`)
        .eq('user_roles', 'Patient')  // Only fetch users with Patient role
        .order('english_username_a');

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Patients loaded:', data?.length || 0);
      console.log('Sample patient data:', data?.[0]); // Debug log
      setPatients(data || []);

    } catch (error) {
      console.error('Error fetching patients:', error);
      setError(`Failed to load patients: ${error.message}`);
    } finally {
      setIsLoading(false);
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
      if (labData.bloodType && labData.bloodType !== selectedPatient.blood_type) {
        const { error: updateError } = await supabase
          .from('userinfo')
          .update({
            blood_type: labData.bloodType
          })
          .eq('userid', selectedPatient.userid);

        if (updateError) {
          console.warn('Failed to update patient blood type:', updateError);
        }
      }

      // Prepare lab result data - ensure all integers are properly converted
      const labResult = {
        patient_id: parseInt(selectedPatient.userid.toString()), // Convert bigint to integer
        patient_name: labData.patientName || `${selectedPatient.english_username_a || ''} ${selectedPatient.english_username_d || ''}`.trim(),
        patient_email: labData.patientEmail || selectedPatient.user_email || '',
        date_of_birth: labData.dateOfBirth || null,
        blood_type: labData.bloodType || null,
        test_date: labData.testDate,
        test_type: labData.testType,
        test_results: labData.testResults,
        doctor_notes: labData.doctorNotes || '',
        created_by: parseInt(currentUserId.toString()) // Convert to integer
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

  // Loading state while checking user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
          <p className="mt-4 text-lg text-foreground">{t('loading') || 'Loading...'}</p>
        </div>
      </div>
    );
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

  return (
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

          {isSaved && (
            <Alert variant="default" className="mt-6 bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>{t('success') || 'Success'}</AlertTitle>
              <AlertDescription>
                {t('labs.saveSuccess') || 'Lab results saved successfully!'}
              </AlertDescription>
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

                  {/* Blood Type (Read-only, but maybe editable in future) */}
                  <div>
                    <Label htmlFor="bloodType">{isRTL ? 'فصيلة الدم' : 'Blood Type'}</Label>
                    <Input
                      id="bloodType"
                      name="bloodType"
                      type="text"
                      value={labData.bloodType}
                      readOnly
                      placeholder={labData.bloodType ? "" : (isRTL ? 'فصيلة الدم (إن وجدت)' : 'Blood type (if available)')}
                    />
                  </div>

                  {/* Test Date */}
                  <div>
                    <Label htmlFor="testDate">{isRTL ? 'تاريخ الفحص' : 'Test Date'}</Label>
                    <Input
                      id="testDate"
                      name="testDate"
                      type="date"
                      value={labData.testDate}
                      onChange={handleChange}
                      required
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
                      placeholder={isRTL ? 'أدخل نوع الفحص (مثل: فحص الدم، الأشعة السينية، الرنين المغناطيسي)' : 'Enter test type (e.g., Blood Test, X-Ray, MRI)'}
                      required
                    />
                  </div>

                  {/* Test Results */}
                  <div className="md:col-span-2">
                    <Label htmlFor="testResults">{isRTL ? 'نتائج الفحص' : 'Test Results'}</Label>
                    <Textarea
                      id="testResults"
                      name="testResults"
                      rows={4}
                      value={labData.testResults}
                      onChange={(e) => handleChange(e)}
                      placeholder={isRTL ? 'أدخل نتائج الفحص التفصيلية' : 'Enter detailed test results'}
                      required
                    />
                  </div>

                  {/* Doctor Notes */}
                  <div className="md:col-span-2">
                    <Label htmlFor="doctorNotes">{isRTL ? 'ملاحظات الطبيب' : 'Doctor Notes'}</Label>
                    <Textarea
                      id="doctorNotes"
                      name="doctorNotes"
                      rows={3}
                      value={labData.doctorNotes}
                      onChange={(e) => handleChange(e)}
                      placeholder={isRTL ? 'أدخل ملاحظات أو توصيات إضافية' : 'Enter additional notes or recommendations'}
                    />
                  </div>

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
        </div>
      </main>
    </div>
  );
};

export default Labs;