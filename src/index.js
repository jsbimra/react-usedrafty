import { useEffect, useRef, useState } from "react";
/**
 * 🪄 useDrafty Hook Implementation
 */
function useDrafty(storageKey, currentFormState, updateFormState, options) {
    const { useSession = false, debounce = 0, warnOnLeave = false, onRestore, } = options || {};
    const storage = useSession ? sessionStorage : localStorage;
    const debounceTimer = useRef(null);
    const [hasDraft, setHasDraft] = useState(false);
    const [initialDraft, setInitialDraft] = useState(null);
    /**
     * Load draft from storage (if exists) and restore it into form state
     */
    useEffect(() => {
        try {
            const saved = storage.getItem(storageKey);
            if (saved) {
                const parsedDraft = JSON.parse(saved);
                updateFormState(parsedDraft);
                setInitialDraft(parsedDraft);
                setHasDraft(true);
                if (onRestore)
                    onRestore(parsedDraft);
            }
        }
        catch (e) {
            console.warn("[useDrafty] Unable to load saved draft:", e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey]);
    /**
     * Save draft to storage whenever form data changes
     */
    useEffect(() => {
        if (debounce > 0) {
            if (debounceTimer.current)
                clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                saveDraft();
            }, debounce);
        }
        else {
            saveDraft();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentFormState]);
    /**
     * Warn users before leaving the page if form is dirty
     */
    useEffect(() => {
        if (!warnOnLeave)
            return;
        const beforeUnloadHandler = (e) => {
            const shouldWarn = typeof warnOnLeave === "function"
                ? warnOnLeave()
                : warnOnLeave;
            if (shouldWarn) {
                const message = typeof shouldWarn === "string"
                    ? shouldWarn
                    : "You have unsaved changes. Are you sure you want to leave?";
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        };
        window.addEventListener("beforeunload", beforeUnloadHandler);
        return () => {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
        };
    }, [warnOnLeave]);
    /**
     * Save current form data as draft
     */
    const saveDraft = () => {
        try {
            const serialized = JSON.stringify(currentFormState);
            storage.setItem(storageKey, serialized);
            setHasDraft(true);
        }
        catch (e) {
            console.warn("[useDrafty] Failed to save form draft:", e);
        }
    };
    /**
     * Clear saved draft from storage
     */
    const clearDraft = () => {
        try {
            storage.removeItem(storageKey);
            setHasDraft(false);
            setInitialDraft(null);
        }
        catch (e) {
            console.warn("[useDrafty] Failed to clear form draft:", e);
        }
    };
    /**
     * Check if form is dirty (i.e. modified since draft was loaded)
     */
    const isDirty = JSON.stringify(initialDraft) !== JSON.stringify(currentFormState);
    return {
        saveDraft,
        clearDraft,
        hasDraft,
        isDirty,
    };
}
export default useDrafty;
export { useDrafty };
