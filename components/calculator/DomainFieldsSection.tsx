/**
 * M-13 S2: Schema-driven dynamic fields section.
 * Reads field definitions from constants/calculator.ts and renders
 * the appropriate component for each field type.
 */

import React from "react";
import { StyleSheet } from "react-native";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { View, Text, Pressable } from "@/tw";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import { Stepper } from "@/components/ui/Stepper";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { FieldDefinition } from "@/constants/calculator";

interface DomainFieldsSectionProps {
  fields: FieldDefinition[];
  control: Control<Record<string, unknown>>;
  errors: FieldErrors;
}

function SelectField({
  field,
  value,
  onChange,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View>
      <Text className="text-[13px] font-medium text-gray-600 mb-2">
        {field.label}
      </Text>
      <View style={styles.selectContainer}>
        {field.options?.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.selectOption,
              value === option.value && styles.selectOptionActive,
            ]}
          >
            <Text
              style={[
                styles.selectOptionText,
                value === option.value && styles.selectOptionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function FieldRenderer({
  field,
  control,
  errors,
}: {
  field: FieldDefinition;
  control: Control<Record<string, unknown>>;
  errors: FieldErrors;
}) {
  switch (field.type) {
    case "slider":
      return (
        <Controller
          control={control}
          name={field.key}
          render={({ field: { onChange, value } }) => (
            <Slider
              label={field.label}
              value={(value as number) ?? field.defaultValue ?? field.min ?? 0}
              onValueChange={onChange}
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              snapPoints={field.snapPoints}
              formatValue={field.formatValue}
            />
          )}
        />
      );

    case "stepper":
      return (
        <Controller
          control={control}
          name={field.key}
          render={({ field: { onChange, value } }) => (
            <Stepper
              label={field.label}
              value={(value as number) ?? field.defaultValue ?? field.min ?? 0}
              onValueChange={onChange}
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              formatValue={field.formatValue}
            />
          )}
        />
      );

    case "toggle":
      return (
        <Controller
          control={control}
          name={field.key}
          render={({ field: { onChange, value } }) => (
            <ToggleSwitch
              label={field.label}
              value={(value as boolean) ?? (field.defaultValue as boolean) ?? false}
              onValueChange={onChange}
            />
          )}
        />
      );

    case "select":
      return (
        <Controller
          control={control}
          name={field.key}
          render={({ field: { onChange, value } }) => (
            <SelectField
              field={field}
              value={(value as string) ?? (field.defaultValue as string) ?? ""}
              onChange={onChange}
            />
          )}
        />
      );

    case "currency":
      return (
        <Controller
          control={control}
          name={field.key}
          render={({ field: { onChange, value } }) => (
            <Input
              label={field.label}
              placeholder="$0.00"
              value={String(value ?? "")}
              onChangeText={(text) => {
                const num = parseFloat(text.replace(/[^0-9.]/g, ""));
                onChange(isNaN(num) ? 0 : num);
              }}
              keyboardType="decimal-pad"
              error={errors[field.key]?.message as string | undefined}
            />
          )}
        />
      );

    case "text":
    default:
      return (
        <Controller
          control={control}
          name={field.key}
          render={({ field: { onChange, value } }) => (
            <Input
              label={field.label}
              value={(value as string) ?? ""}
              onChangeText={onChange}
              error={errors[field.key]?.message as string | undefined}
            />
          )}
        />
      );
  }
}

export function DomainFieldsSection({
  fields,
  control,
  errors,
}: DomainFieldsSectionProps) {
  if (fields.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Service Details</Text>
      <View style={styles.sectionContent}>
        {fields.map((field, index) => (
          <View key={field.key}>
            {index > 0 && <View style={styles.fieldGap} />}
            <FieldRenderer field={field} control={control} errors={errors} />
          </View>
        ))}
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
    height: 20,
  },
  selectContainer: {
    gap: 8,
  },
  selectOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  selectOptionActive: {
    borderColor: "#B7F0AD",
    backgroundColor: "#F0FAF4",
  },
  selectOptionText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
  },
  selectOptionTextActive: {
    fontWeight: "600",
    color: "#2A5B4F",
  },
});
