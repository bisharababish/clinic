import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getDefaultRouteForRole } from "../lib/rolePermissions";
import "./styles/lab.css"

const Labs = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const [labData, setLabData] = useState({
    patientName: "",
    patientId: "",
    dateOfBirth: "",
    testDate: "",
    testType: "",
    testResults: "",
    doctorNotes: ""
  });

  const [isSaved, setIsSaved] = useState(false);

  // Role-based access control
  useEffect(() => {
    // Check if user exists
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // Check if user has lab or admin role
    // Check if user has lab or admin role
    const userRole = user.role?.toLowerCase();
    if (userRole !== 'lab' && userRole !== 'admin') {
      const defaultRoute = getDefaultRouteForRole(userRole);
      navigate(defaultRoute, { replace: true });
      return;
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLabData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset saved message when form is edited
    if (isSaved) setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Lab data saved:", labData);
    setIsSaved(true);

    // In a real app, you would save this to a database
    // For now, we're just showing a success message
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
  // Access denied for non-lab and non-admin users
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
      {/* Main Content */}
      <main className="labs-main">
        <div className="labs-content-wrapper">
          <h1 className={`labs-title ${isRTL ? 'rtl' : 'ltr'}`}>
            {t('labs.title') || 'Laboratory Management'}
          </h1>

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

                    {/* Patient Name field */}
                    <div className="labs-form-field">
                      <label htmlFor="patientName" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {t('labs.patientName') || 'Patient Name'}
                      </label>
                      <input
                        id="patientName"
                        name="patientName"
                        type="text"
                        className={`labs-form-input labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.patientName}
                        onChange={handleChange}
                        placeholder={t('labs.patientNamePlaceholder') || 'Enter patient name'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    {/* Patient ID field */}
                    <div className="labs-form-field">
                      <label htmlFor="patientId" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {t('labs.patientId') || 'Patient ID'}
                      </label>
                      <input
                        id="patientId"
                        name="patientId"
                        type="text"
                        className={`labs-form-input labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.patientId}
                        onChange={handleChange}
                        placeholder={t('labs.patientIdPlaceholder') || 'Enter patient ID'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    {/* Date of Birth field */}
                    <div className="labs-form-field">
                      <label htmlFor="dateOfBirth" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {t('labs.dateOfBirth') || 'Date of Birth'}
                      </label>
                      <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        className={`labs-form-input labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.dateOfBirth}
                        onChange={handleChange}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    {/* Test Date field */}
                    <div className="labs-form-field">
                      <label htmlFor="testDate" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {t('labs.testDate') || 'Test Date'}
                      </label>
                      <input
                        id="testDate"
                        name="testDate"
                        type="date"
                        className={`labs-form-input labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.testDate}
                        onChange={handleChange}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    {/* Test Type field (full width) */}
                    <div className="labs-form-field labs-form-field-full">
                      <label htmlFor="testType" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {t('labs.testType') || 'Test Type'}
                      </label>
                      <input
                        id="testType"
                        name="testType"
                        type="text"
                        className={`labs-form-input labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.testType}
                        onChange={handleChange}
                        placeholder={t('labs.testTypePlaceholder') || 'Enter test type'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    {/* Test Results field (full width textarea) */}
                    <div className="labs-form-field labs-form-field-full">
                      <label htmlFor="testResults" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {t('labs.testResults') || 'Test Results'}
                      </label>
                      <textarea
                        id="testResults"
                        name="testResults"
                        rows={4}
                        className={`labs-form-textarea labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.testResults}
                        onChange={handleChange}
                        placeholder={t('labs.testResultsPlaceholder') || 'Enter test results'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    {/* Doctor Notes field (full width textarea) */}
                    <div className="labs-form-field labs-form-field-full">
                      <label htmlFor="doctorNotes" className={`labs-form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                        {t('labs.doctorNotes') || 'Doctor Notes'}
                      </label>
                      <textarea
                        id="doctorNotes"
                        name="doctorNotes"
                        rows={3}
                        className={`labs-form-textarea labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                        value={labData.doctorNotes}
                        onChange={handleChange}
                        placeholder={t('labs.doctorNotesPlaceholder') || 'Enter doctor notes'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                  </div>

                  {/* Submit button */}
                  <div className="labs-submit-container">
                    <button
                      type="submit"
                      className={`labs-submit-button labs-touch-target ${isRTL ? 'rtl' : 'ltr'}`}
                    >
                      {t('labs.saveLabResults') || 'Save Lab Results'}
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