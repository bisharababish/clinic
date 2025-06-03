// components/layout/Header.tsx
import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeContext, ThemeContextType } from '../../components/contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { getRolePermissions } from '../../lib/rolePermissions';

export function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
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

    // Get user permissions based on role
    const userPermissions = getRolePermissions(effectiveRole || '');

    // Define which navigation items are visible based on role permissions
    const canViewHome = isAuthenticated && userPermissions.canViewHome;
    const canViewClinics = isAuthenticated && userPermissions.canViewClinics;
    const canViewLabs = isAuthenticated && userPermissions.canViewLabs;
    const canViewXray = isAuthenticated && userPermissions.canViewXray;
    const canViewAboutUs = isAuthenticated && userPermissions.canViewAboutUs;
    const canViewAdmin = isAuthenticated && userPermissions.canViewAdmin;

    // Define role checks for styling
    const isAdmin = effectiveRole === "admin";
    const isDoctor = effectiveRole === "doctor";
    const isSecretary = effectiveRole === "secretary";
    const isNurse = effectiveRole === "nurse";
    const isLab = effectiveRole === "lab";
    const isXRay = effectiveRole === "x ray" || effectiveRole === "xray";
    const isPatient = effectiveRole === "patient";

    // Handle logout click - FIXED TO USE REACT ROUTER
    const handleLogout = async () => {
        try {
            console.log("Starting logout process...");

            // First clear any local storage and session storage items
            localStorage.removeItem('clinic_user_profile');
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.removeItem('login_in_progress');
            sessionStorage.removeItem('admin_login_success');

            // Force state update immediately
            setIsAuthenticated(false);
            setEffectiveRole(null);

            // Close mobile menu if open
            setIsMobileMenuOpen(false);

            // Then try to logout through the hook
            if (logout) {
                await logout();
            } else {
                // Fallback to direct Supabase logout
                await supabase.auth.signOut();
            }

            console.log("Logout successful, navigating to auth page...");

            // Use React Router navigation instead of window.location.href
            navigate('/auth', { replace: true });

        } catch (error) {
            console.error('Logout error:', error);

            // Even on error, clear everything and navigate
            localStorage.clear();
            sessionStorage.clear();
            setIsAuthenticated(false);
            setEffectiveRole(null);

            // Force navigation even if logout failed
            navigate('/auth', { replace: true });
        }
    };

    // Function to get role display name with translation
    const getRoleDisplayName = (role: string) => {
        switch (role?.toLowerCase()) {
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
            case 'xray':
                return t('roles.xray');
            case 'patient':
                return t('roles.patient');
            default:
                return role;
        }
    };

    // Function to get role badge styling
    const getRoleBadgeClass = (role: string) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200 hover:from-red-100 hover:to-red-200";
            case "doctor":
                return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200 hover:from-blue-100 hover:to-blue-200";
            case "secretary":
                return "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border-purple-200 hover:from-purple-100 hover:to-purple-200";
            case "nurse":
                return "bg-gradient-to-r from-teal-50 to-teal-100 text-teal-800 border-teal-200 hover:from-teal-100 hover:to-teal-200";
            case "lab":
                return "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-amber-200 hover:from-amber-100 hover:to-amber-200";
            case "x ray":
            case "xray":
                return "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-800 border-indigo-200 hover:from-indigo-100 hover:to-indigo-200";
            case "patient":
                return "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200";
            default:
                return "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200 hover:from-green-100 hover:to-green-200";
        }
    };

    const getRoleDotClass = (role: string) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return "bg-red-500";
            case "doctor":
                return "bg-blue-500";
            case "secretary":
                return "bg-purple-500";
            case "nurse":
                return "bg-teal-500";
            case "lab":
                return "bg-amber-500";
            case "x ray":
            case "xray":
                return "bg-indigo-500";
            case "patient":
                return "bg-emerald-500";
            default:
                return "bg-green-500";
        }
    };

    return (
        <header className={`sticky top-0 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200/60 z-50 ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex items-center justify-between h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>

                    {/* Left section: Language switcher */}
                    <div className={`flex items-center ${isRTL ? 'order-3' : 'order-1'}`}>
                        <div className="hidden sm:block">
                            <LanguageSwitcher />
                        </div>
                    </div>

                    {/* Center section: Logo and clinic name */}
                    <div className={`flex items-center justify-center flex-1 sm:flex-none ${isRTL ? 'order-2' : 'order-2'}`}>
                        <Link to="/" className="flex items-center gap-3 group transition-all duration-200 hover:scale-105">
                            {/* Logo with Image */}
                            <div className="relative w-12 h-12 rounded-xl shadow-lg overflow-hidden group-hover:shadow-xl transition-all duration-200">
                                <img
                                    src="/images.png"
                                    alt="Clinic Logo"
                                    className="w-full h-full object-cover object-center"
                                    onError={(e) => {
                                        // Fallback to text logo if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            parent.innerHTML = `
                                                <div class="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                                    <span class="text-white font-bold text-xl">B</span>
                                                </div>
                                            `;
                                        }
                                    }}
                                />
                                <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                            </div>

                            {/* Clinic name with better typography */}
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                                    {t('common.clinicName')}
                                </span>
                                <span className="text-sm text-gray-500 hidden sm:block font-medium">
                                    {t('footer.city')}
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Right section: Navigation and user info */}
                    <div className={`flex items-center gap-4 ${isRTL ? 'order-1' : 'order-3'}`}>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {canViewHome && (
                                <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                                    <Link to="/" className="font-medium">{t('navbar.home')}</Link>
                                </Button>
                            )}

                            {canViewClinics && (
                                <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                                    <Link to="/clinics" className="font-medium">{t('navbar.clinics')}</Link>
                                </Button>
                            )}

                            {canViewAboutUs && (
                                <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                                    <Link to="/about" className="font-medium">{t('navbar.aboutUs')}</Link>
                                </Button>
                            )}

                            {canViewLabs && (
                                <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                                    <Link to="/labs" className="font-medium">{t('navbar.labs')}</Link>
                                </Button>
                            )}

                            {canViewXray && (
                                <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                                    <Link to="/xray" className="font-medium">{t('navbar.xray')}</Link>
                                </Button>
                            )}

                            {canViewAdmin && (
                                <Button variant="ghost" size="sm" asChild className={`transition-colors duration-200 ${isAdmin ? 'hover:bg-red-50 hover:text-red-700' : 'hover:bg-purple-50 hover:text-purple-700'}`}>
                                    <Link to="/admin" className="font-medium">
                                        {isAdmin ? t('navbar.adminDashboard') : t('navbar.dashboard')}
                                    </Link>
                                </Button>
                            )}
                        </nav>

                        {/* Desktop Role Badge and Auth Button */}
                        <div className="hidden lg:flex items-center gap-3">
                            {effectiveRole && isAuthenticated && (
                                <div className="relative">
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border transition-all duration-200 hover:shadow-md ${getRoleBadgeClass(effectiveRole)}`}>
                                        <div className={`w-2 h-2 rounded-full mr-2 ${getRoleDotClass(effectiveRole)}`}></div>
                                        {getRoleDisplayName(effectiveRole)}
                                    </span>
                                </div>
                            )}

                            {isAuthenticated ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="font-medium hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all duration-200"
                                >
                                    {t('common.logout')}
                                </Button>
                            ) : (
                                <Button variant="default" size="sm" asChild className="font-medium bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                                    <Link to="/auth">{t('common.login')}</Link>
                                </Button>
                            )}
                        </div>

                        {/* Mobile: Language switcher + Role + Menu button */}
                        <div className="lg:hidden flex items-center gap-2">
                            {/* Mobile Language Switcher */}
                            <div className="sm:hidden">
                                <LanguageSwitcher />
                            </div>

                            {/* Mobile Role Badge */}
                            {effectiveRole && isAuthenticated && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getRoleBadgeClass(effectiveRole).replace('gradient-to-r from-', '').replace(' to-', '').replace(' hover:from-', '').replace(' hover:to-', '')}`}>
                                    {getRoleDisplayName(effectiveRole)}
                                </span>
                            )}

                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label={isMobileMenuOpen ? t('header.closeMenu') : t('header.toggleMenu')}
                                className="p-2 hover:bg-gray-100 transition-colors duration-200"
                            >
                                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay with Enhanced Animation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Mobile Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className={`absolute top-full ${isRTL ? 'right-0 left-0' : 'left-0 right-0'} bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-xl lg:hidden z-50`}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        >
                            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                                <nav className="flex flex-col py-4 space-y-1">
                                    {canViewHome && (
                                        <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200`}>
                                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="font-medium">
                                                {t('navbar.home')}
                                            </Link>
                                        </Button>
                                    )}

                                    {canViewClinics && (
                                        <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200`}>
                                            <Link to="/clinics" onClick={() => setIsMobileMenuOpen(false)} className="font-medium">
                                                {t('navbar.clinics')}
                                            </Link>
                                        </Button>
                                    )}

                                    {canViewAboutUs && (
                                        <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200`}>
                                            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="font-medium">
                                                {t('navbar.aboutUs')}
                                            </Link>
                                        </Button>
                                    )}

                                    {canViewLabs && (
                                        <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200`}>
                                            <Link to="/labs" onClick={() => setIsMobileMenuOpen(false)} className="font-medium">
                                                {t('navbar.labs')}
                                            </Link>
                                        </Button>
                                    )}

                                    {canViewXray && (
                                        <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200`}>
                                            <Link to="/xray" onClick={() => setIsMobileMenuOpen(false)} className="font-medium">
                                                {t('navbar.xray')}
                                            </Link>
                                        </Button>
                                    )}

                                    {canViewAdmin && (
                                        <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start transition-colors duration-200 ${isAdmin ? 'hover:bg-red-50 hover:text-red-700' : 'hover:bg-purple-50 hover:text-purple-700'}`}>
                                            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="font-medium">
                                                {isAdmin ? t('navbar.adminDashboard') : t('navbar.dashboard')}
                                            </Link>
                                        </Button>
                                    )}

                                    <div className="pt-2 border-t border-gray-200 mt-2">
                                        {isAuthenticated ? (
                                            <Button
                                                variant="ghost"
                                                onClick={handleLogout}
                                                className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-red-50 hover:text-red-700 transition-colors duration-200 font-medium w-full`}
                                            >
                                                {t('common.logout')}
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 font-medium`}>
                                                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                                                    {t('common.login')}
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </nav>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}