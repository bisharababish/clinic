// hooks/useIsomorphicLayoutEffect.ts
import { useEffect, useLayoutEffect } from "react";

// Check if we're in a browser environment
const canUseDOM = !!(
    typeof window !== "undefined" &&
    typeof window.document !== "undefined" &&
    typeof window.document.createElement !== "undefined"
);

// Use useLayoutEffect only in browser, useEffect on server/SSR
const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;