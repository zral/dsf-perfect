"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (!store.isAuthenticated && !store.isLoading) {
      store.fetchUser();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login: store.login,
    register: store.register,
    logout: store.logout,
  };
}
