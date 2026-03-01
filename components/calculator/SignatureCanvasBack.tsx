/**
 * M-13 S6: Back face of the flip card — signature canvas placeholder.
 * Full UI shell ready; actual signature capture deferred to M-14-S4.
 */

import React, { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCircleCheck,
  faTrashCan,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";

interface SignatureCanvasBackProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function SignatureCanvasBack({
  onConfirm,
  onCancel,
}: SignatureCanvasBackProps) {
  const [hasSignature, setHasSignature] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const successScale = useSharedValue(0);

  const handleConfirm = () => {
    setIsSuccess(true);
    successScale.value = withSpring(1, { damping: 4, stiffness: 300 });
    setTimeout(onConfirm, 1200);
  };

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  if (isSuccess) {
    return (
      <View style={[styles.card, styles.cardSuccess]}>
        <Animated.View style={[styles.successContainer, successAnimatedStyle]}>
          <FontAwesomeIcon
            icon={faCircleCheck}
            size={64}
            color="#B7F0AD"
          />
          <Text style={styles.successText}>Quote Accepted!</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Sign to Accept</Text>

      {/* Signature canvas area (placeholder) */}
      <Pressable
        onPress={() => setHasSignature(true)}
        style={styles.canvasArea}
      >
        {!hasSignature && (
          <Text style={styles.placeholderText}>
            Tap to simulate signature{"\n"}(Full canvas in M-14)
          </Text>
        )}
        {hasSignature && (
          <View style={styles.signaturePlaceholder}>
            <Text style={styles.signatureSimulated}>
              ✍️ Signature captured
            </Text>
          </View>
        )}
      </Pressable>

      {/* Canvas controls */}
      <View style={styles.controlsRow}>
        <Pressable
          onPress={() => setHasSignature(false)}
          style={styles.controlButton}
        >
          <FontAwesomeIcon
            icon={faTrashCan}
            size={14}
            color="#EF4444"
          />
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>

        <Pressable
          onPress={onCancel}
          style={styles.controlButton}
        >
          <FontAwesomeIcon
            icon={faRotateLeft}
            size={14}
            color="#6B7280"
          />
          <Text style={styles.undoText}>Back</Text>
        </Pressable>
      </View>

      {/* Confirm button */}
      <Pressable
        onPress={handleConfirm}
        disabled={!hasSignature}
        style={[
          styles.confirmButton,
          !hasSignature && styles.confirmButtonDisabled,
        ]}
      >
        <Text style={styles.confirmButtonText}>Confirm Signature</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 400,
  },
  cardSuccess: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "PlusJakartaSans",
  },
  canvasArea: {
    height: 192,
    backgroundColor: "#F8FAF9",
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "PlusJakartaSans",
  },
  signaturePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  signatureSimulated: {
    fontSize: 16,
    color: "#2A5B4F",
    fontWeight: "500",
    fontFamily: "PlusJakartaSans",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#EF4444",
    fontFamily: "PlusJakartaSans",
  },
  undoText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    fontFamily: "PlusJakartaSans",
  },
  confirmButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#2A5B4F",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "PlusJakartaSans",
  },
  successContainer: {
    alignItems: "center",
    gap: 16,
  },
  successText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
  },
});
