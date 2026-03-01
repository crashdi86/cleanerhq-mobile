/**
 * M-13 S2+S3+S4: Dynamic Calculator Form Screen.
 * Renders shared fields + type-specific domain fields + frequency + add-ons.
 * Uses react-hook-form + schema-driven field rendering.
 */

import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { View, Text } from "@/tw";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm, FormProvider, type Control } from "react-hook-form";
import { SharedFieldsSection } from "@/components/calculator/SharedFieldsSection";
import { DomainFieldsSection } from "@/components/calculator/DomainFieldsSection";
import { FrequencySelector } from "@/components/calculator/FrequencySelector";
import { AddOnToggleList } from "@/components/calculator/AddOnToggleList";
import { getCalculatorType } from "@/constants/calculator";
import { useCalculate } from "@/lib/api/hooks/useCalculator";
import { useAuthStore } from "@/store/auth-store";
import type { CalculatorType, ServiceFrequency } from "@/lib/api/types";

interface FormValues {
  // Shared fields
  project_name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  pricing_model: "MARGIN" | "MARKUP";
  margin_percent: number;
  minimum_charge: number;
  // Frequency (recurring types)
  frequency: ServiceFrequency;
  // Dynamic domain fields + add-ons stored by key
  [key: string]: unknown;
}

export default function CalculatorFormScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: CalculatorType }>();
  const workspace = useAuthStore((s) => s.workspace);
  const calculate = useCalculate();

  const calculatorType = useMemo(
    () => (type ? getCalculatorType(type) : undefined),
    [type],
  );

  // Build default values from field schema
  const defaultValues = useMemo((): FormValues => {
    const defaults: Record<string, unknown> = {
      project_name: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      pricing_model: "MARGIN",
      margin_percent: 40,
      minimum_charge: 0,
      frequency: calculatorType?.defaultFrequency ?? "one_time",
    };

    // Populate domain field defaults
    if (calculatorType) {
      for (const field of calculatorType.fields) {
        if (field.defaultValue !== undefined) {
          defaults[field.key] = field.defaultValue;
        }
      }
      // Initialize add-ons as false
      for (const addOn of calculatorType.addOns) {
        defaults[addOn.key] = false;
      }
    }

    return defaults as FormValues;
  }, [calculatorType]);

  const methods = useForm<FormValues>({
    defaultValues,
  });

  const { handleSubmit, control, watch, formState: { errors } } = methods;

  // Cast to generic control for components that use Control<Record<string, unknown>>
  const genericControl = control as unknown as Control<Record<string, unknown>>;

  const frequency = watch("frequency") as ServiceFrequency;

  const onSubmit = useCallback(
    (data: FormValues) => {
      if (!calculatorType || !workspace) return;

      // Build request payload
      const payload = {
        calculatorType: calculatorType.key,
        workspaceId: workspace.id,
        project: {
          name: data.project_name,
          address: {
            street: data.street,
            city: data.city,
            state: data.state,
            zip: data.zip,
          },
        },
        pricing: {
          marginModel: data.pricing_model,
          marginPercent: data.margin_percent,
          minimumCharge: data.minimum_charge,
        },
        // Spread domain-specific fields
        ...Object.fromEntries(
          calculatorType.fields.map((f) => [f.key, data[f.key]]),
        ),
        // Add frequency if applicable
        ...(calculatorType.hasFrequency ? { frequency: data.frequency } : {}),
        // Spread add-on toggles
        addOns: Object.fromEntries(
          calculatorType.addOns.map((a) => [a.key, data[a.key] ?? false]),
        ),
      };

      calculate.mutate(payload, {
        onSuccess: (response) => {
          // Navigate to results with serialized data
          router.push({
            pathname: "/(app)/calculator/results" as never,
            params: {
              calculatorInput: JSON.stringify(payload),
              calculatorOutput: JSON.stringify(response),
              projectName: data.project_name,
              calculatorType: calculatorType.key,
            },
          } as never);
        },
        onError: (error) => {
          const message =
            error instanceof Error
              ? error.message
              : "Calculation failed. Please try again.";
          Alert.alert("Error", message);
        },
      });
    },
    [calculatorType, workspace, calculate, router],
  );

  if (!calculatorType) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">Calculator type not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.backButton}
          >
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="#1F2937" />
          </Pressable>
          <View style={styles.headerCenter}>
            <FontAwesomeIcon
              icon={calculatorType.icon}
              size={16}
              color="#2A5B4F"
            />
            <Text style={styles.title} numberOfLines={1}>
              {calculatorType.label}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <FormProvider {...methods}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Shared Fields */}
            <SharedFieldsSection control={genericControl} errors={errors} />

            {/* Frequency Selector (recurring types only) */}
            {calculatorType.hasFrequency && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service Frequency</Text>
                <FrequencySelector
                  value={frequency}
                  onChange={(val) => methods.setValue("frequency", val)}
                />
              </View>
            )}

            {/* Domain-Specific Fields */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              <DomainFieldsSection
                fields={calculatorType.fields}
                control={genericControl}
                errors={errors}
              />
            </View>

            {/* Add-Ons */}
            {calculatorType.addOns.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Add-Ons</Text>
                <AddOnToggleList
                  addOns={calculatorType.addOns}
                  values={Object.fromEntries(
                    calculatorType.addOns.map((a) => [
                      a.key,
                      (watch(a.key) as boolean) ?? false,
                    ]),
                  )}
                  onToggle={(key, value) => methods.setValue(key, value)}
                />
              </View>
            )}

            {/* Calculate Button */}
            <View style={styles.calculateWrapper}>
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={calculate.isPending}
                style={({ pressed }) => [
                  styles.calculateButton,
                  pressed && styles.calculateButtonPressed,
                  calculate.isPending && styles.calculateButtonDisabled,
                ]}
              >
                {calculate.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.calculateButtonText}>Calculate</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </FormProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
  flex: {
    flex: 1,
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
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 12,
    fontFamily: "PlusJakartaSans",
  },
  calculateWrapper: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  calculateButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#2A5B4F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2A5B4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  calculateButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  calculateButtonDisabled: {
    opacity: 0.6,
  },
  calculateButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "PlusJakartaSans",
  },
});
