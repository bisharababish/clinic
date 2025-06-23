// src/ssr-polyfill.js
if (typeof window === "undefined" && typeof global !== "undefined") {
    // Patch React before any imports
    const originalRequire = global.require;
    global.require = function (id) {
        const module = originalRequire.apply(this, arguments);

        if (id === 'react') {
            // Patch useLayoutEffect if it doesn't exist
            if (!module.useLayoutEffect && module.useEffect) {
                module.useLayoutEffect = module.useEffect;
            }
        }

        return module;
    };
}