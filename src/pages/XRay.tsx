import React, { useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import "./styles/xray.css"
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
  const [announcement, setAnnouncement] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({
      ...prev,
      [name]: value
    }));

    if (isSaved) setIsSaved(false);
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerFileInput();
    }
  }; const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    setAnnouncement(`${t('xray.fileSelected')}: ${selectedFile.name}`);
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
    <div className={`xray-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <main className="xray-main">
        <div className="xray-content-wrapper">
          <h1 className={`xray-title ${isRTL ? 'rtl' : 'ltr'}`}>
            {t('xray.title')}
          </h1>

          {isSaved && (
            <div className="xray-success-notification" dir={isRTL ? 'rtl' : 'ltr'}>
              <p className={`xray-success-text ${isRTL ? 'rtl' : 'ltr'}`}>
                {t('xray.saveSuccess')}
              </p>
            </div>
          )}
          {announcement && (
            <div className="xray-screen-reader-only" aria-live="polite">
              {announcement}
            </div>
          )}
          <div className="xray-upload-container">
            {/* X-Ray Upload */}
            <div className="xray-upload-card">
              <div className="xray-upload-header" dir={isRTL ? 'rtl' : 'ltr'}>
                <h2 className={`xray-upload-title ${isRTL ? 'rtl' : 'ltr'}`}>
                  {t('xray.uploadXrayImage')}
                </h2>
              </div>
              <div className="xray-upload-content" dir={isRTL ? 'rtl' : 'ltr'}>
                <div
                  className={`xray-dropzone xray-touch-target ${isDragging ? 'dragging' : ''} ${isRTL ? 'rtl' : 'ltr'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  onKeyDown={handleKeyDown}  
                  dir={isRTL ? 'rtl' : 'ltr'}
                  role="button"
                  tabIndex={0}
                  aria-label={t('xray.uploadXrayImage')}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="xray-file-input"
                    accept="image/*,.pdf,.dcm"
                    aria-label={t('xray.browseFiles')}
                  />

                  {file ? (
                    <div className="xray-file-selected">
                      <div className="xray-file-icon-container">
                        <svg className="xray-file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <div className="xray-file-status">
                        {t('xray.fileSelected')}
                      </div>
                      <div className="xray-file-name">
                        {file.name}
                      </div>
                      <div className="xray-file-size">
                        {(file.size / (1024 * 1024)).toFixed(2)} {t('xray.mb')}
                      </div>
                    </div>
                  ) : (
                    <div className="xray-empty-state">
                      <div className="xray-empty-icon-container">
                        <svg className="xray-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                      </div>
                      <div className="xray-empty-title">
                        {t('xray.dragAndDrop')}
                      </div>
                      <div className="xray-empty-subtitle">
                        {t('xray.or')}
                      </div>
                      <div className="xray-browse-button-container">
                        <button
                          className="xray-browse-button xray-touch-target"
                          type="button"
                        >
                          {t('xray.browseFiles')}
                        </button>
                      </div>
                      <div className="xray-supported-formats">
                        {t('xray.supportedFormats')}
                      </div>
                    </div>
                  )}
                </div>

                {file && (
                  <div className="xray-remove-container">
                    <button
                      className="xray-remove-button xray-touch-target"
                      onClick={() => setFile(null)}
                    >
                      {t('xray.removeFile')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="xray-save-container">
            <button
              onClick={handleSave}
              disabled={!file}
              className={`xray-save-button xray-touch-target ${!file ? 'disabled' : 'enabled'}`}
              aria-label={t('xray.saveXray')}
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