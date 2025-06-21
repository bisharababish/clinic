import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getDefaultRouteForRole } from "../lib/rolePermissions";
import { supabase } from "../lib/supabase";
import "./styles/lab.css"



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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      <div className="labs-loading-container">
        <div className="labs-loading-content">
          <div className="labs-loading-spinner"></div>
          <p className="labs-loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  // Access denied for non-lab users
  const userRole = user.role?.toLowerCase();
  if (userRole !== 'lab' && userRole !== 'admin') {
    return (
      <div className="labs-access-denied">
        <div className="labs-access-denied-card">
          <h2 className="labs-access-denied-title">Access Restricted</h2>
          <p className="labs-access-denied-text">
            This page is only accessible to Lab and Admin users. Your role: {user.role}
          </p>
          <button
            onClick={() => navigate(getDefaultRouteForRole(user.role))}
            className="labs-access-denied-button labs-touch-target"
          >
            Go to Your Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`labs-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="labs-main">
        <div className="labs-content-wrapper">
          <h1 className={`labs-title ${isRTL ? 'rtl' : 'ltr'}`}>
            {t('labs.title') || 'Laboratory Management'}
          </h1>

          {error && (
            <div className="labs-error-notification" dir={isRTL ? 'rtl' : 'ltr'}>
              <p className={`labs-error-text ${isRTL ? 'rtl' : 'ltr'}`}>
                {error}
              </p>
            </div>
          )}

          {isSaved && (
            <div className="labs-success-notification" dir={isRTL ? 'rtl' : 'ltr'}>
              <p className={`labs-success-text ${isRTL ? 'rtl' : 'ltr'}`}>
                {t('labs.saveSuccess') || 'Lab results saved successfully!'}
              </p>
            </div>
          )}

          <div className="labs-form-card">
            <div className="labs-form-header" dir={isRTL ? 'rtl' : 'ltr'}>
              <h2 className={`labs-form-title ${isRTL ? 'rtl' : 'ltr'}`}>
                {t('labs.labTestInformation') || 'Lab Test Information'}
              </h2>
            </div>
            <div className="labs-form-content" dir={isRTL ? 'rtl' : 'ltr'}>
              <form onSubmit={handleSubmit} className="labs-form">
                <div className="labs-form-fields">
                  <div className="labs-form-grid">

                    {/* Patient Selection */}
                    <div className="labs-form-field labs-form-field-full">
                      <label htmlFor="patientSelect" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {isRTL ? 'اختر المريض' : 'Select Patient'}
                      </label>
                      <select
                        id="patientSelect"
                        className={`labs-form-input labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={selectedPatient?.userid || ""}
                        onChange={(e) => handlePatientSelect(e.target.value)}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        disabled={isLoading}
                      >
                        <option value="">
                          {isLoading
                            ? (isRTL ? 'جاري تحميل المرضى...' : 'Loading patients...')
                            : (isRTL ? 'اختر مريضاً' : 'Choose a patient')
                          }
                        </option>
                        {patients.map((patient) => {
                          const displayName = isRTL
                            ? (patient.arabic_username_a || patient.english_username_a)
                            : (patient.english_username_a || patient.arabic_username_a);

                          return (
                            <option key={patient.userid} value={patient.userid}>
                              {displayName} - {patient.user_email}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Patient Name (Read-only) */}
                    <div className="labs-form-field">
                      <label htmlFor="patientName" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {isRTL ? 'اسم المريض' : 'Patient Name'}
                      </label>
                      <input
                        id="patientName"
                        name="patientName"
                        type="text"
                        className={`labs-form-input labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.patientName}
                        readOnly
                        placeholder={isRTL ? 'اختر مريضاً أولاً' : 'Select a patient first'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    {/* Patient Email (Read-only) */}
                    <div className="labs-form-field">
                      <label htmlFor="patientEmail" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {isRTL ? 'البريد الإلكتروني للمريض' : 'Patient Email'}
                      </label>
                      <input
                        id="patientEmail"
                        name="patientEmail"
                        type="email"
                        className={`labs-form-input labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.patientEmail}
                        readOnly
                        placeholder={isRTL ? 'البريد الإلكتروني للمريض' : 'Patient email'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    {/* Date of Birth (Read-only) */}
                    <div className="labs-form-field">
                      <label htmlFor="dateOfBirth" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}
                      </label>
                      <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        className={`labs-form-input labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.dateOfBirth}
                        readOnly
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    {/* Blood Type (Read-only) */}
                    <div className="labs-form-field">
                      <label htmlFor="bloodType" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {isRTL ? 'فصيلة الدم' : 'Blood Type'}
                      </label>
                      <input
                        id="bloodType"
                        name="bloodType"
                        type="text"
                        className={`labs-form-input labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.bloodType}
                        readOnly
                        placeholder={labData.bloodType ? "" : (isRTL ? 'فصيلة الدم (إن وجدت)' : 'Blood type (if available)')}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    {/* Test Date */}
                    <div className="labs-form-field">
                      <label htmlFor="testDate" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {isRTL ? 'تاريخ الفحص' : 'Test Date'}
                      </label>
                      <input
                        id="testDate"
                        name="testDate"
                        type="date"
                        className={`labs-form-input labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.testDate}
                        onChange={handleChange}
                        required
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    {/* Test Type */}
                    <div className="labs-form-field labs-form-field-full">
                      <label htmlFor="testType" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {isRTL ? 'نوع الفحص' : 'Test Type'}
                      </label>
                      <input
                        id="testType"
                        name="testType"
                        type="text"
                        className={`labs-form-input labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.testType}
                        onChange={handleChange}
                        placeholder={isRTL ? 'أدخل نوع الفحص (مثل: فحص الدم، الأشعة السينية، الرنين المغناطيسي)' : 'Enter test type (e.g., Blood Test, X-Ray, MRI)'}
                        required
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    {/* Test Results */}
                    <div className="labs-form-field labs-form-field-full">
                      <label htmlFor="testResults" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {isRTL ? 'نتائج الفحص' : 'Test Results'}
                      </label>
                      <textarea
                        id="testResults"
                        name="testResults"
                        rows={4}
                        className={`labs-form-textarea labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.testResults}
                        onChange={handleChange}
                        placeholder={isRTL ? 'أدخل نتائج الفحص التفصيلية' : 'Enter detailed test results'}
                        required
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    {/* Doctor Notes */}
                    <div className="labs-form-field labs-form-field-full">
                      <label htmlFor="doctorNotes" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {isRTL ? 'ملاحظات الطبيب' : 'Doctor Notes'}
                      </label>
                      <textarea
                        id="doctorNotes"
                        name="doctorNotes"
                        rows={3}
                        className={`labs-form-textarea labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.doctorNotes}
                        onChange={handleChange}
                        placeholder={isRTL ? 'أدخل ملاحظات أو توصيات إضافية' : 'Enter additional notes or recommendations'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                  </div>

                  {/* Submit button */}
                  <div className="labs-submit-container">
                    <button
                      type="submit"
                      className={`labs-submit-button labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                      disabled={isLoading || !selectedPatient}
                    >
                      {isLoading
                        ? (isRTL ? 'جاري الحفظ...' : 'Saving...')
                        : (isRTL ? 'حفظ نتائج المختبر' : 'Save Lab Results')
                      }
                    </button>
                  </div>

                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Labs;