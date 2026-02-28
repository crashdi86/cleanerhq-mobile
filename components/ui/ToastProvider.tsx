import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore } from "@/store/toast-store";
import { ToastItem } from "./Toast";

export function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top + 8,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: "box-none",
      }}
    >
      {toasts.map((toast, index) => (
        <ToastItem key={toast.id} toast={toast} index={index} />
      ))}
    </View>
  );
}
