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
    useSession?: boolean;
    debounce?: number;
    warnOnLeave?: boolean | string | (() => boolean | string);
    onRestore?: (restoredDraft: T) => void;
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
declare function useDrafty<T>(storageKey: string, currentFormState: T, updateFormState: (data: T) => void, options?: UseDraftyOptions<T>): UseDraftyResult<T>;
export default useDrafty;
export { useDrafty };
