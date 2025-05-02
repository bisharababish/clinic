import React, { useState, useRef } from "react";

const XRay = () => {
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
    <div>
      {/* Main Content */}
      <main className="flex-1 p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">X-Ray Image Upload</h1>

          {isSaved && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <p className="text-green-800">
                X-Ray image saved successfully!
              </p>
            </div>
          )}

          <div className="max-w-xl mx-auto">
            {/* X-Ray Upload */}
            <div className="bg-white border rounded-lg shadow-sm">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold">Upload X-Ray Image</h2>
              </div>
              <div className="p-6 space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer min-h-80 md:min-h-96 flex flex-col items-center justify-center transition-colors duration-200 ${
                    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.dcm"
                  />

                  {file ? (
                    <div className="space-y-4 py-6">
                      <div className="flex items-center justify-center">
                        <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <div className="text-green-600 font-medium text-xl">File selected</div>
                      <div className="text-gray-700 font-medium truncate max-w-full px-4">{file.name}</div>
                      <div className="text-gray-500 text-lg">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 py-8">
                      <div className="flex justify-center">
                        <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                      </div>
                      <div className="text-gray-600 font-medium text-xl">
                        Drag and drop your X-Ray image here
                      </div>
                      <div className="text-gray-400 text-lg">or</div>
                      <button
                        className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150 text-lg"
                        type="button"
                      >
                        Browse Files
                      </button>
                      <div className="text-gray-400 text-base mt-4">
                        Supported formats: JPG, PNG, PDF, DICOM
                      </div>
                    </div>
                  )}
                </div>

                {file && (
                  <div className="text-center pt-4">
                    <button
                      className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setFile(null)}
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleSave}
              disabled={!file}
              className={`px-8 py-3 text-lg font-medium rounded-md transition-colors ${
                !file
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
            >
              Save X-Ray
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default XRay;