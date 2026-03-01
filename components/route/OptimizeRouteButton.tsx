import React, { useState, useCallback } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "@/store/auth-store";
import { useOptimizeRoute } from "@/lib/api/hooks/useRoute";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { OptimizationResultsSheet } from "@/components/route/OptimizationResultsSheet";
import type { OptimizeRouteResponse } from "@/lib/api/types";

interface OptimizeRouteButtonProps {
  date: string;
}

export function OptimizeRouteButton({ date }: OptimizeRouteButtonProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const role = useAuthStore((s) => s.user?.role);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<OptimizeRouteResponse | null>(null);

  const optimizeRoute = useOptimizeRoute();

  // Only OWNER can optimize
  if (role !== "OWNER" || !userId) return null;

  const handlePress = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const handleConfirm = useCallback(() => {
    setShowConfirm(false);
    optimizeRoute.mutate(
      { user_id: userId, date },
      {
        onSuccess: (data) => {
          setResults(data);
          setShowResults(true);
        },
      }
    );
  }, [optimizeRoute, userId, date]);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirm(false);
  }, []);

  const handleCloseResults = useCallback(() => {
    setShowResults(false);
    setResults(null);
  }, []);

  return (
    <>
      {/* Floating optimize button */}
      <Pressable
        onPress={handlePress}
        disabled={optimizeRoute.isPending}
        style={({ pressed }) => [
          styles.fab,
          { opacity: pressed || optimizeRoute.isPending ? 0.7 : 1 },
        ]}
      >
        {optimizeRoute.isPending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <FontAwesomeIcon
            icon={faWandMagicSparkles}
            size={16}
            color="#FFFFFF"
          />
        )}
        <Text className="text-sm font-bold text-white ml-2">Optimize</Text>
      </Pressable>

      {/* Confirmation dialog */}
      <ConfirmDialog
        visible={showConfirm}
        title="Optimize Route?"
        message="This will reorder stops for minimum travel time. The crew's schedule will be updated."
        confirmLabel="Optimize"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
        loading={optimizeRoute.isPending}
      />

      {/* Results sheet */}
      {results && (
        <OptimizationResultsSheet
          visible={showResults}
          onClose={handleCloseResults}
          savings={results.savings}
          previousKm={results.previous_total_km}
          optimizedKm={results.optimized_total_km}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 100,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A5B4F",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 12,
  },
});
