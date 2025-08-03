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
  clearDraft: (opts?: { submitted?: boolean }) => void;
  hasDraft: boolean;
  isDirty: boolean;
}

function useDrafty<T extends Record<string, any>>(
  storageKey: string,
  currentFormState: T,
  updateFormState: (state: T) => void,
  options?: UseDraftyOptions<T>
): UseDraftyReturn {
  const {
    useSession = false,
    debounce = 300,
    warnOnLeave = false,
    onRestore,
    router,
  } = options || {};

  const storage: Storage = useSession ? sessionStorage : localStorage;
  const submittedFlagKey = `submitted:${storageKey}`;
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRestored = useRef(false);

  const [hasDraft, setHasDraft] = useState(false);
  const [initialDraft, setInitialDraft] = useState<T | null>(null);

  /** Restore saved draft unless marked submitted */
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const wasSubmitted = storage.getItem(submittedFlagKey) === "true";
      if (wasSubmitted) {
        console.info(`[useDrafty] Skipping restore for "${storageKey}" (submitted)`);
        return;
      }

      const saved = storage.getItem(storageKey);
      if (saved) {
        const parsed: T = JSON.parse(saved);
        updateFormState(parsed);
        setInitialDraft(parsed);
        setHasDraft(true);
        onRestore?.(parsed);
        console.info(`[useDrafty] Draft restored for "${storageKey}"`);
      }
    } catch (e) {
      console.warn("[useDrafty] Failed to load saved draft:", e);
    } finally {
      isRestored.current = true;
    }
  }, [storageKey]);

  /** Auto-save with debounce after restore */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isRestored.current) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      saveDraft();
    }, debounce);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [currentFormState, debounce]);

  /** Warn on browser/tab close */
  useEffect(() => {
    if (!warnOnLeave) return;
    const getMessage = () => {
      const res = typeof warnOnLeave === "function" ? warnOnLeave() : warnOnLeave;
      return typeof res === "string" ? res : "You have unsaved changes.";
    };
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      const message = getMessage();
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => window.removeEventListener("beforeunload", beforeUnloadHandler);
  }, [warnOnLeave]);

  /** Auto-clear on SPA navigation if router provided */
  useEffect(() => {
    if (!router) return;
    const clearOnNavigation = () => {
      clearDraft();
      console.info(`[useDrafty] Draft cleared for "${storageKey}" on navigation`);
    };

    // Next.js Pages Router
    if (router.events?.on) {
      router.events.on("routeChangeStart", clearOnNavigation);
      return () => router.events.off("routeChangeStart", clearOnNavigation);
    }

    // React Router
    if (router.block) {
      const unblock = router.block(() => {
        clearOnNavigation();
        return true;
      });
      return unblock;
    }
  }, [router]);

  /** Save draft */
  const saveDraft = () => {
    try {
      storage.setItem(storageKey, JSON.stringify(currentFormState));
      setHasDraft(true);
      storage.removeItem(submittedFlagKey); // If editing again, remove submit flag
    } catch (e) {
      console.warn("[useDrafty] Failed to save draft:", e);
    }
  };

  /** Clear draft (optionally mark submitted) */
  const clearDraft = (opts?: { submitted?: boolean }) => {
    try {
      storage.removeItem(storageKey);
      if (opts?.submitted) {
        storage.setItem(submittedFlagKey, "true");
      } else {
        storage.removeItem(submittedFlagKey);
      }
      setHasDraft(false);
      setInitialDraft(null);
    } catch (e) {
      console.warn("[useDrafty] Failed to clear draft:", e);
    }
  };

  /** Dirty check */
  const isDirty = JSON.stringify(initialDraft) !== JSON.stringify(currentFormState);

  return { saveDraft, clearDraft, hasDraft, isDirty };
}

export default useDrafty;
export { useDrafty };
