// hooks/useIsomorphicLayoutEffect.js
import { useEffect, useLayoutEffect } from "react";

// Always use useEffect during SSR/static export to avoid React warnings
const isDOM = typeof window !== "undefined" && typeof document !== "undefined";

const useIsomorphicLayoutEffect = isDOM ? useLayoutEffect : useEffect;

if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(
        `[useIsomorphicLayoutEffect] Using: ${isDOM ? "useLayoutEffect" : "useEffect"}`
    );
}

export default useIsomorphicLayoutEffect;