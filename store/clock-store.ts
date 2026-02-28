import { create } from "zustand";
import type { TimeStatusResponse, TimeStatusEntry } from "@/lib/api/types";

interface ClockState {
  isClockedIn: boolean;
  clockInTime: string | null;
  activeEntryId: string | null;
  activeJobId: string | null;
  activeJobTitle: string | null;
  activeJobAccountName: string | null;

  setClockedIn: (entry: TimeStatusEntry) => void;
  setClockedOut: () => void;
  setFromTimeStatus: (response: TimeStatusResponse) => void;
}

export const useClockStore = create<ClockState>((set) => ({
  isClockedIn: false,
  clockInTime: null,
  activeEntryId: null,
  activeJobId: null,
  activeJobTitle: null,
  activeJobAccountName: null,

  setClockedIn: (entry) =>
    set({
      isClockedIn: true,
      clockInTime: entry.clock_in_time,
      activeEntryId: entry.id,
      activeJobId: entry.job_id,
      activeJobTitle: entry.job?.title ?? null,
      activeJobAccountName: entry.job?.account_name ?? null,
    }),

  setClockedOut: () =>
    set({
      isClockedIn: false,
      clockInTime: null,
      activeEntryId: null,
      activeJobId: null,
      activeJobTitle: null,
      activeJobAccountName: null,
    }),

  setFromTimeStatus: (response) => {
    if (response.clocked_in && response.entry) {
      set({
        isClockedIn: true,
        clockInTime: response.entry.clock_in_time,
        activeEntryId: response.entry.id,
        activeJobId: response.entry.job_id,
        activeJobTitle: response.entry.job?.title ?? null,
        activeJobAccountName: response.entry.job?.account_name ?? null,
      });
    } else {
      set({
        isClockedIn: false,
        clockInTime: null,
        activeEntryId: null,
        activeJobId: null,
        activeJobTitle: null,
        activeJobAccountName: null,
      });
    }
  },
}));
