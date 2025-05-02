import React, { useState } from "react";

const Labs = () => {
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
    <div>

      {/* Main Content */}
      <main className="flex-1 p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">Laboratory Test Results</h1>
          
          {isSaved && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <p className="text-green-800">
                Lab results have been saved successfully!
              </p>
            </div>
          )}
          
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">Lab Test Information</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Name
                    </label>
                    <input
                      id="patientName"
                      name="patientName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={labData.patientName}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                      Patient ID
                    </label>
                    <input
                      id="patientId"
                      name="patientId"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={labData.patientId}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={labData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="testDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Test Date
                    </label>
                    <input
                      id="testDate"
                      name="testDate"
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={labData.testDate}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="testType" className="block text-sm font-medium text-gray-700 mb-1">
                      Test Type
                    </label>
                    <input
                      id="testType"
                      name="testType"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={labData.testType}
                      onChange={handleChange}
                      placeholder="e.g., Blood Test, Urinalysis, etc."
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="testResults" className="block text-sm font-medium text-gray-700 mb-1">
                      Test Results
                    </label>
                    <textarea
                      id="testResults"
                      name="testResults"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={labData.testResults}
                      onChange={handleChange}
                      placeholder="Enter detailed test results here"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="doctorNotes" className="block text-sm font-medium text-gray-700 mb-1">
                      Doctor's Notes
                    </label>
                    <textarea
                      id="doctorNotes"
                      name="doctorNotes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={labData.doctorNotes}
                      onChange={handleChange}
                      placeholder="Additional notes or recommendations"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button 
                    onClick={handleSubmit} 
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Lab Results
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