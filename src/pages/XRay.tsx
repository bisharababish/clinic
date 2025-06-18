import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload, CheckCircle, AlertCircle, FileX, User, Calendar, Stethoscope, Camera, X } from "lucide-react";

const XRay = () => {
  const { t } = useTranslation();

  const [patientInfo, setPatientInfo] = useState({
    patientName: "",
    patientId: "",
    dateOfBirth: "",
    bodyPart: "",
    indication: "",
    requestingDoctor: ""
  });

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({
      ...prev,
      [name]: value
    }));
    if (isSaved) setIsSaved(false);
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/tiff', 'application/pdf', 'application/dicom'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.toLowerCase().endsWith('.dcm')) {
      setError(t('xray.invalidFileType'));
      return;
    }

    // Validate file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError(t('xray.fileTooLarge'));
      return;
    }

    setFile(selectedFile);
    setAnnouncement(`${t('xray.fileSelected')}: ${selectedFile.name}`);
    if (isSaved) setIsSaved(false);
    if (error) setError('');
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

  const handleSave = async () => {
    // Validation
    if (!patientInfo.patientName || !patientInfo.patientId || !patientInfo.bodyPart || !file) {
      setError(t('xray.fillRequiredFields'));
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSaved(true);
      setAnnouncement(t('xray.uploadSuccess'));

      // Reset form after success
      setTimeout(() => {
        setPatientInfo({
          patientName: "",
          patientId: "",
          dateOfBirth: "",
          bodyPart: "",
          indication: "",
          requestingDoctor: ""
        });
        setFile(null);
        setIsSaved(false);
      }, 3000);

    } catch (error) {
      console.error('Error uploading X-ray:', error);
      setError(t('xray.uploadError'));
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setAnnouncement(t('xray.fileRemoved'));
    if (error) setError('');
  };

  const isFormValid = patientInfo.patientName && patientInfo.patientId && patientInfo.bodyPart && file;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t('xray.pageTitle')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('xray.pageDescription')}
          </p>
        </div>

        {/* Status Messages */}
        {isSaved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center animate-pulse">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800 font-medium">{t('xray.saveSuccess')}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {announcement && (
          <div className="sr-only" aria-live="polite">
            {announcement}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center text-white">
                <User className="w-6 h-6 mr-3" />
                <h2 className="text-xl font-semibold">{t('xray.patientInformation')}</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('xray.patientName')}
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={patientInfo.patientName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('xray.patientNamePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('xray.patientId')}
                  </label>
                  <input
                    type="text"
                    name="patientId"
                    value={patientInfo.patientId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('xray.patientIdPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('xray.dateOfBirth')}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={patientInfo.dateOfBirth}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('xray.bodyPart')}
                  </label>
                  <select
                    name="bodyPart"
                    value={patientInfo.bodyPart}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">{t('xray.selectBodyPart')}</option>
                    <option value="chest">{t('xray.bodyParts.chest')}</option>
                    <option value="knee">{t('xray.bodyParts.knee')}</option>
                    <option value="spine">{t('xray.bodyParts.spine')}</option>
                    <option value="hand">{t('xray.bodyParts.hand')}</option>
                    <option value="foot">{t('xray.bodyParts.foot')}</option>
                    <option value="skull">{t('xray.bodyParts.skull')}</option>
                    <option value="pelvis">{t('xray.bodyParts.pelvis')}</option>
                    <option value="shoulder">{t('xray.bodyParts.shoulder')}</option>
                    <option value="elbow">{t('xray.bodyParts.elbow')}</option>
                    <option value="wrist">{t('xray.bodyParts.wrist')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('xray.requestingDoctor')}
                </label>
                <div className="relative">
                  <Stethoscope className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="requestingDoctor"
                    value={patientInfo.requestingDoctor}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('xray.doctorNamePlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('xray.clinicalIndication')}
                </label>
                <textarea
                  name="indication"
                  value={patientInfo.indication}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder={t('xray.indicationPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
              <div className="flex items-center text-white">
                <Upload className="w-6 h-6 mr-3" />
                <h2 className="text-xl font-semibold">{t('xray.uploadXrayImage')}</h2>
              </div>
            </div>

            <div className="p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer hover:bg-gray-50 ${isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : file
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerFileInput();
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.dcm"
                />

                {file ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-green-700">{t('xray.fileSelected')}</p>
                      <p className="text-gray-600 mt-1 break-all">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} {t('xray.mb')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('xray.removeFile')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <Upload className={`w-16 h-16 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        {t('xray.dragAndDrop')}
                      </p>
                      <p className="text-gray-500 mt-1">{t('xray.orClickToBrowse')}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('xray.supportedFormats')}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{t('xray.uploading')}</span>
                    <span className="text-sm text-gray-500">{t('xray.processing')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
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
            disabled={!isFormValid || isUploading}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${isFormValid && !isUploading
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {isUploading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                {t('xray.uploadingXray')}
              </div>
            ) : (
              t('xray.saveXrayRecord')
            )}
          </button>
        </div>


      </div>
    </div>
  );
};

export default XRay;