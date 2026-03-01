/**
 * M-13 S2: Shared form fields rendered for all calculator types.
 * Project name, address, pricing model, margin %, minimum charge.
 */

import React from "react";
import { StyleSheet } from "react-native";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { View, Text } from "@/tw";
import { Input } from "@/components/ui/Input";
import { Stepper } from "@/components/ui/Stepper";
import { Pressable } from "react-native";

interface SharedFieldsSectionProps {
  control: Control<Record<string, unknown>>;
  errors: FieldErrors;
}

export function SharedFieldsSection({
  control,
  errors,
}: SharedFieldsSectionProps) {
  return (
    <View>
      {/* Project Name */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Project Details</Text>
        <View style={styles.sectionContent}>
          <Controller
            control={control}
            name="project_name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Project Name"
                placeholder="e.g., Downtown Office Weekly"
                value={value as string}
                onChangeText={onChange}
                error={errors.project_name?.message as string | undefined}
              />
            )}
          />

          <View style={styles.fieldGap} />

          <Controller
            control={control}
            name="address_street"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Street Address"
                placeholder="123 Main Street"
                value={value as string}
                onChangeText={onChange}
                error={errors.address_street?.message as string | undefined}
              />
            )}
          />

          <View style={styles.fieldGap} />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="address_city"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="City"
                    placeholder="City"
                    value={value as string}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
            <View style={styles.smallField}>
              <Controller
                control={control}
                name="address_state"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="State"
                    placeholder="ST"
                    value={value as string}
                    onChangeText={onChange}
                    maxLength={2}
                  />
                )}
              />
            </View>
            <View style={styles.smallField}>
              <Controller
                control={control}
                name="address_zip"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="ZIP"
                    placeholder="00000"
                    value={value as string}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                )}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Pricing Model */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Pricing</Text>
        <View style={styles.sectionContent}>
          {/* Margin / Markup toggle */}
          <Text className="text-[13px] font-medium text-gray-600 mb-2">
            Pricing Model
          </Text>
          <Controller
            control={control}
            name="pricing_model"
            render={({ field: { onChange, value } }) => (
              <View style={styles.segmentedRow}>
                <Pressable
                  onPress={() => onChange("MARGIN")}
                  style={[
                    styles.segmentButton,
                    value === "MARGIN" && styles.segmentButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      value === "MARGIN" && styles.segmentTextActive,
                    ]}
                  >
                    Margin
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => onChange("MARKUP")}
                  style={[
                    styles.segmentButton,
                    value === "MARKUP" && styles.segmentButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      value === "MARKUP" && styles.segmentTextActive,
                    ]}
                  >
                    Markup
                  </Text>
                </Pressable>
              </View>
            )}
          />

          <View style={styles.fieldGap} />

          {/* Margin Percent */}
          <Controller
            control={control}
            name="margin_percent"
            render={({ field: { onChange, value } }) => (
              <Stepper
                label="Margin %"
                value={value as number}
                onValueChange={onChange}
                min={5}
                max={80}
                step={5}
                formatValue={(v) => `${v}%`}
              />
            )}
          />

          <View style={styles.fieldGap} />

          {/* Minimum Charge */}
          <Controller
            control={control}
            name="minimum_charge"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Minimum Charge"
                placeholder="$0.00"
                value={String(value ?? "")}
                onChangeText={(text) => {
                  const num = parseFloat(text.replace(/[^0-9.]/g, ""));
                  onChange(isNaN(num) ? 0 : num);
                }}
                keyboardType="decimal-pad"
              />
            )}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 4,
    fontFamily: "PlusJakartaSans",
  },
  sectionContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldGap: {
    height: 16,
  },
  smallField: {
    width: 80,
  },
  segmentedRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    fontFamily: "PlusJakartaSans",
  },
  segmentTextActive: {
    color: "#2A5B4F",
    fontWeight: "600",
  },
});
