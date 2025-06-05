import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getDefaultRouteForRole } from "../lib/rolePermissions";

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Access denied for non-lab users
  // Access denied for non-lab and non-admin users
  const userRole = user.role?.toLowerCase();
  if (userRole !== 'lab' && userRole !== 'admin') {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">Access Restricted</h2>
          <p className="text-red-600">
            This page is only accessible to Lab and Admin users. Your role: {user.role}
          </p>
          <button
            onClick={() => navigate(getDefaultRouteForRole(user.role))}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Go to Your Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <main className="flex-1 p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className={`text-2xl font-bold mb-6 ${isRTL ? 'text-left' : 'text-left'}`}>
            {t('labs.title') || 'Laboratory Management'}
          </h1>

          {isSaved && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
              <p className={`text-green-800 ${isRTL ? 'text-left' : 'text-left'}`}>
                {t('labs.saveSuccess') || 'Lab results saved successfully!'}
              </p>
            </div>
          )}

          <div className="bg-white border rounded-lg shadow-sm">
            <div className="border-b p-4" dir={isRTL ? 'rtl' : 'ltr'}>
              <h2 className={`text-lg font-semibold ${isRTL ? 'text-left' : 'text-left'}`}>
                {t('labs.labTestInformation') || 'Lab Test Information'}
              </h2>
            </div>
            <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="patientName" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                        {t('labs.patientName') || 'Patient Name'}
                      </label>
                      <input
                        id="patientName"
                        name="patientName"
                        type="text"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-left' : 'text-left'}`}
                        value={labData.patientName}
                        onChange={handleChange}
                        placeholder={t('labs.patientNamePlaceholder') || 'Enter patient name'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    <div>
                      <label htmlFor="patientId" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                        {t('labs.patientId') || 'Patient ID'}
                      </label>
                      <input
                        id="patientId"
                        name="patientId"
                        type="text"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-left' : 'text-left'}`}
                        value={labData.patientId}
                        onChange={handleChange}
                        placeholder={t('labs.patientIdPlaceholder') || 'Enter patient ID'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    <div>
                      <label htmlFor="dateOfBirth" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                        {t('labs.dateOfBirth') || 'Date of Birth'}
                      </label>
                      <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-left' : 'text-left'}`}
                        value={labData.dateOfBirth}
                        onChange={handleChange}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    <div>
                      <label htmlFor="testDate" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                        {t('labs.testDate') || 'Test Date'}
                      </label>
                      <input
                        id="testDate"
                        name="testDate"
                        type="date"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-left' : 'text-left'}`}
                        value={labData.testDate}
                        onChange={handleChange}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="testType" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                        {t('labs.testType') || 'Test Type'}
                      </label>
                      <input
                        id="testType"
                        name="testType"
                        type="text"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-left' : 'text-left'}`}
                        value={labData.testType}
                        onChange={handleChange}
                        placeholder={t('labs.testTypePlaceholder') || 'Enter test type'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="testResults" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                        {t('labs.testResults') || 'Test Results'}
                      </label>
                      <textarea
                        id="testResults"
                        name="testResults"
                        rows={4}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-left' : 'text-left'}`}
                        value={labData.testResults}
                        onChange={handleChange}
                        placeholder={t('labs.testResultsPlaceholder') || 'Enter test results'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="doctorNotes" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                        {t('labs.doctorNotes') || 'Doctor Notes'}
                      </label>
                      <textarea
                        id="doctorNotes"
                        name="doctorNotes"
                        rows={3}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-left' : 'text-left'}`}
                        value={labData.doctorNotes}
                        onChange={handleChange}
                        placeholder={t('labs.doctorNotesPlaceholder') || 'Enter doctor notes'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>
                  </div>

                  <div className="relative mt-6 w-full h-12">
                    <button
                      type="submit"
                      className={`absolute px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${isRTL ? 'left-0' : 'right-0'}`}
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