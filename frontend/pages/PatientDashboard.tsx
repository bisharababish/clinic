import React from 'react';
import { useAuth } from '../hooks/useAuth';
import PatientDashboard from '../components/PatientDashboard';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PatientDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    // Redirect if not authenticated or not a patient
    if (!user || user.role !== 'patient') {
        return <Navigate to="/auth" replace />;
    }

    return (
        <div className={`container mx-auto px-4 py-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <PatientDashboard patientEmail={user.email || ''} />
        </div>
    );
};

export default PatientDashboardPage;
