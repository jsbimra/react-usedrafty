
import { useCallback, useEffect } from "react";

export default function useDrafty<T>(
  key: string,
  data: T,
  setData: (data: T) => void,
  useSession = false
) {
  const storage = useSession ? sessionStorage : localStorage;

  const saveDraft = useCallback(() => {
    try {
      storage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save draft:", e);
    }
  }, [key, data]);

  const clearDraft = useCallback(() => {
    storage.removeItem(key);
  }, [key]);

  useEffect(() => {
    const stored = storage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed);
      } catch (e) {
        console.warn("Failed to parse draft:", e);
      }
    }
  }, [key]);

  return { saveDraft, clearDraft };
}
