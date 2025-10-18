import React from 'react';
import { useAuth } from '../hooks/useAuth';
import PatientDashboard from '../components/PatientDashboard';
import { Navigate } from 'react-router-dom';

const PatientDashboardPage: React.FC = () => {
    const { user } = useAuth();

    // Redirect if not authenticated or not a patient
    if (!user || user.role !== 'patient') {
        return <Navigate to="/auth" replace />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <PatientDashboard patientEmail={user.email || ''} />
        </div>
    );
};

export default PatientDashboardPage;
