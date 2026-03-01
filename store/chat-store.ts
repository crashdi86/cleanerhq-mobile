import { create } from "zustand";

interface ChatState {
  /** Total unread count across all conversations (for tab badge) */
  totalUnreadCount: number;
  /** Currently focused conversation ID (null if not viewing a thread) */
  activeConversationId: string | null;
  /** Newest sequence number seen per conversation (for poll deduplication) */
  newestSequenceMap: Record<string, number>;

  setTotalUnreadCount: (count: number) => void;
  decrementTotalUnread: (by?: number) => void;
  setActiveConversation: (id: string | null) => void;
  setNewestSequence: (conversationId: string, seq: number) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  totalUnreadCount: 0,
  activeConversationId: null,
  newestSequenceMap: {},

  setTotalUnreadCount: (count) => set({ totalUnreadCount: count }),

  decrementTotalUnread: (by = 1) =>
    set((s) => ({
      totalUnreadCount: Math.max(0, s.totalUnreadCount - by),
    })),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setNewestSequence: (conversationId, seq) =>
    set((s) => ({
      newestSequenceMap: { ...s.newestSequenceMap, [conversationId]: seq },
    })),

  reset: () =>
    set({
      totalUnreadCount: 0,
      activeConversationId: null,
      newestSequenceMap: {},
    }),
}));
