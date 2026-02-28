import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

/**
 * Calls `callback` every time the app transitions from background → active.
 */
export function useAppForeground(callback: () => void) {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        callback();
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [callback]);
}
