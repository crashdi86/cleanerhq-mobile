/**
 * M-13 S5: Entitlement exceeded modal.
 * Shown when workspace plan limit is reached.
 */

import React from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";

interface EntitlementExceededModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EntitlementExceededModal({
  visible,
  onClose,
}: EntitlementExceededModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Close button */}
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
            <FontAwesomeIcon icon={faXmark} size={20} color="#6B7280" />
          </Pressable>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <FontAwesomeIcon
              icon={faCircleExclamation}
              size={40}
              color="#F59E0B"
            />
          </View>

          {/* Content */}
          <Text style={styles.title}>Plan Limit Reached</Text>
          <Text style={styles.description}>
            You've reached the calculator run limit for your current plan.
            Upgrade to continue generating estimates.
          </Text>

          {/* Action buttons */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.upgradeButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.upgradeText}>Upgrade Plan</Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={styles.laterButton}
          >
            <Text style={styles.laterText}>Maybe Later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    fontFamily: "PlusJakartaSans",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: "PlusJakartaSans",
  },
  upgradeButton: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2A5B4F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  upgradeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "PlusJakartaSans",
  },
  laterButton: {
    paddingVertical: 12,
  },
  laterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    fontFamily: "PlusJakartaSans",
  },
});
