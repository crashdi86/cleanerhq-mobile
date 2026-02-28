import { Modal, ActivityIndicator, StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  loading = false,
  children,
}: ConfirmDialogProps) {
  const isDestructive = variant === "destructive";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center bg-black/40">
        <View
          className="w-[85%] max-w-[340px] bg-white p-6"
          style={styles.card}
        >
          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            {title}
          </Text>

          {message ? (
            <Text className="text-sm text-gray-500 text-center mb-4">
              {message}
            </Text>
          ) : null}

          {children}

          <View className="flex-row gap-3 mt-4">
            <Pressable
              className="flex-1 items-center justify-center py-3.5 rounded-xl bg-gray-100"
              onPress={onCancel}
              disabled={loading}
            >
              <Text className="text-base font-bold text-gray-600">
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              className={`flex-1 items-center justify-center py-3.5 rounded-xl ${
                isDestructive ? "bg-red-500" : "bg-primary"
              }`}
              onPress={onConfirm}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-base font-bold text-white">
                  {confirmLabel}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 24,
  },
});
