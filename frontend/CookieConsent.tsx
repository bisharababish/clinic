import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLegalModals, PrivacyPolicyModal } from '../src/components/modals/LegalModals'; // adjust path as needed

const CookieConsent = () => {
    const { t } = useTranslation();
    const [showBanner, setShowBanner] = useState(false);
    const { privacyOpen, openPrivacy, closePrivacy } = useLegalModals();

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setShowBanner(false);
    };

    const declineCookies = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="text-sm">
                        {t('cookies.message') || 'We use cookies to improve your experience. By continuing to use our site, you agree to our use of cookies.'}{' '}
                        <button
                            onClick={openPrivacy}
                            className="underline hover:text-blue-300 transition-colors"
                        >
                            {t('cookies.privacyPolicy') || 'View our Privacy Policy'}
                        </button>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={declineCookies}
                        className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800"
                    >
                        {t('cookies.decline') || 'Decline'}
                    </button>
                    <button
                        onClick={acceptCookies}
                        className="px-4 py-2 text-sm bg-blue-600 rounded hover:bg-blue-700"
                    >
                        {t('cookies.accept') || 'Accept'}
                    </button>
                </div>
            </div>
            <PrivacyPolicyModal isOpen={privacyOpen} onClose={closePrivacy} />

        </div>
    );
};

export default CookieConsent;
