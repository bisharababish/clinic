import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../src/components/seo/SEOHead';
import UserPreviewMode from '../components/UserPreviewMode';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, User, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const UserPreviewPage: React.FC = () => {
    const { user, isLoading } = useAuth();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const navigate = useNavigate();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t('common.loading') || 'Loading...'}</p>
                </div>
            </div>
        );
    }

    // If no user after loading is complete, show login prompt
    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="w-6 h-6" />
                            {t('auth.accessDenied') || 'Access Denied'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {t('auth.loginRequired') || 'Please log in to view your medical records.'}
                            </AlertDescription>
                        </Alert>
                        <Button
                            onClick={() => navigate('/auth')}
                            className="mt-4 w-full"
                        >
                            {t('auth.login') || 'Login'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Check if user is a patient or admin
    if (user.role?.toLowerCase() !== 'patient' && user.role?.toLowerCase() !== 'admin') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="w-6 h-6" />
                            {t('auth.accessDenied') || 'Access Denied'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {t('preview.accessDenied') || 'This page is only accessible to patients and administrators.'}
                            </AlertDescription>
                        </Alert>
                        <Button
                            onClick={() => navigate(-1)}
                            variant="outline"
                            className="mt-4 w-full"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('common.goBack') || 'Go Back'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
            <SEOHead
                title={t('preview.pageTitle') || 'My Medical Records - Bethlehem Medical Center'}
                description={t('preview.pageDescription') || 'View your medical appointments, notes, lab results, and X-ray images'}
                keywords={t('preview.pageKeywords') || 'medical records, patient portal, appointments, lab results, X-ray images'}
                url="https://bethlehemmedcenter.com/preview"
            />
            <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {t('common.goBack') || 'Go Back'}
                                </Button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                        {t('preview.title') || 'My Medical Records'}
                                    </h1>
                                    <p className="text-muted-foreground mt-1">
                                        {t('preview.subtitle') || 'View your appointments, medical notes, lab results, and X-ray images'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Preview Mode Component */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-6 w-6" />
                                    {t('preview.patientInfo') || 'Patient Information'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 p-4 bg-muted rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="font-medium text-sm text-muted-foreground mb-1">
                                                {t('common.name') || 'Name'}
                                            </h3>
                                            <p className="text-sm">{user.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-sm text-muted-foreground mb-1">
                                                {t('common.email') || 'Email'}
                                            </h3>
                                            <p className="text-sm">{user.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <UserPreviewMode userEmail={user.email} />
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </>
    );
};

export default UserPreviewPage;
