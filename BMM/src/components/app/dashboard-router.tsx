"use client";

import Link from "next/link";

import { DashboardOverview } from "@/components/app/dashboard-overview";
import { OrganizationOnboarding } from "@/components/app/organization-onboarding";
import { PageHeader } from "@/components/app/page-header";
import { AdminConsole } from "@/components/admin/admin-console";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

/** Aiguille vers le bon tableau de bord selon le rôle de l'utilisateur. */
export function DashboardRouter() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  // Une structure non encore vérifiée doit d'abord fournir ses justificatifs
  // et attendre la validation de l'administrateur.
  if (!isSuperAdmin && user?.organization && !user.organization.verified) {
    return (
      <>
        <PageHeader
          title="Validation de votre structure"
          description="Téléversez vos justificatifs pour être approuvé par l'administrateur."
        />
        <OrganizationOnboarding />
      </>
    );
  }

  if (isSuperAdmin) {
    return (
      <>
        <PageHeader
          title="Administration de la plateforme"
          description="Files d'attente, réseau et textes du site, au même endroit."
        />
        <AdminConsole />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble des urgences et campagnes de votre structure."
        actions={
          <Button asChild>
            <Link href="/alerts">Déclencher une alerte</Link>
          </Button>
        }
      />
      <DashboardOverview />
    </>
  );
}
