import React, { useState, useCallback, useMemo } from "react";
import { Platform, Modal, StyleSheet } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCalendarDays,
  faXmark,
  faChevronLeft,
  faChevronRight,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { View, Text, Pressable } from "@/tw";
import { colors } from "@/constants/tokens";

interface DateTimePickerProps {
  label: string;
  value: string | undefined;
  onChange: (isoString: string) => void;
  error?: string;
  /** ISO string — dates before this are disabled */
  minDate?: string;
  /** ISO string — dates after this are disabled */
  maxDate?: string;
}

// ── Shared Helpers ──

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const month = MONTHS[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const minuteStr = minutes < 10 ? `0${minutes}` : String(minutes);
    return `${month?.slice(0, 3)} ${day}, ${year} · ${hours}:${minuteStr} ${ampm}`;
  } catch {
    return isoString;
  }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ── Calendar Grid Component ──

interface CalendarGridProps {
  year: number;
  month: number;
  selectedDate: Date;
  onSelectDate: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  /** Dates before this are disabled (start of day) */
  minDate?: Date;
  /** Dates after this are disabled (start of day) */
  maxDate?: Date;
}

function CalendarGrid({
  year,
  month,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  minDate,
  maxDate,
}: CalendarGridProps) {
  const today = useMemo(() => new Date(), []);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  return (
    <View>
      {/* Month/Year header */}
      <View className="flex-row items-center justify-between mb-3 px-1">
        <Pressable
          onPress={onPrevMonth}
          style={calStyles.navBtn}
        >
          <FontAwesomeIcon
            icon={faChevronLeft}
            size={13}
            color={colors.text.secondary}
          />
        </Pressable>
        <Text className="text-base font-semibold text-text-primary">
          {MONTHS[month]} {year}
        </Text>
        <Pressable
          onPress={onNextMonth}
          style={calStyles.navBtn}
        >
          <FontAwesomeIcon
            icon={faChevronRight}
            size={13}
            color={colors.text.secondary}
          />
        </Pressable>
      </View>

      {/* Day-of-week headers */}
      <View className="flex-row mb-1">
        {DAYS_OF_WEEK.map((d) => (
          <View key={d} style={calStyles.dayCell}>
            <Text className="text-xs font-medium text-gray-400 text-center">
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      {weeks.map((week, wi) => (
        <View key={wi} className="flex-row">
          {week.map((day, di) => {
            if (day === null) {
              return <View key={`e-${di}`} style={calStyles.dayCell} />;
            }

            const cellDate = new Date(year, month, day);
            const isSelected = isSameDay(cellDate, selectedDate);
            const isToday = isSameDay(cellDate, today);

            // Check if this day is outside the allowed range
            const cellStart = new Date(year, month, day, 0, 0, 0, 0);
            const cellEnd = new Date(year, month, day, 23, 59, 59, 999);
            const isBeforeMin = minDate ? cellEnd < minDate : false;
            const isAfterMax = maxDate ? cellStart > maxDate : false;
            const isDisabled = isBeforeMin || isAfterMax;

            return (
              <View key={day} style={calStyles.dayCell}>
                <Pressable
                  onPress={isDisabled ? undefined : () => onSelectDate(day)}
                  disabled={isDisabled}
                  style={[
                    calStyles.dayBtn,
                    isSelected && !isDisabled && calStyles.dayBtnSelected,
                    isToday && !isSelected && !isDisabled && calStyles.dayBtnToday,
                    isDisabled && calStyles.dayBtnDisabled,
                  ]}
                >
                  <Text
                    style={[
                      calStyles.dayText,
                      isSelected && !isDisabled && calStyles.dayTextSelected,
                      isToday && !isSelected && !isDisabled && calStyles.dayTextToday,
                      isDisabled && calStyles.dayTextDisabled,
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              </View>
            );
          })}
          {/* Pad last row */}
          {week.length < 7 &&
            Array.from({ length: 7 - week.length }).map((_, pi) => (
              <View key={`p-${pi}`} style={calStyles.dayCell} />
            ))}
        </View>
      ))}
    </View>
  );
}

// ── Time Picker Component ──

interface TimePickerRowProps {
  hours: number;
  minutes: number;
  onChangeHours: (h: number) => void;
  onChangeMinutes: (m: number) => void;
}

function TimePickerRow({
  hours,
  minutes,
  onChangeHours,
  onChangeMinutes,
}: TimePickerRowProps) {
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const isPM = hours >= 12;

  const incHour = () => onChangeHours((hours + 1) % 24);
  const decHour = () => onChangeHours((hours + 23) % 24);
  const incMin = () => onChangeMinutes((minutes + 15) % 60);
  const decMin = () => onChangeMinutes(minutes - 15 < 0 ? 45 : minutes - 15);
  const toggleAMPM = () => onChangeHours(isPM ? hours - 12 : hours + 12);

  return (
    <View className="flex-row items-center justify-center gap-2 py-3">
      <View className="flex-row items-center bg-gray-50 rounded-2xl px-1 py-1">
        <FontAwesomeIcon
          icon={faClock}
          size={14}
          color={colors.text.secondary}
          style={{ marginRight: 8, marginLeft: 8 }}
        />

        {/* Hours */}
        <View className="items-center">
          <Pressable onPress={incHour} style={calStyles.timeArrow}>
            <FontAwesomeIcon icon={faChevronLeft} size={10} color={colors.text.secondary} style={{ transform: [{ rotate: "90deg" }] }} />
          </Pressable>
          <Text className="text-xl font-bold text-text-primary" style={{ minWidth: 32, textAlign: "center" }}>
            {String(displayHour).padStart(2, "0")}
          </Text>
          <Pressable onPress={decHour} style={calStyles.timeArrow}>
            <FontAwesomeIcon icon={faChevronLeft} size={10} color={colors.text.secondary} style={{ transform: [{ rotate: "-90deg" }] }} />
          </Pressable>
        </View>

        <Text className="text-xl font-bold text-text-primary mx-1">:</Text>

        {/* Minutes */}
        <View className="items-center">
          <Pressable onPress={incMin} style={calStyles.timeArrow}>
            <FontAwesomeIcon icon={faChevronLeft} size={10} color={colors.text.secondary} style={{ transform: [{ rotate: "90deg" }] }} />
          </Pressable>
          <Text className="text-xl font-bold text-text-primary" style={{ minWidth: 32, textAlign: "center" }}>
            {String(minutes).padStart(2, "0")}
          </Text>
          <Pressable onPress={decMin} style={calStyles.timeArrow}>
            <FontAwesomeIcon icon={faChevronLeft} size={10} color={colors.text.secondary} style={{ transform: [{ rotate: "-90deg" }] }} />
          </Pressable>
        </View>

        {/* AM/PM */}
        <Pressable
          onPress={toggleAMPM}
          style={[calStyles.ampmBtn, isPM && calStyles.ampmBtnActive]}
        >
          <Text
            style={[calStyles.ampmText, isPM && calStyles.ampmTextActive]}
          >
            {isPM ? "PM" : "AM"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Web Calendar Modal ──

function WebDateTimePicker({
  label,
  value,
  onChange,
  error,
  minDate: minDateStr,
  maxDate: maxDateStr,
}: DateTimePickerProps) {
  const minDateObj = useMemo(
    () => (minDateStr ? new Date(minDateStr) : undefined),
    [minDateStr]
  );
  const maxDateObj = useMemo(
    () => (maxDateStr ? new Date(maxDateStr) : undefined),
    [maxDateStr]
  );
  const [showModal, setShowModal] = useState(false);

  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [hours, setHours] = useState(initialDate.getHours());
  const [minutes, setMinutes] = useState(initialDate.getMinutes());

  const handleOpen = useCallback(() => {
    const d = value ? new Date(value) : new Date();
    // Round minutes to nearest 15
    const roundedMin = Math.round(d.getMinutes() / 15) * 15;
    d.setMinutes(roundedMin % 60);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setSelectedDate(d);
    setHours(d.getHours());
    setMinutes(roundedMin % 60);
    setShowModal(true);
  }, [value]);

  const handlePrevMonth = useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const handleSelectDay = useCallback(
    (day: number) => {
      const newDate = new Date(viewYear, viewMonth, day, hours, minutes);
      setSelectedDate(newDate);
    },
    [viewYear, viewMonth, hours, minutes]
  );

  const handleConfirm = useCallback(() => {
    const result = new Date(selectedDate);
    result.setHours(hours, minutes, 0, 0);
    onChange(result.toISOString());
    setShowModal(false);
  }, [selectedDate, hours, minutes, onChange]);

  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-text-primary mb-1">
        {label}
      </Text>
      <Pressable
        onPress={handleOpen}
        style={({ pressed }: { pressed: boolean }) => ({
          opacity: pressed ? 0.8 : 1,
        })}
        className="flex-row items-center bg-white border border-border rounded-[16px] px-4 py-3"
      >
        <View className="mr-2">
          <FontAwesomeIcon
            icon={faCalendarDays}
            size={14}
            color={value ? colors.primary.DEFAULT : colors.text.secondary}
          />
        </View>
        <Text
          className={`flex-1 text-sm ${value ? "text-text-primary font-medium" : "text-gray-400"}`}
        >
          {value ? formatDateTime(value) : "Select date & time"}
        </Text>
      </Pressable>
      {error && (
        <Text className="text-xs text-error mt-1">{error}</Text>
      )}

      {/* Calendar Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={calStyles.overlay}
          onPress={() => setShowModal(false)}
        >
          <Pressable
            style={calStyles.modal}
            onPress={() => {
              /* prevent bubble */
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-text-primary">
                {label}
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

            {/* Calendar Grid */}
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDay}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              minDate={minDateObj}
              maxDate={maxDateObj}
            />

            {/* Divider */}
            <View
              className="my-3"
              style={{ height: 1, backgroundColor: colors.border }}
            />

            {/* Time Picker */}
            <TimePickerRow
              hours={hours}
              minutes={minutes}
              onChangeHours={setHours}
              onChangeMinutes={setMinutes}
            />

            {/* Actions */}
            <View className="flex-row gap-3 mt-3">
              <Pressable
                onPress={() => setShowModal(false)}
                style={calStyles.cancelBtn}
              >
                <Text className="text-sm font-semibold text-text-secondary">
                  Cancel
                </Text>
              </Pressable>
              <Pressable onPress={handleConfirm} style={calStyles.confirmBtn}>
                <Text className="text-sm font-semibold text-white">
                  Confirm
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ── Native Implementation ──

function NativeDateTimePicker({
  label,
  value,
  onChange,
  error,
  minDate: minDateStr,
  maxDate: maxDateStr,
}: DateTimePickerProps) {
  const minDateObj = useMemo(
    () => (minDateStr ? new Date(minDateStr) : undefined),
    [minDateStr]
  );
  const maxDateObj = useMemo(
    () => (maxDateStr ? new Date(maxDateStr) : undefined),
    [maxDateStr]
  );
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("date");
  const [tempDate, setTempDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );

  let RNDateTimePicker: React.ComponentType<{
    value: Date;
    mode: "date" | "time";
    display: string;
    onChange: (event: { type: string }, date?: Date) => void;
    themeVariant: string;
    minimumDate?: Date;
    maximumDate?: Date;
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
          setMode("time");
        } else {
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
            color={value ? colors.primary.DEFAULT : colors.text.secondary}
          />
        </View>
        <Text
          className={`flex-1 text-sm ${value ? "text-text-primary font-medium" : "text-gray-400"}`}
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

            {RNDateTimePicker && (
              <RNDateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={handleDateChange}
                themeVariant="light"
                minimumDate={minDateObj}
                maximumDate={maxDateObj}
              />
            )}

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

// ── Calendar Styles ──

const calStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    width: "100%",
    maxWidth: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  dayCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
  },
  dayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayBtnSelected: {
    backgroundColor: "#2A5B4F",
  },
  dayBtnToday: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#2A5B4F",
  },
  dayBtnDisabled: {
    opacity: 0.25,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  dayTextToday: {
    color: "#2A5B4F",
    fontWeight: "700",
  },
  dayTextDisabled: {
    color: "#D1D5DB",
  },
  timeArrow: {
    width: 28,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  ampmBtn: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  ampmBtnActive: {
    backgroundColor: "#2A5B4F",
  },
  ampmText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  ampmTextActive: {
    color: "#FFFFFF",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#2A5B4F",
    alignItems: "center",
  },
});

// ── Platform Switch ──

export function DateTimePicker(props: DateTimePickerProps) {
  if (Platform.OS === "web") {
    return <WebDateTimePicker {...props} />;
  }
  return <NativeDateTimePicker {...props} />;
}
