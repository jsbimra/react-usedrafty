import { useEffect, useRef, useState } from "react";

export interface UseDraftyOptions<T> {
  useSession?: boolean; // Use sessionStorage instead of localStorage
  debounce?: number; // Debounce time in ms
  warnOnLeave?: boolean | (() => string | boolean); // Warning message or function
  onRestore?: (draft: T) => void; // Callback when draft is restored
  router?: any; // Router object (Next.js, React Router, etc.)
}

export interface UseDraftyReturn {
  saveDraft: () => void;
  clearDraft: () => void;
  hasDraft: boolean;
  isDirty: boolean;
}

/**
 * useDrafty
 * Save and restore form drafts with optional navigation blocking.
 *
 * @param storageKey - Unique key for saving form data
 * @param currentFormState - Current form state object
 * @param updateFormState - Setter function to update form state
 * @param options - Optional config
 */
function useDrafty<T extends Record<string, any>>(
  storageKey: string,
  currentFormState: T,
  updateFormState: (state: T) => void,
  options?: UseDraftyOptions<T>
): UseDraftyReturn {
  const {
    useSession = false,
    debounce = 0,
    warnOnLeave = false,
    onRestore,
    router,
  } = options || {};

  const storage: Storage = useSession ? sessionStorage : localStorage;
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [hasDraft, setHasDraft] = useState(false);
  const [initialDraft, setInitialDraft] = useState<T | null>(null);

  // Restore saved draft
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = storage.getItem(storageKey);
      if (saved) {
        const parsed: T = JSON.parse(saved);
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
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      saveDraft();
    }, debounce || 300); // fallback to small delay

    console.log("debounceTime Fix Update!");

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [currentFormState, debounce]);

  // Warn on browser tab close
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!warnOnLeave) return;

    const getMessage = () => {
      const res =
        typeof warnOnLeave === "function" ? warnOnLeave() : warnOnLeave;
      return typeof res === "string" ? res : "You have unsaved changes.";
    };

    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
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
      const res =
        typeof warnOnLeave === "function" ? warnOnLeave() : warnOnLeave;
      return typeof res === "string" ? res : "You have unsaved changes.";
    };

    let cleanup: (() => void) | undefined;

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
  const isDirty =
    JSON.stringify(initialDraft) !== JSON.stringify(currentFormState);

  return { saveDraft, clearDraft, hasDraft, isDirty };
}

export default useDrafty;
export { useDrafty };
