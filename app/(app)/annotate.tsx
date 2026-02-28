import React, { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  View as RNView,
} from "react-native";
import { View, Text, Pressable, TextInput } from "@/tw";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { captureRef } from "react-native-view-shot";

import {
  AnnotationCanvas,
  type Annotation,
  type AnnotationTool,
  type TextAnnotation,
} from "@/components/annotation/AnnotationCanvas";
import { DrawingToolbar } from "@/components/annotation/DrawingToolbar";
import { usePhotoStagingStore } from "@/store/photo-staging-store";
import { showToast } from "@/store/toast-store";

// ── Types ──

interface TextInputPosition {
  x: number;
  y: number;
}

// ── Component ──

export default function AnnotateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ photoUri: string; localId: string }>();

  const photoUri = params.photoUri
    ? decodeURIComponent(params.photoUri)
    : "";
  const localId = params.localId ?? "";

  const updatePhotoUri = usePhotoStagingStore((s) => s.updatePhotoUri);
  const canvasRef = useRef<RNView>(null);

  // ── State ──
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeTool, setActiveTool] = useState<AnnotationTool>("arrow");
  const [activeColor, setActiveColor] = useState("#EF4444");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputPosition, setTextInputPosition] =
    useState<TextInputPosition | null>(null);
  const [textValue, setTextValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ── Annotation Management ──

  const handleAnnotationAdd = useCallback((annotation: Annotation) => {
    setAnnotations((prev) => [...prev, annotation]);
  }, []);

  const handleTextRequest = useCallback((x: number, y: number) => {
    setTextInputPosition({ x, y });
    setTextValue("");
    setShowTextInput(true);
  }, []);

  const handleTextSubmit = useCallback(() => {
    if (!textValue.trim() || !textInputPosition) {
      setShowTextInput(false);
      setTextInputPosition(null);
      setTextValue("");
      return;
    }

    const textAnnotation: TextAnnotation = {
      id: `anno_${Date.now()}_text`,
      type: "text" as const,
      color: activeColor,
      x: textInputPosition.x,
      y: textInputPosition.y,
      text: textValue.trim(),
    };

    handleAnnotationAdd(textAnnotation);
    setShowTextInput(false);
    setTextInputPosition(null);
    setTextValue("");
  }, [textValue, textInputPosition, activeColor, handleAnnotationAdd]);

  const handleTextCancel = useCallback(() => {
    setShowTextInput(false);
    setTextInputPosition(null);
    setTextValue("");
  }, []);

  const handleUndo = useCallback(() => {
    setAnnotations((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setAnnotations([]);
  }, []);

  // ── Navigation ──

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleDone = useCallback(async () => {
    if (annotations.length === 0) {
      router.back();
      return;
    }

    if (!canvasRef.current) {
      showToast("error", "Unable to capture annotated image");
      return;
    }

    setIsSaving(true);

    try {
      const uri = await captureRef(canvasRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      updatePhotoUri(localId, uri);
      showToast("success", "Annotations saved");
      router.back();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to save annotations";
      showToast("error", message);
    } finally {
      setIsSaving(false);
    }
  }, [annotations.length, localId, router, updatePhotoUri]);

  // ── Guard ──

  if (!photoUri) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-lg">No photo provided</Text>
      </View>
    );
  }

  // ── Render ──

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        {/* Close button */}
        <Pressable
          onPress={handleClose}
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={styles.headerButton}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <FontAwesomeIcon icon={faXmark} size={20} color="#FFFFFF" />
        </Pressable>

        {/* Title */}
        <Text className="text-lg font-bold text-white">Annotate Photo</Text>

        {/* Done button */}
        <Pressable
          onPress={handleDone}
          disabled={isSaving}
          className="px-4 py-2 rounded-xl"
          style={[styles.doneButton, isSaving ? styles.doneDisabled : undefined]}
          accessibilityLabel="Done"
          accessibilityRole="button"
        >
          <Text className="text-sm font-bold" style={styles.doneText}>
            {isSaving ? "Saving..." : "Done"}
          </Text>
        </Pressable>
      </View>

      {/* Canvas area */}
      <View className="flex-1">
        <AnnotationCanvas
          photoUri={photoUri}
          annotations={annotations}
          activeTool={activeTool}
          activeColor={activeColor}
          onAnnotationAdd={handleAnnotationAdd}
          onTextRequest={handleTextRequest}
          canvasRef={canvasRef}
        />
      </View>

      {/* Toolbar */}
      <DrawingToolbar
        activeTool={activeTool}
        activeColor={activeColor}
        onToolChange={setActiveTool}
        onColorChange={setActiveColor}
        onUndo={handleUndo}
        onClear={handleClear}
        canUndo={annotations.length > 0}
        annotationCount={annotations.length}
      />

      {/* Text Input Modal */}
      <Modal
        visible={showTextInput}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleTextCancel}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <Pressable
            className="flex-1 items-center justify-center bg-black/60"
            onPress={handleTextCancel}
          >
            <Pressable
              onPress={() => {
                /* prevent dismiss when tapping the input area */
              }}
              className="w-[85%] max-w-[340px] bg-gray-900 rounded-2xl p-5"
              style={styles.textInputCard}
            >
              <Text className="text-base font-bold text-white mb-3">
                Add Text Annotation
              </Text>

              <TextInput
                className="bg-gray-800 rounded-xl px-4 py-3 text-sm text-white mb-4"
                style={styles.textInputField}
                placeholder="Enter annotation text..."
                placeholderTextColor="#9CA3AF"
                value={textValue}
                onChangeText={setTextValue}
                autoFocus
                maxLength={100}
                returnKeyType="done"
                onSubmitEditing={handleTextSubmit}
              />

              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleTextCancel}
                  className="flex-1 items-center justify-center py-3 rounded-xl bg-gray-800"
                >
                  <Text className="text-sm font-bold text-gray-400">
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleTextSubmit}
                  disabled={!textValue.trim()}
                  className="flex-1 items-center justify-center py-3 rounded-xl bg-[#B7F0AD]"
                  style={!textValue.trim() ? styles.submitDisabled : undefined}
                >
                  <Text className="text-sm font-bold text-gray-900">
                    Add
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  header: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  headerButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  doneButton: {
    backgroundColor: "#B7F0AD",
  },
  doneDisabled: {
    opacity: 0.5,
  },
  doneText: {
    color: "#1F2937",
  },
  textInputCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  textInputField: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  submitDisabled: {
    opacity: 0.4,
  },
});
