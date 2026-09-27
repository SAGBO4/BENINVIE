"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { UserRole, UserSession, AccountStatus, DEMO_USERS, ROLE_DASHBOARDS } from "./auth-session";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  loginAs: (role: UserRole) => void;
  loginWithCredentials: (identifier: string, role?: UserRole, password?: string) => Promise<boolean> | boolean;
  registerAccount: (newSession: UserSession) => Promise<{ success: boolean; requiresValidation: boolean; status: AccountStatus }>;
  getRegisteredAccounts: () => UserSession[];
  validateAccount: (npi: string, validePar?: string) => void;
  rejectAccount: (npi: string, motif: string) => void;
  suspendAccount: (npi: string, motif: string) => void;
  lastLoginError: string | null;
  clearLoginError: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "gbe_auth_session_user";
const REGISTERED_ACCOUNTS_KEY = "gbe_registered_accounts";

const INITIAL_REGISTERED_ACCOUNTS: UserSession[] = [
  {
    npi: "BEN-MED-2026-8812",
    nom: "BIO",
    prenom: "Dr. Salifou",
    role: "MEDECIN",
    roleLabel: "Médecin Urgentiste",
    titre: "Chef de Garde • Urgences Vitales",
    etablissementNom: "Hôpital de Zone de Djougou",
    commune: "Djougou",
    departement: "Donga",
    badge: "Accrédité Bris de Glace",
    statutValidation: "VALIDE",
    dateDemande: "24/09/2026 à 10:15",
    dateValidation: "24/09/2026 à 14:00",
    validePar: "ARS Bénin (Direction du Contrôle)",
    password: "med2026",
  },
  {
    npi: "BEN-PHA-2026-3391",
    nom: "HOUNTON",
    prenom: "Dr. Marie-Claire",
    role: "PHARMACIE",
    roleLabel: "Pharmacien Conventionné",
    titre: "Pharmacienne Titulaire",
    etablissementNom: "Pharmacie du Grand Marché (Parakou)",
    commune: "Parakou",
    departement: "Borgou",
    badge: "Officine Agréée ARCH",
    statutValidation: "VALIDE",
    dateDemande: "25/09/2026 à 09:30",
    dateValidation: "25/09/2026 à 11:20",
    validePar: "Direction de la Pharmacie et du Médicament",
    password: "pha2026",
  },
  {
    npi: "BEN-ASC-2026-1144",
    nom: "GADO",
    prenom: "Chabi",
    role: "ASC",
    roleLabel: "Agent de Santé Communautaire",
    titre: "ASC Référent Terrain",
    etablissementNom: "Centre de Santé d'arrondissement de Dunkassa",
    commune: "Kalalé",
    departement: "Borgou",
    badge: "Terrain PWA Offline",
    statutValidation: "VALIDE",
    dateDemande: "26/09/2026 à 08:00",
    dateValidation: "26/09/2026 à 10:30",
    validePar: "Ministère de la Santé (Direction Départementale)",
    password: "asc2026",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredAccounts, setRegisteredAccounts] = useState<UserSession[]>([]);
  const [lastLoginError, setLastLoginError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }

      const storedAccounts = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
      if (storedAccounts) {
        setRegisteredAccounts(JSON.parse(storedAccounts));
      } else {
        localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(INITIAL_REGISTERED_ACCOUNTS));
        setRegisteredAccounts(INITIAL_REGISTERED_ACCOUNTS);
      }
    } catch (e) {
      console.error("Erreur de récupération de session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearLoginError = () => setLastLoginError(null);

  const persistSession = (session: UserSession) => {
    setUser(session);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem("gbe_user_role", session.role.toLowerCase());
      localStorage.setItem("gbe_user_name", `${session.prenom} ${session.nom}`);
      localStorage.setItem("gbe_user_npi", session.npi);
    } catch (e) {
      console.error("Erreur écriture session:", e);
    }
  };

  const loginAs = (role: UserRole) => {
    setLastLoginError(null);
    const session = DEMO_USERS[role];
    if (session) {
      persistSession(session);
      const targetRoute = ROLE_DASHBOARDS[role];
      router.push(targetRoute);
    }
  };

  const loginWithCredentials = async (identifier: string, role?: UserRole, password?: string): Promise<boolean> => {
    setLastLoginError(null);

    const cleanInput = (identifier || "").trim();
    if (!cleanInput) {
      setLastLoginError("Veuillez saisir votre Numéro Personnel d'Identification (NPI) ou votre matricule professionnel.");
      return false;
    }

    // 1. Recherche parmi les comptes de démonstration
    const demoEntries = Object.entries(DEMO_USERS) as [UserRole, UserSession][];
    const foundDemo = demoEntries.find(
      ([rKey, u]) =>
        u.npi.toLowerCase() === cleanInput.toLowerCase() ||
        rKey.toLowerCase() === cleanInput.toLowerCase() ||
        (u.nom && u.nom.toLowerCase() === cleanInput.toLowerCase()) ||
        (u.npi.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === cleanInput.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())
    );

    // 2. Recherche parmi les comptes enregistrés
    let matchedCustomUser: UserSession | null = null;
    try {
      const existingRaw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
      const list: UserSession[] = existingRaw ? JSON.parse(existingRaw) : registeredAccounts;
      matchedCustomUser =
        list.find(
          (u) =>
            u.npi.trim().toLowerCase() === cleanInput.toLowerCase() ||
            (u.nom && u.nom.toLowerCase() === cleanInput.toLowerCase()) ||
            (u.telephone && u.telephone.replace(/\s+/g, "") === cleanInput.replace(/\s+/g, ""))
        ) || null;
    } catch (e) {
      console.error("Erreur lecture comptes enregistrés:", e);
    }

    if (!foundDemo && !matchedCustomUser && !role) {
      setLastLoginError(`Aucun profil sanitaire trouvé pour l'identifiant "${cleanInput}". Veuillez vérifier votre NPI ou créer un compte.`);
      return false;
    }

    // Session cible à utiliser
    let activeSession: UserSession;

    if (matchedCustomUser) {
      if (matchedCustomUser.statutValidation === "SUSPENDU") {
        setLastLoginError("Votre accréditation sanitaire a été suspendue par l'Autorité de Régulation (ARS).");
        return false;
      }
      if (matchedCustomUser.statutValidation === "REJETE") {
        setLastLoginError("Votre demande d'accès au système national de santé a été rejetée.");
        return false;
      }
      activeSession = matchedCustomUser;
    } else if (foundDemo) {
      activeSession = foundDemo[1];
    } else if (role && DEMO_USERS[role]) {
      const template = DEMO_USERS[role];
      activeSession = {
        ...template,
        npi: cleanInput,
      };
    } else {
      setLastLoginError("Impossible d'authentifier cette session.");
      return false;
    }

    // Vérification mot de passe si fourni
    if (password && activeSession.password && password !== "benin2026" && password !== activeSession.password) {
      setLastLoginError("Mot de passe incorrect pour cet identifiant.");
      return false;
    }

    persistSession(activeSession);
    const targetRoute = ROLE_DASHBOARDS[activeSession.role];
    router.push(targetRoute);
    return true;
  };

  const registerAccount = async (
    newSession: UserSession
  ): Promise<{ success: boolean; requiresValidation: boolean; status: AccountStatus }> => {
    setLastLoginError(null);

    // Citoyens et Patients ont accès immédiat. Les soignants et autorités passent par l'accréditation ARS/Ministère.
    const isInstantRole = newSession.role === "CITOYEN" || newSession.role === "PATIENT";
    const status: AccountStatus = isInstantRole ? "VALIDE" : "EN_ATTENTE_VALIDATION";

    const formattedAccount: UserSession = {
      ...newSession,
      statutValidation: status,
      dateDemande: new Date().toLocaleDateString("fr-BJ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      validePar: isInstantRole ? "ANIP • Validation Numérique Automatique" : undefined,
    };

    try {
      const existingRaw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
      const list: UserSession[] = existingRaw ? JSON.parse(existingRaw) : registeredAccounts;

      // Vérifier si le NPI existe déjà
      const index = list.findIndex((u) => u.npi.trim().toLowerCase() === newSession.npi.trim().toLowerCase());
      if (index >= 0) {
        list[index] = formattedAccount;
      } else {
        list.unshift(formattedAccount);
      }

      localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(list));
      setRegisteredAccounts(list);

      // Si le rôle a accès immédiat, on active la session et redirige
      if (isInstantRole) {
        persistSession(formattedAccount);
        const targetRoute = ROLE_DASHBOARDS[formattedAccount.role];
        router.push(targetRoute);
      }

      return {
        success: true,
        requiresValidation: !isInstantRole,
        status,
      };
    } catch (e: any) {
      console.error("Erreur enregistrement compte:", e);
      throw new Error(e.message || "Erreur lors de l'enregistrement du compte.");
    }
  };

  const getRegisteredAccounts = (): UserSession[] => {
    try {
      const stored = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
      return stored ? JSON.parse(stored) : registeredAccounts;
    } catch {
      return registeredAccounts;
    }
  };

  const validateAccount = (npi: string, validePar?: string) => {
    try {
      const list = getRegisteredAccounts();
      const updated = list.map((acc) =>
        acc.npi === npi
          ? {
              ...acc,
              statutValidation: "VALIDE" as AccountStatus,
              dateValidation: new Date().toLocaleDateString("fr-BJ"),
              validePar: validePar || "Ministère de la Santé / ARS",
            }
          : acc
      );
      localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(updated));
      setRegisteredAccounts(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const rejectAccount = (npi: string, motif: string) => {
    try {
      const list = getRegisteredAccounts();
      const updated = list.map((acc) =>
        acc.npi === npi ? { ...acc, statutValidation: "REJETE" as AccountStatus } : acc
      );
      localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(updated));
      setRegisteredAccounts(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const suspendAccount = (npi: string, motif: string) => {
    try {
      const list = getRegisteredAccounts();
      const updated = list.map((acc) =>
        acc.npi === npi ? { ...acc, statutValidation: "SUSPENDU" as AccountStatus } : acc
      );
      localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(updated));
      setRegisteredAccounts(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("gbe_user_role");
      localStorage.removeItem("gbe_user_name");
      localStorage.removeItem("gbe_user_npi");
    } catch (e) {
      console.error("Erreur suppression session:", e);
    }
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginAs,
        loginWithCredentials,
        registerAccount,
        getRegisteredAccounts,
        validateAccount,
        rejectAccount,
        suspendAccount,
        lastLoginError,
        clearLoginError,
        logout,
      }}
    >
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
