import { useEffect, useLayoutEffect } from 'react';

// Check if we're in a browser environment
const canUseDOM = typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement !== 'undefined';

// Use useLayoutEffect on client, useEffect on server
export const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;