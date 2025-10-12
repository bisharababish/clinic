import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
    const location = useLocation();

    useEffect(() => {
        // Scroll to top whenever the route changes
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }, [location.pathname]);
};

// Hook for scroll to top on button clicks
export const useScrollToTopOnClick = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    };

    return scrollToTop;
};
