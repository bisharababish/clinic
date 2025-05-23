// components/layout/Header.tsx
import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeContext, ThemeContextType } from '../../components/contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export function Header() {
    const { user, logout } = useAuth();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [effectiveRole, setEffectiveRole] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useContext<ThemeContextType>(ThemeContext);
    const { isRTL } = useContext(LanguageContext);
    const { t } = useTranslation();

    // Extra check for authentication state on mount and when user changes
    useEffect(() => {
        const checkAuthStatus = async () => {
            // Check if we have user in the context
            if (user) {
                console.log("User found in context:", user);
                setIsAuthenticated(true);
                setEffectiveRole(user.role);
                return;
            }

            // Check admin login success flag
            const adminLoginSuccess = sessionStorage.getItem('admin_login_success');
            if (adminLoginSuccess === 'true') {
                console.log('Admin login flag detected');
                setIsAuthenticated(true);
                setEffectiveRole('admin');
                return;
            }

            // Fallback check for session directly from Supabase
            try {
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    console.log("Session found but no user in context");
                    setIsAuthenticated(true);

                    // Try to get user profile from database
                    const { data: userData, error: userError } = await supabase
                        .from('userinfo')
                        .select('user_roles')
                        .ilike('user_email', data.session.user.email || '')
                        .single();

                    if (!userError && userData) {
                        // Convert to lowercase for consistency
                        setEffectiveRole(userData.user_roles.toLowerCase());
                    }
                    return;
                }

                // Also check localStorage as a last resort
                const cachedUser = localStorage.getItem('clinic_user_profile');
                if (cachedUser) {
                    console.log("Cached user found in localStorage");
                    setIsAuthenticated(true);
                    const userObj = JSON.parse(cachedUser);
                    setEffectiveRole(userObj.role);
                    return;
                }

                console.log("No authentication found");
                setIsAuthenticated(false);
                setEffectiveRole(null);
            } catch (error) {
                console.error("Error checking auth status:", error);
                setIsAuthenticated(false);
                setEffectiveRole(null);
            }
        };

        checkAuthStatus();
    }, [user]);

    // Define which navigation items are visible based on role
    const isAdmin = effectiveRole === "admin";
    const isDoctor = effectiveRole === "doctor";
    const isSecretary = effectiveRole === "secretary";
    const isNurse = effectiveRole === "nurse";
    const isLab = effectiveRole === "lab";
    const isXRay = effectiveRole === "x ray";
    const isPatient = effectiveRole === "patient";

    // Define permissions based on roles
    const canViewHome = isAuthenticated;
    const canViewClinics = isAuthenticated;
    const canViewLabs = isAuthenticated && (isAdmin || isDoctor || isLab);
    const canViewXray = isAuthenticated && (isAdmin || isDoctor || isXRay);
    const canViewAboutUs = isAuthenticated && (isAdmin || isPatient);
    const canViewAdmin = isAuthenticated && isAdmin;

    // Handle logout click
    const handleLogout = async () => {
        try {
            // First clear any local storage and session storage items
            localStorage.removeItem('clinic_user_profile');
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.removeItem('login_in_progress');
            sessionStorage.removeItem('admin_login_success');

            // Then try to logout through the hook
            if (logout) {
                await logout();
            } else {
                // Fallback to direct Supabase logout
                await supabase.auth.signOut();
            }

            // Force state update immediately
            setIsAuthenticated(false);
            setEffectiveRole(null);

            // Redirect to login page after logout
            window.location.href = "/auth";
        } catch (error) {
            console.error('Logout error:', error);
            // Force a hard redirect in case of error
            window.location.href = "/auth";
        }
    };

    // Function to get role display name with translation
    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'admin':
                return t('roles.admin');
            case 'doctor':
                return t('roles.doctor');
            case 'secretary':
                return t('roles.secretary');
            case 'nurse':
                return t('roles.nurse');
            case 'lab':
                return t('roles.lab');
            case 'x ray':
                return t('roles.xray');
            case 'patient':
                return t('roles.patient');
            default:
                return role;
        }
    };

    return (
        <header className={`flex items-center justify-between p-4 border-b relative z-50 ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Left side: Language switcher and theme */}
            <div className={`flex items-center gap-2 ${isRTL ? 'order-3' : 'order-1'}`}>
                <LanguageSwitcher />
                {/* You can add theme switcher here if needed */}
            </div>

            {/* Center: Logo and clinic name */}
            <div className={`flex items-center gap-4 ${isRTL ? 'order-2' : 'order-2'}`}>
                <Link to="/" className="flex items-center gap-2">
                    {/* Logo */}
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">B</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-blue-600">
                            {t('common.clinicName')}
                        </span>
                        <span className="text-xs text-gray-500 hidden sm:block">
                            {t('footer.city')}
                        </span>
                    </div>
                </Link>
            </div>

            {/* Right side: Navigation and user info */}
            <div className={`flex items-center ${isRTL ? 'order-1' : 'order-3'}`}>
                {/* Desktop Navigation */}
                <nav className={`hidden md:flex gap-2 ${isRTL ? 'ml-4' : 'mr-4'}`}>
                    {canViewHome && (
                        <Button variant="ghost" asChild>
                            <Link to="/">{t('navbar.home')}</Link>
                        </Button>
                    )}

                    {canViewClinics && (
                        <Button variant="ghost" asChild>
                            <Link to="/clinics">{t('navbar.clinics')}</Link>
                        </Button>
                    )}

                    {canViewAboutUs && (
                        <Button variant="ghost" asChild>
                            <Link to="/about">{t('navbar.aboutUs')}</Link>
                        </Button>
                    )}

                    {/* Only show Labs to authorized roles */}
                    {canViewLabs && (
                        <Button variant="ghost" asChild>
                            <Link to="/labs">{t('navbar.labs')}</Link>
                        </Button>
                    )}

                    {/* Only show X-Ray to authorized roles */}
                    {canViewXray && (
                        <Button variant="ghost" asChild>
                            <Link to="/xray">{t('navbar.xray')}</Link>
                        </Button>
                    )}

                    {/* Only show Admin Dashboard to admin users */}
                    {canViewAdmin && (
                        <Button variant="ghost" asChild>
                            <Link to="/admin">{t('navbar.adminDashboard')}</Link>
                        </Button>
                    )}

                    {/* Conditional button for Login/Logout */}
                    {isAuthenticated ? (
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                        >
                            {t('common.logout')}
                        </Button>
                    ) : (
                        <Button variant="ghost" asChild>
                            <Link to="/auth">{t('common.login')}</Link>
                        </Button>
                    )}
                </nav>

                {/* Desktop Role Indicator */}
                {effectiveRole && isAuthenticated && (
                    <div className="hidden md:block">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${effectiveRole === "admin"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : effectiveRole === "doctor"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : effectiveRole === "secretary"
                                        ? "bg-purple-100 text-purple-800 border-purple-200"
                                        : effectiveRole === "nurse"
                                            ? "bg-teal-100 text-teal-800 border-teal-200"
                                            : effectiveRole === "lab"
                                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                                : effectiveRole === "x ray"
                                                    ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                                                    : effectiveRole === "patient"
                                                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                        : "bg-green-100 text-green-800 border-green-200"
                            }`}>
                            {getRoleDisplayName(effectiveRole)}
                        </span>
                    </div>
                )}

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-2">
                    {/* Mobile Role Indicator */}
                    {effectiveRole && isAuthenticated && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${effectiveRole === "admin"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : effectiveRole === "doctor"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : effectiveRole === "secretary"
                                        ? "bg-purple-100 text-purple-800 border-purple-200"
                                        : effectiveRole === "nurse"
                                            ? "bg-teal-100 text-teal-800 border-teal-200"
                                            : effectiveRole === "lab"
                                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                                : effectiveRole === "x ray"
                                                    ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                                                    : effectiveRole === "patient"
                                                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                        : "bg-green-100 text-green-800 border-green-200"
                            }`}>
                            {getRoleDisplayName(effectiveRole)}
                        </span>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? t('header.closeMenu') : t('header.toggleMenu')}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Overlay with Animation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-16 ${isRTL ? 'right-0 left-0' : 'left-0 right-0'} bg-white border-b shadow-md md:hidden z-40`}
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        <nav className="flex flex-col p-4 space-y-2">
                            {canViewHome && (
                                <Button variant="ghost" asChild className={isRTL ? 'text-right' : 'text-left'}>
                                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                                        {t('navbar.home')}
                                    </Link>
                                </Button>
                            )}

                            {canViewClinics && (
                                <Button variant="ghost" asChild className={isRTL ? 'text-right' : 'text-left'}>
                                    <Link to="/clinics" onClick={() => setIsMobileMenuOpen(false)}>
                                        {t('navbar.clinics')}
                                    </Link>
                                </Button>
                            )}

                            {canViewAboutUs && (
                                <Button variant="ghost" asChild className={isRTL ? 'text-right' : 'text-left'}>
                                    <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>
                                        {t('navbar.aboutUs')}
                                    </Link>
                                </Button>
                            )}

                            {canViewLabs && (
                                <Button variant="ghost" asChild className={isRTL ? 'text-right' : 'text-left'}>
                                    <Link to="/labs" onClick={() => setIsMobileMenuOpen(false)}>
                                        {t('navbar.labs')}
                                    </Link>
                                </Button>
                            )}

                            {canViewXray && (
                                <Button variant="ghost" asChild className={isRTL ? 'text-right' : 'text-left'}>
                                    <Link to="/xray" onClick={() => setIsMobileMenuOpen(false)}>
                                        {t('navbar.xray')}
                                    </Link>
                                </Button>
                            )}

                            {canViewAdmin && (
                                <Button variant="ghost" asChild className={isRTL ? 'text-right' : 'text-left'}>
                                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                                        {t('navbar.adminDashboard')}
                                    </Link>
                                </Button>
                            )}

                            {isAuthenticated ? (
                                <Button
                                    variant="ghost"
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className={isRTL ? 'text-right' : 'text-left'}
                                >
                                    {t('common.logout')}
                                </Button>
                            ) : (
                                <Button variant="ghost" asChild className={isRTL ? 'text-right' : 'text-left'}>
                                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                                        {t('common.login')}
                                    </Link>
                                </Button>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}