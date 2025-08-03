import { useEffect, useRef, useState } from "react";

/**
 * useDrafty
 * Save and restore form drafts with optional navigation blocking.
 *
 * @param {string} storageKey - Unique key for saving form data
 * @param {object} currentFormState - Current form state object
 * @param {function} updateFormState - Setter function to update form state
 * @param {object} options - Optional config
 */
function useDrafty(storageKey, currentFormState, updateFormState, options) {
    const {
        useSession = false,
        debounce = 0,
        warnOnLeave = false,
        onRestore,
        router,
    } = options || {};

    const storage = useSession ? sessionStorage : localStorage;
    const debounceTimer = useRef(null);

    const [hasDraft, setHasDraft] = useState(false);
    const [initialDraft, setInitialDraft] = useState(null);

    // Restore saved draft
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const saved = storage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                updateFormState(parsed);
                setInitialDraft(parsed);
                setHasDraft(true);
                if (onRestore) onRestore(parsed);
                console.info(`[useDrafty] Draft restored for key "${storageKey}"`);
            }
        } catch (e) {
            console.warn("[useDrafty] Failed to load saved draft:", e);
        }
    }, [storageKey]);

    // Auto-save with debounce
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (debounce > 0) {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                saveDraft();
            }, debounce);
        } else {
            saveDraft();
        }
    }, [currentFormState]);

    // Warn on browser tab close
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!warnOnLeave) return;

        const getMessage = () => {
            const res = typeof warnOnLeave === "function" ? warnOnLeave() : warnOnLeave;
            return typeof res === "string" ? res : "You have unsaved changes.";
        };

        const beforeUnloadHandler = (e) => {
            const message = getMessage();
            e.preventDefault();
            e.returnValue = message;
            return message;
        };

        window.addEventListener("beforeunload", beforeUnloadHandler);
        return () => {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
        };
    }, [warnOnLeave]);

    // Warn on SPA route change if router is provided
    useEffect(() => {
        if (!warnOnLeave) return;
        if (!router) {
            console.info(
                "[useDrafty] No router object provided. SPA navigation warnings will be skipped."
            );
            return;
        }

        const getMessage = () => {
            const res = typeof warnOnLeave === "function" ? warnOnLeave() : warnOnLeave;
            return typeof res === "string" ? res : "You have unsaved changes.";
        };

        let cleanup;

        // Next.js Pages Router style
        if (router.onRouteChangeStart && router.offRouteChangeStart) {
            const handler = () => {
                if (!confirm(getMessage())) {
                    throw "Navigation cancelled by user";
                }
            };
            router.onRouteChangeStart(handler);
            cleanup = () => router.offRouteChangeStart(handler);
            console.info("[useDrafty] SPA navigation blocking active (Next.js Pages Router).");
        }

        // React Router style
        else if (router.block) {
            cleanup = router.block(getMessage());
            console.info("[useDrafty] SPA navigation blocking active (React Router).");
        }

        // Next.js App Router (13+)
        else if (router.prefetch && router.push) {
            console.warn(
                "[useDrafty] Detected Next.js App Router. Use 'router.beforePopState' for blocking."
            );
        }

        // Unknown router
        else {
            console.warn(
                "[useDrafty] Router provided but unsupported methods found. SPA blocking skipped."
            );
        }

        return () => {
            if (typeof cleanup === "function") cleanup();
        };
    }, [warnOnLeave, router]);

    // Save draft
    const saveDraft = () => {
        if (typeof window === "undefined") return;
        try {
            storage.setItem(storageKey, JSON.stringify(currentFormState));
            setHasDraft(true);
        } catch (e) {
            console.warn("[useDrafty] Failed to save draft:", e);
        }
    };

    // Clear draft
    const clearDraft = () => {
        if (typeof window === "undefined") return;
        try {
            storage.removeItem(storageKey);
            setHasDraft(false);
            setInitialDraft(null);
        } catch (e) {
            console.warn("[useDrafty] Failed to clear draft:", e);
        }
    };

    // Dirty check
    const isDirty = JSON.stringify(initialDraft) !== JSON.stringify(currentFormState);

    return { saveDraft, clearDraft, hasDraft, isDirty };
}

export default useDrafty;
export { useDrafty };
