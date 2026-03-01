import { useEffect, useRef, useState, useCallback } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

/**
 * M-12 S4: Smart polling interval for chat messages.
 *
 * Returns a `refetchInterval` value for React Query:
 * - Thread focused + app active: 3,000ms  (near-real-time)
 * - Thread unfocused, app active: 15,000ms (background refresh)
 * - App backgrounded: `false` (polling stopped)
 */
export function useChatPolling(): number | false {
  const [isFocused, setIsFocused] = useState(true);
  const [isAppActive, setIsAppActive] = useState(
    AppState.currentState === "active",
  );
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Track screen focus (thread visible vs navigated away)
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  // Track app foreground/background
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      appStateRef.current = nextState;
      setIsAppActive(nextState === "active");
    });
    return () => subscription.remove();
  }, []);

  // Determine polling interval
  if (!isAppActive) {
    return false; // Stop polling when app is backgrounded
  }

  if (isFocused) {
    return 3_000; // Fast polling when thread is visible
  }

  return 15_000; // Slow polling when navigated to another screen
}
