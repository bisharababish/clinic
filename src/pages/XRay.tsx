import React, { useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

const XRay = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [patientInfo, setPatientInfo] = useState({
    patientName: "",
    patientId: "",
    dateOfExam: "",
    bodyPart: "",
    requestingDoctor: ""
  });

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({
      ...prev,
      [name]: value
    }));

    if (isSaved) setIsSaved(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    if (isSaved) setIsSaved(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
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

  const handleSave = () => {
    console.log("X-Ray data saved:", { file });
    setIsSaved(true);
    // In a real app, you would upload this to a server
  };

  return (
    <div className={`${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <main className="flex-1 p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className={`text-2xl font-bold mb-6 ${isRTL ? 'text-left' : 'text-left'}`}>
            {t('xray.title')}
          </h1>

          {isSaved && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
              <p className={`text-green-800 ${isRTL ? 'text-left' : 'text-left'}`}>
                {t('xray.saveSuccess')}
              </p>
            </div>
          )}

          <div className="max-w-xl mx-auto">
            {/* X-Ray Upload */}
            <div className="bg-white border rounded-lg shadow-sm">
              <div className="border-b p-4" dir={isRTL ? 'rtl' : 'ltr'}>
                <h2 className={`text-lg font-semibold ${isRTL ? 'text-left' : 'text-left'}`}>
                  {t('xray.uploadXrayImage')}
                </h2>
              </div>
              <div className="p-6 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 cursor-pointer min-h-80 md:min-h-96 flex flex-col items-center justify-center transition-colors duration-200 ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.dcm"
                  />

                  {file ? (
                    <div className="space-y-4 py-6 w-full text-center">
                      <div className="flex items-center justify-center">
                        <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <div className="text-green-600 font-medium text-xl text-center">
                        {t('xray.fileSelected')}
                      </div>
                      <div className="text-gray-700 font-medium truncate max-w-full px-4 text-center">
                        {file.name}
                      </div>
                      <div className="text-gray-500 text-lg text-center">
                        {(file.size / (1024 * 1024)).toFixed(2)} {t('xray.mb')}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 py-8 w-full text-center">
                      <div className="flex justify-center">
                        <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                      </div>
                      <div className="text-gray-600 font-medium text-xl text-center">
                        {t('xray.dragAndDrop')}
                      </div>
                      <div className="text-gray-400 text-lg text-center">
                        {t('xray.or')}
                      </div>
                      <div className="text-center">
                        <button
                          className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150 text-lg"
                          type="button"
                        >
                          {t('xray.browseFiles')}
                        </button>
                      </div>
                      <div className="text-gray-400 text-base mt-4 text-center">
                        {t('xray.supportedFormats')}
                      </div>
                    </div>
                  )}
                </div>

                {file && (
                  <div className="pt-4 text-center">
                    <button
                      className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setFile(null)}
                    >
                      {t('xray.removeFile')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSave}
              disabled={!file}
              className={`px-8 py-3 text-lg font-medium rounded-md transition-colors ${!file
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                }`}
            >
              {t('xray.saveXray')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default XRay;