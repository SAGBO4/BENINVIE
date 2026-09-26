"use client";

import {
  Building2,
  FileText,
  Heart,
  IdCard,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { ContentEditor } from "@/components/admin/content-editor";
import { AdminOverview } from "@/components/admin/admin-overview";
import { CardRequestsPanel } from "@/components/app/card-requests-panel";
import { DonationsPanel } from "@/components/app/donations-panel";
import { OrganizationsReview } from "@/components/app/organizations-review";
import { cn } from "@/lib/utils";

type TabId = "overview" | "organisations" | "cartes" | "dons" | "contenu";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutGrid },
  { id: "organisations", label: "Organisations", icon: Building2 },
  { id: "cartes", label: "Demandes de cartes", icon: IdCard },
  { id: "dons", label: "Dons reçus", icon: Heart },
  { id: "contenu", label: "Pages du site", icon: FileText },
];

/**
 * Console d'administration de la plateforme.
 *
 * Tout ce que le super-administrateur pilote tient ici, en onglets, plutôt
 * que dispersé sur des écrans qu'il fallait connaître pour les trouver.
 * L'onglet « Pages du site » lui permet de corriger les textes légaux sans
 * toucher au code ni attendre un déploiement.
 */
export function AdminConsole() {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div className="space-y-8">
      <nav
        aria-label="Sections de l'administration"
        className="border-border -mx-1 flex gap-1 overflow-x-auto border-b px-1"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = id === tab;
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => setTab(id)}
              className={cn(
                "focus-visible:ring-ring -mb-px flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                active
                  ? "border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          );
        })}
      </nav>

      {tab === "overview" && <AdminOverview onNavigate={setTab} />}
      {tab === "organisations" && <OrganizationsReview />}
      {tab === "cartes" && <CardRequestsPanel />}
      {tab === "dons" && <DonationsPanel />}
      {tab === "contenu" && <ContentEditor />}
    </div>
  );
}
