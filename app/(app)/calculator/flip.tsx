/**
 * M-13 S6: Card-Flip View Screen.
 * Shows estimate summary on front, signature canvas placeholder on back.
 * Full-screen modal with 3D flip animation.
 */

import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faXmark, faRotate } from "@fortawesome/free-solid-svg-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlipCard } from "@/components/calculator/FlipCard";
import { EstimateSummaryFront } from "@/components/calculator/EstimateSummaryFront";
import { SignatureCanvasBack } from "@/components/calculator/SignatureCanvasBack";
import type { TierResult } from "@/lib/api/types";

export default function CardFlipScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    tierData: string;
    projectName: string;
  }>();

  const [isFlipped, setIsFlipped] = useState(false);

  const tierData = useMemo((): TierResult | null => {
    try {
      return JSON.parse(params.tierData ?? "null") as TierResult;
    } catch {
      return null;
    }
  }, [params.tierData]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleSignatureConfirm = useCallback(() => {
    // Placeholder — will integrate with M-14-S4 signature capture
    router.back();
  }, [router]);

  if (!tierData) {
    return (
      <SafeAreaView style={styles.container}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">No tier data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.closeButton}
        >
          <FontAwesomeIcon icon={faXmark} size={22} color="#1F2937" />
        </Pressable>
        <Text style={styles.title}>
          {isFlipped ? "Signature" : "Estimate"}
        </Text>
        <Pressable
          onPress={handleFlip}
          hitSlop={8}
          style={styles.flipButton}
        >
          <FontAwesomeIcon icon={faRotate} size={18} color="#2A5B4F" />
        </Pressable>
      </View>

      {/* Flip Card */}
      <View style={styles.cardWrapper}>
        <FlipCard
          isFlipped={isFlipped}
          onFlip={handleFlip}
          frontContent={
            <EstimateSummaryFront
              tier={tierData}
              projectName={params.projectName ?? "Untitled"}
              onAcceptSign={handleFlip}
            />
          }
          backContent={
            <SignatureCanvasBack
              onConfirm={handleSignatureConfirm}
              onCancel={handleFlip}
            />
          }
        />
      </View>

      {/* Flip hint */}
      <View style={styles.hintWrapper}>
        <Text style={styles.hintText}>
          {isFlipped
            ? "Tap the flip button to go back"
            : "Tap to flip for signature"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
  },
  flipButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(42,91,79,0.08)",
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  hintWrapper: {
    alignItems: "center",
    paddingBottom: 24,
  },
  hintText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#9CA3AF",
    fontFamily: "PlusJakartaSans",
  },
});
