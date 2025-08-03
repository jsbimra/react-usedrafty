import { useEffect, useRef, useState } from "react";

/**
 * 🧠 useDrafty Hook
 *
 * Purpose:
 * - Automatically saves user-filled form data (draft) in the browser
 * - Warns users before leaving if they’ve made changes
 * - Allows restoring form state when user returns (like Gmail drafts)
 *
 * Why it's useful:
 * - Prevents user frustration from accidental tab closures or reloads
 * - Makes long or multi-step forms more forgiving
 * - Improves UX with minimal developer setup
 *
 * Why it's unique:
 * - Framework-agnostic design for React
 * - Works with either localStorage or sessionStorage
 * - Includes smart “isDirty” tracking
 * - Zero dependencies, plug-and-play
 * - Built with indie creators and teams in mind
 *
 * Author's goal:
 * - To make form-saving as easy as typing a few lines
 * - To encourage safer data collection in modern UIs
 * - To open-source it for use in multiple real-world projects and products
 */

export type UseDraftyOptions<T> = {
  useSession?: boolean; // Use sessionStorage instead of localStorage
  debounce?: number; // Debounce duration for saving, in ms (e.g. 500)
  warnOnLeave?: boolean | string | (() => boolean | string); // Message or condition before leaving
  onRestore?: (restoredDraft: T) => void; // Optional callback when restoring a draft
};

export type UseDraftyResult<T> = {
  saveDraft: () => void;
  clearDraft: () => void;
  hasDraft: boolean;
  isDirty: boolean;
};

/**
 * 🪄 useDrafty Hook Implementation
 */
function useDrafty<T>(
  storageKey: string,
  currentFormState: T,
  updateFormState: (data: T) => void,
  options?: UseDraftyOptions<T>
): UseDraftyResult<T> {
  const {
    useSession = false,
    debounce = 0,
    warnOnLeave = false,
    onRestore,
  } = options || {};

  const storage = useSession ? sessionStorage : localStorage;
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [hasDraft, setHasDraft] = useState(false);
  const [initialDraft, setInitialDraft] = useState<T | null>(null);

  /**
   * Load draft from storage (if exists) and restore it into form state
   */
  useEffect(() => {
    try {
      const saved = storage.getItem(storageKey);
      if (saved) {
        const parsedDraft: T = JSON.parse(saved);
        updateFormState(parsedDraft);
        setInitialDraft(parsedDraft);
        setHasDraft(true);
        if (onRestore) onRestore(parsedDraft);
      }
    } catch (e) {
      console.warn("[useDrafty] Unable to load saved draft:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  /**
   * Save draft to storage whenever form data changes
   */
  useEffect(() => {
    if (debounce > 0) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        saveDraft();
      }, debounce);
    } else {
      saveDraft();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFormState]);

  /**
   * Warn users before leaving the page if form is dirty
   */
  useEffect(() => {
    if (!warnOnLeave) return;

    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      const shouldWarn =
        typeof warnOnLeave === "function"
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
    } catch (e) {
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
    } catch (e) {
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