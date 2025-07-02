// components/layout/Header.tsx - Improved version with efficient hamburger menu
import { useEffect, useState, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Menu, X, Lock, Key } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { getRolePermissions, getDefaultRouteForRole } from '../../lib/rolePermissions';
import { PasswordChangeModal } from '../ui/PasswordChangeModal';

export function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [effectiveRole, setEffectiveRole] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const { isRTL } = useContext(LanguageContext);
    const { t } = useTranslation();

    // Optimized mobile menu handlers with immediate state update
    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(prev => !prev);
    }, []);

    const closeMobileMenu = useCallback(() => {
        // Force immediate state update with flushSync for instant response
        setIsMobileMenuOpen(false);
    }, []);

    // Navigation handler that ensures menu closes immediately
    const handleMobileNavigation = useCallback((path: string) => {
        // Close menu immediately first
        setIsMobileMenuOpen(false);

        // Small delay to ensure state update, then navigate
        setTimeout(() => {
            navigate(path);
        }, 10);
    }, [navigate]);

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

    // Mobile menu event handlers with debouncing
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (isMobileMenuOpen && !target.closest('[data-mobile-menu]')) {
                // Debounce the close action
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    setIsMobileMenuOpen(false);
                }, 50);
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isMobileMenuOpen) {
                event.preventDefault();
                setIsMobileMenuOpen(false);
            }
        };

        const handleResize = () => {
            // Close menu on window resize
            if (window.innerWidth >= 1024 && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
            window.addEventListener('resize', handleResize);
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
            window.removeEventListener('resize', handleResize);
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    // Get user permissions based on role
    const userPermissions = getRolePermissions(effectiveRole || '');

    // Define which navigation items are visible based on role permissions
    const canViewHome = isAuthenticated && userPermissions.canViewHome;
    const canViewClinics = isAuthenticated && userPermissions.canViewClinics;
    const canViewLabs = isAuthenticated && userPermissions.canViewLabs;
    const canViewXray = isAuthenticated && userPermissions.canViewXray;
    const canViewAboutUs = isAuthenticated && userPermissions.canViewAboutUs;
    const canViewAdmin = isAuthenticated && userPermissions.canViewAdmin;

    // Doctor-specific permissions
    const canViewDoctorLabs = isAuthenticated && userPermissions.canViewDoctorLabs;
    const canViewDoctorXray = isAuthenticated && userPermissions.canViewDoctorXray;

    // Define role checks for styling
    const isAdmin = effectiveRole === "admin";
    const isDoctor = effectiveRole === "doctor";
    const isSecretary = effectiveRole === "secretary";
    const isNurse = effectiveRole === "nurse";
    const isLab = effectiveRole === "lab";
    const isXRay = effectiveRole === "x ray" || effectiveRole === "xray";
    const isPatient = effectiveRole === "patient";
    const canChangePassword = isAuthenticated && isPatient;

    // Get the appropriate default route based on role
    const getDefaultRoute = () => {
        if (!effectiveRole) return '/';
        return getDefaultRouteForRole(effectiveRole);
    };

    // Handle logout click
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
            closeMobileMenu();

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
                return t('roles.admin') || 'Admin';
            case 'doctor':
                return t('roles.doctor') || 'Doctor';
            case 'secretary':
                return t('roles.secretary') || 'Secretary';
            case 'nurse':
                return t('roles.nurse') || 'Nurse';
            case 'lab':
                return t('roles.lab') || 'Laboratory';
            case 'x ray':
            case 'xray':
                return t('roles.xray') || 'X-Ray';
            case 'patient':
                return t('roles.patient') || 'Patient';
            default:
                return role || 'User';
        }
    };

    // Function to get dashboard navigation text
    const getDashboardText = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return t('navbar.adminDashboard') || 'Admin Dashboard';
            case 'secretary':
                return t('navbar.secretaryDashboard') || 'Secretary Dashboard';
            default:
                return t('navbar.dashboard') || 'Dashboard';
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

    return (
        <header className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200/60 z-50" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Far Left: Logo and clinic name */}
                    <div className="flex items-center">
                        <Link
                            to="/"
                            className="flex items-center gap-3 group transition-all duration-200 hover:scale-105"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/');
                            }}
                        >

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
                                    {t('common.clinicName') || 'Bethlehem Med Center'}
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Center-Left: Navigation */}
                    <nav className="hidden lg:flex items-center gap-1 ml-8">
                        {canViewHome && (
                            <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                                <Link to="/" className="font-medium">{t('navbar.home') || 'Home'}</Link>
                            </Button>
                        )}
                        {canViewClinics && (
                            <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                                <Link to="/clinics" className="font-medium">{t('navbar.clinics') || 'Clinics'}</Link>
                            </Button>
                        )}
                        {canViewAboutUs && (
                            <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                                <Link to="/about" className="font-medium">{t('navbar.aboutUs') || 'About Us'}</Link>
                            </Button>
                        )}
                        {canViewLabs && !isDoctor && (
                            <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                                <Link to="/labs" className="font-medium">{t('navbar.labs') || 'Labs'}</Link>
                            </Button>
                        )}
                        {canViewDoctorLabs && (
                            <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                                <Link to="/doctor/labs" className="font-medium">{t('navbar.doctorLabs') || 'Lab Results'}</Link>
                            </Button>
                        )}
                        {canViewXray && !isDoctor && (
                            <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                                <Link to="/xray" className="font-medium">{t('navbar.xray') || 'X-Ray'}</Link>
                            </Button>
                        )}
                        {canViewDoctorXray && (
                            <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                                <Link to="/doctor/xray" className="font-medium">{t('navbar.doctorXRay') || 'X-Ray Images'}</Link>
                            </Button>
                        )}
                        {canViewAdmin && (
                            <Button variant="ghost" size="sm" asChild className={`transition-colors duration-200 ${isAdmin ? 'hover:bg-red-50 hover:text-red-700' : 'hover:bg-purple-50 hover:text-purple-700'}`}>
                                <Link to="/admin" className="font-medium">
                                    {getDashboardText(effectiveRole || '')}
                                </Link>
                            </Button>
                        )}
                    </nav>

                    {/* Right section: Language switcher, Role badge, and Auth button */}
                    <div className="flex items-center gap-4">
                        {/* Language switcher */}
                        <div className="hidden sm:block">
                            <LanguageSwitcher />
                        </div>

                        {/* Desktop Role Badge and Auth Button */}
                        <div className="hidden lg:flex items-center gap-3">
                            {effectiveRole && isAuthenticated && (
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border transition-all duration-200 hover:shadow-md ${getRoleBadgeClass(effectiveRole)}`}>
                                    {getRoleDisplayName(effectiveRole)}
                                </span>
                            )}

                            {isAuthenticated ? (
                                <>
                                    {canChangePassword && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsPasswordModalOpen(true)}
                                            className="font-medium hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all duration-200"
                                        >
                                            <Key className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                            {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="font-medium hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all duration-200"
                                    >
                                        {t('common.logout') || 'Logout'}
                                    </Button>
                                </>
                            ) : (
                                <Button variant="default" size="sm" asChild className="font-medium bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                                    <Link to="/auth">{t('common.login') || 'Login'}</Link>
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
                                onClick={toggleMobileMenu}
                                aria-label={isMobileMenuOpen ? (t('header.closeMenu') || 'Close Menu') : (t('header.toggleMenu') || 'Toggle Menu')}
                                aria-expanded={isMobileMenuOpen}
                                className="p-2 hover:bg-gray-100 transition-colors duration-200"
                                data-mobile-menu
                            >
                                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {isAuthenticated && user && (
                <PasswordChangeModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => {
                        console.log('PasswordChangeModal onClose triggered in Header');
                        setIsPasswordModalOpen(false);
                    }}
                    userEmail={user.email || ''}
                    userName={user.name || ''}
                />
            )}

            {/* Mobile Menu Overlay */}
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
                            onClick={closeMobileMenu}
                            data-mobile-menu
                        />

                        {/* Mobile Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-xl lg:hidden z-50"
                            dir={isRTL ? 'rtl' : 'ltr'}
                            data-mobile-menu
                        >
                            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                                <nav className="flex flex-col py-4 space-y-1">
                                    {/* Show restricted access message for lab and x-ray users */}
                                    {(isLab || isXRay) && (
                                        <div className="px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded-md border mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${(effectiveRole)}`}></div>
                                                <span>
                                                    Restricted Access: {isLab ? (t('navbar.labs') || 'Labs') : (t('navbar.xray') || 'X-Ray')} only
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {canViewHome && (
                                        <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200`}>
                                            <Link
                                                to="/"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleMobileNavigation('/');
                                                }}
                                                className="font-medium"
                                            >
                                                {t('navbar.home') || 'Home'}
                                            </Link>
                                        </Button>
                                    )}
                                    {canViewClinics && (
                                        <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200`}>
                                            <Link
                                                to="/clinics"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleMobileNavigation('/clinics');
                                                }}
                                                className="font-medium"
                                            >
                                                {t('navbar.clinics') || 'Clinics'}
                                            </Link>
                                        </Button>
                                    )}
                                    {canViewAboutUs && (
                                        <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200`}>
                                            <Link
                                                to="/about"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleMobileNavigation('/about');
                                                }}
                                                className="font-medium"
                                            >
                                                {t('navbar.aboutUs') || 'About Us'}
                                            </Link>
                                        </Button>
                                    )}
                                    {canViewLabs && !isDoctor && (
                                        <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200`}>
                                            <Link
                                                to="/labs"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleMobileNavigation('/labs');
                                                }}
                                                className="font-medium"
                                            >
                                                {t('navbar.labs') || 'Labs'}
                                            </Link>
                                        </Button>
                                    )}
                                    {canViewDoctorLabs && (
                                        <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200`}>
                                            <Link
                                                to="/doctor/labs"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleMobileNavigation('/doctor/labs');
                                                }}
                                                className="font-medium"
                                            >
                                                {t('navbar.doctorLabs') || 'Lab Results'}
                                            </Link>
                                        </Button>
                                    )}
                                    {canViewXray && !isDoctor && (
                                        <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200`}>
                                            <Link
                                                to="/xray"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleMobileNavigation('/xray');
                                                }}
                                                className="font-medium"
                                            >
                                                {t('navbar.xray') || 'X-Ray'}
                                            </Link>
                                        </Button>
                                    )}
                                    {canViewDoctorXray && (
                                        <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200`}>
                                            <Link
                                                to="/doctor/xray"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleMobileNavigation('/doctor/xray');
                                                }}
                                                className="font-medium"
                                            >
                                                {t('navbar.doctorXRay') || 'X-Ray Images'}
                                            </Link>
                                        </Button>
                                    )}
                                    {canViewAdmin && (
                                        <Button variant="ghost" asChild className={`${isRTL ? 'text-right' : 'text-left'} justify-start transition-colors duration-200 ${isAdmin ? 'hover:bg-red-50 hover:text-red-700' : 'hover:bg-purple-50 hover:text-purple-700'}`}>
                                            <Link
                                                to="/admin"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleMobileNavigation('/admin');
                                                }}
                                                className="font-medium"
                                            >
                                                {getDashboardText(effectiveRole || '')}
                                            </Link>
                                        </Button>
                                    )}
                                    {isAuthenticated && canChangePassword && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setIsPasswordModalOpen(true);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={`${isRTL ? 'text-right' : 'text-left'} justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Key className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                <span className="font-medium">
                                                    {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                                                </span>
                                            </div>
                                        </Button>
                                    )}
                                    {isAuthenticated && (
                                        <Button
                                            variant="ghost"
                                            onClick={handleLogout}
                                            className={`${isRTL ? 'text-right' : 'text-left'} justify-start text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200`}
                                        >
                                            <span className="font-medium">{t('common.logout') || 'Logout'}</span>
                                        </Button>
                                    )}
                                </nav>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}