import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

const Labs = () => {
  const { t, i18n } = useTranslation();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLabData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset saved message when form is edited
    if (isSaved) setIsSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Lab data saved:", labData);
    setIsSaved(true);

    // In a real app, you would save this to a database
    // For now, we're just showing a success message
  };

  return (
    <div className={`${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <main className="flex-1 p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className={`text-2xl font-bold mb-6 ${isRTL ? 'text-left' : 'text-left'}`}>
            {t('labs.title')}
          </h1>

          {isSaved && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
              <p className={`text-green-800 ${isRTL ? 'text-left' : 'text-left'}`}>
                {t('labs.saveSuccess')}
              </p>
            </div>
          )}

          <div className="bg-white border rounded-lg shadow-sm">
            <div className="border-b p-4" dir={isRTL ? 'rtl' : 'ltr'}>
              <h2 className={`text-lg font-semibold ${isRTL ? 'text-left' : 'text-left'}`}>
                {t('labs.labTestInformation')}
              </h2>
            </div>
            <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="patientName" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                      {t('labs.patientName')}
                    </label>
                    <input
                      id="patientName"
                      name="patientName"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-left' : 'text-left'}`}
                      value={labData.patientName}
                      onChange={handleChange}
                      placeholder={t('labs.patientNamePlaceholder')}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>

                  <div>
                    <label htmlFor="patientId" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                      {t('labs.patientId')}
                    </label>
                    <input
                      id="patientId"
                      name="patientId"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-left' : 'text-left'}`}
                      value={labData.patientId}
                      onChange={handleChange}
                      placeholder={t('labs.patientIdPlaceholder')}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>

                  <div>
                    <label htmlFor="dateOfBirth" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                      {t('labs.dateOfBirth')}
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
                      {t('labs.testDate')}
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
                      {t('labs.testType')}
                    </label>
                    <input
                      id="testType"
                      name="testType"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-left' : 'text-left'}`}
                      value={labData.testType}
                      onChange={handleChange}
                      placeholder={t('labs.testTypePlaceholder')}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="testResults" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                      {t('labs.testResults')}
                    </label>
                    <textarea
                      id="testResults"
                      name="testResults"
                      rows={4}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-left' : 'text-left'}`}
                      value={labData.testResults}
                      onChange={handleChange}
                      placeholder={t('labs.testResultsPlaceholder')}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="doctorNotes" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-left' : 'text-left'}`}>
                      {t('labs.doctorNotes')}
                    </label>
                    <textarea
                      id="doctorNotes"
                      name="doctorNotes"
                      rows={3}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-left' : 'text-left'}`}
                      value={labData.doctorNotes}
                      onChange={handleChange}
                      placeholder={t('labs.doctorNotesPlaceholder')}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                </div>

                <div className="relative mt-6 w-full h-12">
                  <button
                    onClick={handleSubmit}
                    className={`absolute px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${isRTL ? 'left-0' : 'right-0'}`}
                  >
                    {t('labs.saveLabResults')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Labs;