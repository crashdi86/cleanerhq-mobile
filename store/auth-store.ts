import { create } from "zustand";
import type { MeResponse } from "@/lib/api/types";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "OWNER" | "STAFF";
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
}

interface AuthState {
  user: User | null;
  workspace: Workspace | null;
  workspaces: MeResponse["workspaces"] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionRestored: boolean;

  setUser: (user: User) => void;
  setWorkspace: (workspace: Workspace) => void;
  setWorkspaces: (workspaces: MeResponse["workspaces"]) => void;
  setAuthenticated: (user: User, workspace: Workspace) => void;
  setLoading: (loading: boolean) => void;
  setSessionRestored: (restored: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  workspace: null,
  workspaces: null,
  isAuthenticated: false,
  isLoading: false,
  isSessionRestored: false,

  setUser: (user) => set({ user }),
  setWorkspace: (workspace) => set({ workspace }),
  setWorkspaces: (workspaces) => set({ workspaces }),
  setAuthenticated: (user, workspace) =>
    set({
      user,
      workspace,
      isAuthenticated: true,
      isLoading: false,
      workspaces: null,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setSessionRestored: (isSessionRestored) => set({ isSessionRestored }),
  logout: () =>
    set({
      user: null,
      workspace: null,
      workspaces: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
