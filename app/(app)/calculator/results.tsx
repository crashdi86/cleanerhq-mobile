/**
 * M-13 S5+S7: Tier Results Screen.
 * Horizontal snap-scroll carousel of Good/Better/Best cards.
 * "Create Quote" button appears when a tier is selected.
 */

import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TierCardCarousel } from "@/components/calculator/TierCardCarousel";
import { TierCardSkeleton } from "@/components/calculator/TierCardSkeleton";
import { CreateQuoteButton } from "@/components/calculator/CreateQuoteButton";
import { EntitlementExceededModal } from "@/components/calculator/EntitlementExceededModal";
import type { CalculateResponse, TierLevel, TierResult } from "@/lib/api/types";

export default function CalculatorResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    calculatorInput: string;
    calculatorOutput: string;
    projectName: string;
    calculatorType: string;
  }>();

  const [selectedTier, setSelectedTier] = useState<TierLevel | null>(null);
  const [showEntitlementModal, setShowEntitlementModal] = useState(false);

  const calculatorInput = useMemo(() => {
    try {
      return JSON.parse(params.calculatorInput ?? "{}") as Record<
        string,
        unknown
      >;
    } catch {
      return {};
    }
  }, [params.calculatorInput]);

  const calculatorOutput = useMemo(() => {
    try {
      return JSON.parse(params.calculatorOutput ?? "{}") as CalculateResponse;
    } catch {
      return null;
    }
  }, [params.calculatorOutput]);

  const tiers = calculatorOutput?.tiers ?? [];
  const selectedTierData = tiers.find((t) => t.tier === selectedTier);

  const handleSelectTier = useCallback((tier: TierResult) => {
    setSelectedTier(tier.tier);
  }, []);

  const handleAcceptSign = useCallback(() => {
    if (!selectedTierData || !calculatorOutput) return;
    router.push({
      pathname: "/(app)/calculator/flip" as never,
      params: {
        tierData: JSON.stringify(selectedTierData),
        projectName: params.projectName ?? "",
      },
    } as never);
  }, [selectedTierData, calculatorOutput, router, params.projectName]);

  if (!calculatorOutput || tiers.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.backButton}
          >
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="#1F2937" />
          </Pressable>
          <Text style={styles.title}>Results</Text>
          <View style={styles.headerSpacer} />
        </View>
        <TierCardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backButton}
        >
          <FontAwesomeIcon icon={faArrowLeft} size={20} color="#1F2937" />
        </Pressable>
        <Text style={styles.title}>Select a Tier</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Project Name */}
      <View style={styles.projectInfo}>
        <Text style={styles.projectLabel}>Project</Text>
        <Text style={styles.projectName} numberOfLines={1}>
          {params.projectName ?? "Untitled"}
        </Text>
      </View>

      {/* Tier Cards Carousel */}
      <View style={styles.carouselWrapper}>
        <TierCardCarousel
          tiers={tiers}
          selectedTier={selectedTier}
          onSelectTier={handleSelectTier}
        />
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {selectedTier && selectedTierData && (
          <>
            {/* Accept & Sign */}
            <Pressable
              onPress={handleAcceptSign}
              style={({ pressed }) => [
                styles.acceptButton,
                pressed && styles.acceptButtonPressed,
              ]}
            >
              <Text style={styles.acceptButtonText}>Accept & Sign</Text>
              <FontAwesomeIcon
                icon={faArrowRight}
                size={16}
                color="#2A5B4F"
              />
            </Pressable>

            {/* Create Quote */}
            <CreateQuoteButton
              selectedTier={selectedTier}
              selectedTotal={selectedTierData.total}
              projectName={params.projectName ?? "Untitled"}
              calculatorInput={calculatorInput}
              calculatorOutput={
                calculatorOutput as unknown as Record<string, unknown>
              }
            />
          </>
        )}
      </View>

      <EntitlementExceededModal
        visible={showEntitlementModal}
        onClose={() => setShowEntitlementModal(false)}
      />
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
  backButton: {
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
  headerSpacer: {
    width: 40,
  },
  projectInfo: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  projectLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
    fontFamily: "PlusJakartaSans",
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  bottomActions: {
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#2A5B4F",
    backgroundColor: "transparent",
    marginHorizontal: 20,
  },
  acceptButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2A5B4F",
    fontFamily: "PlusJakartaSans",
  },
});
