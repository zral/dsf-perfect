"use client";

import { create } from "zustand";
import api from "@/lib/api";
import {
  setAccessToken,
  setRefreshToken,
  clearTokens,
  getAccessToken,
} from "@/lib/auth";
import type { User, AuthResponse } from "@/types/user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post<AuthResponse>("/api/v1/auth/login", {
        email,
        password,
      });
      const { access_token, refresh_token, user } = response.data;
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, name: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post<AuthResponse>("/api/v1/auth/register", {
        email,
        name,
        password,
      });
      const { access_token, refresh_token, user } = response.data;
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }
    set({ isLoading: true });
    try {
      const response = await api.get<User>("/api/v1/auth/me");
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
