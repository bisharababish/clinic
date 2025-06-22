// polyfills.ts - Import this before React in main.tsx
import React from 'react';

// Global React availability fix for vendor bundles
declare global {
    interface Window {
        React: typeof React;
    }
}

// Ensure React is available globally
if (typeof window !== 'undefined') {
    window.React = React;
}

// For Node.js environments (SSR)
if (typeof global !== 'undefined') {
    global.React = React;
}

// Fallback for useLayoutEffect in environments where it's not available
if (typeof React.useLayoutEffect === 'undefined') {
    React.useLayoutEffect = React.useEffect;
}