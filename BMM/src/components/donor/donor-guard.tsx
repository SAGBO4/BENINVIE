"use client";

import { Droplet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/providers/auth-provider";

/**
 * Protège l'espace donneur: redirige vers la connexion donneur si personne
 * n'est connecté, et renvoie une structure ou un administrateur vers son
 * tableau de bord (séparation stricte des rôles).
 */
export function DonorGuard({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  const blocked =
    !isLoading &&
    (!isAuthenticated ||
      user?.role === "org_admin" ||
      user?.role === "super_admin");

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/connexion-donneur");
    } else if (user?.role === "org_admin" || user?.role === "super_admin") {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || blocked) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Droplet className="text-primary size-8 animate-pulse" />
        <span className="sr-only">Chargement de votre espace…</span>
      </div>
    );
  }

  return <>{children}</>;
}
