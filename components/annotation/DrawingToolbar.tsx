import React, { useState, useCallback } from "react";
import { StyleSheet } from "react-native";
import { View, Pressable, Text } from "@/tw";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faArrowRight,
  faCircle,
  faFont,
  faRotateLeft,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { AnnotationTool } from "./AnnotationCanvas";

// ── Types ──

interface DrawingToolbarProps {
  activeTool: AnnotationTool;
  activeColor: string;
  onToolChange: (tool: AnnotationTool) => void;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
  annotationCount: number;
}

// ── Constants ──

const TOOL_OPTIONS = [
  { tool: "arrow" as const, icon: faArrowRight, label: "Arrow" },
  { tool: "circle" as const, icon: faCircle, label: "Circle" },
  { tool: "text" as const, icon: faFont, label: "Text" },
] as const;

const COLOR_OPTIONS = [
  { color: "#EF4444", label: "Red" },
  { color: "#F59E0B", label: "Yellow" },
  { color: "#FFFFFF", label: "White" },
  { color: "#3B82F6", label: "Blue" },
] as const;

// ── Component ──

export function DrawingToolbar({
  activeTool,
  activeColor,
  onToolChange,
  onColorChange,
  onUndo,
  onClear,
  canUndo,
  annotationCount,
}: DrawingToolbarProps) {
  const insets = useSafeAreaInsets();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleClearPress = useCallback(() => {
    if (annotationCount > 0) {
      setShowClearDialog(true);
    }
  }, [annotationCount]);

  const handleClearConfirm = useCallback(() => {
    onClear();
    setShowClearDialog(false);
  }, [onClear]);

  const handleClearCancel = useCallback(() => {
    setShowClearDialog(false);
  }, []);

  return (
    <>
      <View
        className="px-4 py-3"
        style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}
      >
        {/* Top row: Tool buttons + Action buttons */}
        <View className="flex-row items-center justify-between mb-3">
          {/* Tool buttons */}
          <View className="flex-row items-center gap-2">
            {TOOL_OPTIONS.map((option) => {
              const isActive = activeTool === option.tool;
              return (
                <Pressable
                  key={option.tool}
                  onPress={() => onToolChange(option.tool)}
                  className={`w-11 h-11 rounded-xl items-center justify-center ${
                    isActive ? "bg-[#B7F0AD]" : "bg-gray-800"
                  }`}
                  accessibilityLabel={option.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <FontAwesomeIcon
                    icon={option.icon}
                    size={18}
                    color={isActive ? "#1F2937" : "#D1D5DB"}
                  />
                </Pressable>
              );
            })}
          </View>

          {/* Action buttons */}
          <View className="flex-row items-center gap-3">
            {/* Undo */}
            <Pressable
              onPress={onUndo}
              disabled={!canUndo}
              className="w-11 h-11 items-center justify-center"
              style={!canUndo ? styles.disabled : undefined}
              accessibilityLabel="Undo"
              accessibilityRole="button"
            >
              <FontAwesomeIcon
                icon={faRotateLeft}
                size={20}
                color="#FFFFFF"
              />
            </Pressable>

            {/* Clear */}
            <Pressable
              onPress={handleClearPress}
              disabled={annotationCount === 0}
              className="w-11 h-11 items-center justify-center"
              style={annotationCount === 0 ? styles.disabled : undefined}
              accessibilityLabel="Clear all annotations"
              accessibilityRole="button"
            >
              <FontAwesomeIcon
                icon={faTrashCan}
                size={20}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>

        {/* Bottom row: Color picker */}
        <View className="flex-row items-center gap-3">
          {COLOR_OPTIONS.map((option) => {
            const isActive = activeColor === option.color;
            return (
              <Pressable
                key={option.color}
                onPress={() => onColorChange(option.color)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: option.color },
                  isActive ? styles.colorActive : styles.colorInactive,
                  option.color === "#FFFFFF" && !isActive
                    ? styles.whiteInactiveBorder
                    : undefined,
                ]}
                accessibilityLabel={`${option.label} color`}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              />
            );
          })}

          {/* Annotation count badge */}
          {annotationCount > 0 ? (
            <View className="ml-auto px-2 py-1 rounded-lg bg-white/10">
              <Text className="text-xs font-bold text-white/70">
                {annotationCount}/20
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Clear confirmation dialog */}
      <ConfirmDialog
        visible={showClearDialog}
        title="Clear All Annotations"
        message="Are you sure you want to remove all annotations? This cannot be undone."
        confirmLabel="Clear All"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleClearConfirm}
        onCancel={handleClearCancel}
      />
    </>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  disabled: {
    opacity: 0.3,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
  colorActive: {
    borderColor: "#FFFFFF",
    transform: [{ scale: 1.1 }],
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  colorInactive: {
    borderColor: "transparent",
    opacity: 0.7,
  },
  whiteInactiveBorder: {
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
});
