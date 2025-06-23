// hooks/useIsomorphicLayoutEffect.js
import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect =
    typeof window !== "undefined" && typeof useLayoutEffect !== "undefined"
        ? useLayoutEffect
        : useEffect;

export default useIsomorphicLayoutEffect;