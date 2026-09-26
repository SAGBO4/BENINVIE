"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { UserRole, UserSession, DEMO_USERS, ROLE_DASHBOARDS } from "./auth-session";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  loginAs: (role: UserRole) => void;
  loginWithCredentials: (npi: string, role: UserRole, password?: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "gbe_auth_session_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Erreur de récupération de session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAs = (role: UserRole) => {
    const session = DEMO_USERS[role];
    if (session) {
      setUser(session);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } catch (e) {
        console.error("Erreur écriture session:", e);
      }
      const targetRoute = ROLE_DASHBOARDS[role];
      router.push(targetRoute);
    }
  };

  const loginWithCredentials = (npi: string, role: UserRole, password?: string): boolean => {
    const template = DEMO_USERS[role];
    const session: UserSession = {
      ...template,
      npi: npi || template.npi,
    };
    setUser(session);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error("Erreur écriture session:", e);
    }
    const targetRoute = ROLE_DASHBOARDS[role];
    router.push(targetRoute);
    return true;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Erreur suppression session:", e);
    }
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginAs, loginWithCredentials, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé au sein d'un AuthProvider");
  }
  return context;
}
