// Offline Login Component for Bethlehem Medical Center
// Allows staff to access cached data when internet is down

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { offlineAuthManager } from '../lib/offlineAuth';
import { useTranslation } from 'react-i18next';
import { WifiOff, Shield, Database, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface OfflineLoginProps {
    onOfflineLogin: (user: any, cachedData: any) => void;
    onCancel: () => void;
}

export const OfflineLogin: React.FC<OfflineLoginProps> = ({ onOfflineLogin, onCancel }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { t, i18n } = useTranslation();
    const { loginOffline } = useAuth();

    useEffect(() => {
        // Check if offline auth is available
        if (offlineAuthManager.isOfflineAuthAvailable()) {
            const authData = offlineAuthManager.getStoredAuthData();
            if (authData) {
                setEmail(authData.user.email);
            }
        }
    }, []);

    const handleOfflineLogin = async () => {
        setIsLoading(true);
        setError('');

        try {
            console.log('🔍 Checking offline auth availability...');
            console.log('📧 Email entered:', email);
            console.log('🔑 Password entered:', password ? '***' : 'empty');

            // Check if offline auth is available
            if (!offlineAuthManager.isOfflineAuthAvailable()) {
                console.log('❌ No offline auth data available');
                setError(i18n.language === 'ar'
                    ? 'لا توجد بيانات مصادقة محفوظة للعمل في وضع عدم الاتصال. يرجى تسجيل الدخول أولاً أثناء الاتصال بالإنترنت.'
                    : 'No offline authentication data available. Please log in online first to cache your data.'
                );
                return;
            }

            const authData = offlineAuthManager.getStoredAuthData();
            console.log('📦 Retrieved auth data:', authData);

            if (!authData) {
                console.log('❌ Failed to load stored auth data');
                setError(i18n.language === 'ar'
                    ? 'فشل في تحميل بيانات المصادقة المحفوظة'
                    : 'Failed to load stored authentication data'
                );
                return;
            }

            // Simple email verification (in real implementation, you'd verify password hash)
            if (authData.user.email.toLowerCase() !== email.toLowerCase()) {
                console.log('❌ Email mismatch:', authData.user.email, 'vs', email);
                setError(i18n.language === 'ar'
                    ? 'البريد الإلكتروني غير صحيح'
                    : 'Invalid email address'
                );
                return;
            }

            // Check if user has offline access
            if (!offlineAuthManager.hasOfflineAccess()) {
                console.log('❌ User does not have offline access');
                setError(i18n.language === 'ar'
                    ? 'ليس لديك صلاحية للوصول في وضع عدم الاتصال'
                    : 'You do not have permission for offline access'
                );
                return;
            }

            console.log('✅ Offline login successful for:', authData.user.email);

            // Use the loginOffline function from useAuth hook
            try {
                const user = await loginOffline(email, password);
                console.log('✅ User authenticated via useAuth:', user);
                // Success - proceed with offline login
                onOfflineLogin(user, authData.cachedData);
            } catch (loginError) {
                console.error('❌ loginOffline failed:', loginError);
                throw loginError;
            }

        } catch (error) {
            console.error('❌ Offline login error:', error);
            setError(i18n.language === 'ar'
                ? 'حدث خطأ أثناء تسجيل الدخول في وضع عدم الاتصال'
                : 'An error occurred during offline login'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const isRTL = i18n.language === 'ar';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center">
                        <WifiOff className="h-12 w-12 text-red-500" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        {i18n.language === 'ar' ? 'تسجيل الدخول في وضع عدم الاتصال' : 'Offline Login'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {i18n.language === 'ar'
                            ? 'الوصول إلى البيانات المحفوظة مؤقتاً'
                            : 'Access cached data when offline'
                        }
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Shield className="h-5 w-5 mr-2 text-blue-500" />
                            {i18n.language === 'ar' ? 'مصادقة وضع عدم الاتصال' : 'Offline Authentication'}
                        </CardTitle>
                        <CardDescription>
                            {i18n.language === 'ar'
                                ? 'أدخل بياناتك للوصول إلى المعلومات المحفوظة مؤقتاً'
                                : 'Enter your credentials to access cached information'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                {i18n.language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={i18n.language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                                className="mt-1"
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                {i18n.language === 'ar' ? 'كلمة المرور' : 'Password'}
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={i18n.language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                                className="mt-1"
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Database className="h-4 w-4" />
                            <span>
                                {i18n.language === 'ar'
                                    ? 'البيانات المحفوظة مؤقتاً متاحة'
                                    : 'Cached data available'
                                }
                            </span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                                {i18n.language === 'ar'
                                    ? 'الوصول محدود بـ 24 ساعة'
                                    : 'Access limited to 24 hours'
                                }
                            </span>
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                onClick={handleOfflineLogin}
                                disabled={isLoading || !email || !password}
                                className="flex-1"
                            >
                                {isLoading
                                    ? (i18n.language === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...')
                                    : (i18n.language === 'ar' ? 'تسجيل الدخول في وضع عدم الاتصال' : 'Login Offline')
                                }
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                className="flex-1"
                            >
                                {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </Button>
                        </div>

                        {/* Debug button */}
                        <Button
                            variant="outline"
                            onClick={() => {
                                console.log('🔍 Debug: Checking localStorage...');
                                const stored = localStorage.getItem('bethlehem-medical-offline-auth');
                                console.log('📦 Stored offline auth:', stored);
                                if (stored) {
                                    try {
                                        const parsed = JSON.parse(stored);
                                        console.log('📋 Parsed auth data:', parsed);
                                        console.log('⏰ Expires at:', new Date(parsed.expiresAt));
                                        console.log('⏰ Current time:', new Date());
                                        console.log('✅ Is valid:', parsed.expiresAt > Date.now());
                                    } catch (e) {
                                        console.error('❌ Failed to parse stored data:', e);
                                    }
                                } else {
                                    console.log('❌ No offline auth data found in localStorage');
                                }
                            }}
                            className="w-full text-xs"
                        >
                            🔍 Debug: Check Offline Auth Data
                        </Button>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        {i18n.language === 'ar'
                            ? 'هذا الوضع يسمح بالوصول إلى البيانات المحفوظة مؤقتاً فقط'
                            : 'This mode allows access to cached data only'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OfflineLogin;
