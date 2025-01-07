// WHY: Browser storage needs type-safe wrapper for React integration
// WHAT: Custom hook that provides typed local storage persistence
// NOTE: Handles JSON serialization and error cases automatically

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // WHY: Need to initialize state from storage or fallback value
  // WHAT: Lazy initialization that checks localStorage first
  // NOTE: Wrapped in try-catch to handle storage access errors
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      // WHY: Need to parse stored JSON string back into TypeScript type
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue; // Fallback to initial value on error
    }
  });

  // WHY: Need to keep localStorage in sync with state changes
  // WHAT: Automatically updates localStorage when state changes
  // NOTE: Handles serialization and storage errors gracefully
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
      // Silent failure to avoid disrupting the UI
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
