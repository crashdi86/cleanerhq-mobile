import React, { useState, useCallback } from "react";
import { Platform, Modal, StyleSheet } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCalendarDays, faXmark } from "@fortawesome/free-solid-svg-icons";
import { View, Text, Pressable, TextInput } from "@/tw";
import { colors } from "@/constants/tokens";

interface DateTimePickerProps {
  label: string;
  value: string | undefined;
  onChange: (isoString: string) => void;
  error?: string;
}

/**
 * Format an ISO string into a human-readable date/time string.
 * Example: "Feb 28, 2026 at 9:00 AM"
 */
function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return isoString;
    }
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const minuteStr = minutes < 10 ? `0${minutes}` : String(minutes);
    return `${month} ${day}, ${year} at ${hours}:${minuteStr} ${ampm}`;
  } catch {
    return isoString;
  }
}

/**
 * Convert an ISO string to the "datetime-local" input format: "YYYY-MM-DDThh:mm"
 */
function toDateTimeLocalValue(isoString: string | undefined): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d}T${h}:${min}`;
  } catch {
    return "";
  }
}

// ── Web Implementation ──

function WebDateTimePicker({ label, value, onChange, error }: DateTimePickerProps) {
  const handleChange = useCallback(
    (text: string) => {
      if (text) {
        // Convert datetime-local format to ISO string
        const date = new Date(text);
        if (!isNaN(date.getTime())) {
          onChange(date.toISOString());
        }
      }
    },
    [onChange]
  );

  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-text-primary mb-1">
        {label}
      </Text>
      <View className="flex-row items-center bg-white border border-border rounded-[16px] px-4 py-3">
        <View className="mr-2">
          <FontAwesomeIcon
            icon={faCalendarDays}
            size={14}
            color={colors.text.secondary}
          />
        </View>
        <TextInput
          className="flex-1 text-sm text-text-primary"
          // @ts-expect-error: type prop is web-only for input elements
          type="datetime-local"
          value={toDateTimeLocalValue(value)}
          onChangeText={handleChange}
          placeholderTextColor="#6B7280"
        />
      </View>
      {error && (
        <Text className="text-xs text-error mt-1">{error}</Text>
      )}
    </View>
  );
}

// ── Native Implementation ──

function NativeDateTimePicker({ label, value, onChange, error }: DateTimePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("date");
  const [tempDate, setTempDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );

  // Dynamically import the native picker to avoid web bundling issues
  let RNDateTimePicker: React.ComponentType<{
    value: Date;
    mode: "date" | "time";
    display: string;
    onChange: (event: { type: string }, date?: Date) => void;
    themeVariant: string;
  }> | null = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pickerModule = require("@react-native-community/datetimepicker");
    RNDateTimePicker = pickerModule.default || pickerModule;
  } catch {
    // Picker not available on this platform
  }

  const handlePress = useCallback(() => {
    setTempDate(value ? new Date(value) : new Date());
    setMode("date");
    setShowModal(true);
  }, [value]);

  const handleDateChange = useCallback(
    (_event: { type: string }, selectedDate?: Date) => {
      if (selectedDate) {
        setTempDate(selectedDate);
        if (mode === "date") {
          // After selecting date, switch to time
          setMode("time");
        } else {
          // After selecting time, commit the value
          onChange(selectedDate.toISOString());
          setShowModal(false);
        }
      } else {
        setShowModal(false);
      }
    },
    [mode, onChange]
  );

  const handleConfirm = useCallback(() => {
    onChange(tempDate.toISOString());
    setShowModal(false);
  }, [tempDate, onChange]);

  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-text-primary mb-1">
        {label}
      </Text>
      <Pressable
        onPress={handlePress}
        className="flex-row items-center bg-white border border-border rounded-[16px] px-4 py-3"
      >
        <View className="mr-2">
          <FontAwesomeIcon
            icon={faCalendarDays}
            size={14}
            color={colors.text.secondary}
          />
        </View>
        <Text
          className={`flex-1 text-sm ${value ? "text-text-primary" : "text-gray-400"}`}
        >
          {value ? formatDateTime(value) : "Select date & time"}
        </Text>
      </Pressable>
      {error && (
        <Text className="text-xs text-error mt-1">{error}</Text>
      )}

      {/* Native Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setShowModal(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl pt-4 pb-8 px-4"
            onPress={() => {
              /* prevent bubble */
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 px-2">
              <Text className="text-lg font-semibold text-text-primary">
                {mode === "date" ? "Select Date" : "Select Time"}
              </Text>
              <Pressable
                onPress={() => setShowModal(false)}
                className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  size={16}
                  color={colors.text.secondary}
                />
              </Pressable>
            </View>

            {/* Picker */}
            {RNDateTimePicker && (
              <RNDateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={handleDateChange}
                themeVariant="light"
              />
            )}

            {/* Confirm button for time mode */}
            {mode === "time" && (
              <Pressable
                onPress={handleConfirm}
                className="bg-primary rounded-[16px] py-3 mt-4 items-center"
              >
                <Text className="text-white font-semibold text-base">
                  Confirm
                </Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ── Platform Switch ──

export function DateTimePicker(props: DateTimePickerProps) {
  if (Platform.OS === "web") {
    return <WebDateTimePicker {...props} />;
  }
  return <NativeDateTimePicker {...props} />;
}
