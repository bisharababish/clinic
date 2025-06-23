// hooks/useIsomorphicLayoutEffect.js
import React from "react";

// Always use useEffect during SSR/static export to avoid React warnings
const isDOM = typeof window !== "undefined" && typeof document !== "undefined";

// Safely access React hooks with fallback
const useIsomorphicLayoutEffect = isDOM && React.useLayoutEffect ? React.useLayoutEffect : React.useEffect;

if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(
        `[useIsomorphicLayoutEffect] Using: ${isDOM && React.useLayoutEffect ? "useLayoutEffect" : "useEffect"}`
    );
}

export default useIsomorphicLayoutEffect