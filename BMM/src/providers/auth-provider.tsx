"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useMe } from "@/lib/api/hooks";
import type { UserProfile } from "@/lib/api/resources";

type AuthContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Hydrate la session à partir de `/api/v1/auth/me` et l'expose à toute
 * l'application. Il n'existe pas de session simulée: si l'appel échoue,
 * l'utilisateur est simplement considéré comme non connecté.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isSuccess } = useMe();

  const value: AuthContextValue = {
    user: isSuccess ? (data ?? null) : null,
    isLoading,
    isAuthenticated: isSuccess && !!data,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans un <AuthProvider>.");
  }
  return ctx;
}
