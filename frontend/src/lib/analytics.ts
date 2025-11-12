// Google Analytics utility functions
type GtagParams = Record<string, unknown>;

type GtagFunction = (command: 'config' | 'event', targetIdOrEventName: string, params?: GtagParams) => void;

declare global {
    interface Window {
        gtag: GtagFunction;
    }
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', 'G-0MEDJS1EZ1', {
            page_title: title,
            page_location: url,
        });
    }
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: GtagParams) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, parameters);
    }
};

// Track user login
export const trackLogin = (method: string) => {
    trackEvent('login', {
        method: method,
    });
};

// Track user logout
export const trackLogout = () => {
    trackEvent('logout');
};

// Track form submissions
export const trackFormSubmit = (formName: string) => {
    trackEvent('form_submit', {
        form_name: formName,
    });
};

// Track appointment bookings
export const trackAppointmentBooking = (appointmentType: string) => {
    trackEvent('appointment_booking', {
        appointment_type: appointmentType,
    });
};

// Track lab result submissions
export const trackLabResultSubmission = (patientId: string) => {
    trackEvent('lab_result_submission', {
        patient_id: patientId,
    });
};

// Track X-ray uploads
export const trackXrayUpload = (patientId: string) => {
    trackEvent('xray_upload', {
        patient_id: patientId,
    });
};

// Track payment completion
export const trackPayment = (amount: number, currency: string = 'USD') => {
    trackEvent('purchase', {
        currency: currency,
        value: amount,
    });
};

// Track search queries
export const trackSearch = (searchTerm: string) => {
    trackEvent('search', {
        search_term: searchTerm,
    });
};

// Track user role interactions
export const trackUserRoleAction = (role: string, action: string) => {
    trackEvent('user_role_action', {
        user_role: role,
        action: action,
    });
};

// Set user properties
export const setUserProperties = (properties: GtagParams) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', 'G-0MEDJS1EZ1', {
            user_properties: properties,
        });
    }
};

export default {
    trackPageView,
    trackEvent,
    trackLogin,
    trackLogout,
    trackFormSubmit,
    trackAppointmentBooking,
    trackLabResultSubmission,
    trackXrayUpload,
    trackPayment,
    trackSearch,
    trackUserRoleAction,
    setUserProperties,
};
