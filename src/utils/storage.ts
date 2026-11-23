/**
 * Safe storage utility that gracefully handles iframe sandboxes,
 * private browsing restrictions, corrupted JSON, and SecurityErrors.
 */

export const safeGetItem = <T>(key: string, fallback: T): T => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    // If fallback is an array and parsed is empty or not an array, use fallback
    if (Array.isArray(fallback)) {
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return fallback;
      }
    }
    return parsed as T;
  } catch (err) {
    console.warn(`[safeStorage] Error reading key "${key}", using fallback:`, err);
    return fallback;
  }
};

export const safeSetItem = (key: string, value: any): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.warn(`[safeStorage] Error saving key "${key}":`, err);
  }
};

export const safeRemoveItem = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn(`[safeStorage] Error removing key "${key}":`, err);
  }
};
