import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "@/lib/supabase/server";

export type OrganizationRecord = {
  id: string;
  name: string;
  type: "hospital" | "ngo" | "blood_center";
  latitude: number;
  longitude: number;
  city: string;
  contactEmail: string;
  verified: boolean;
  rejectionReason: string | null;
  createdAt: Date;
};

type OrgRow = {
  id: string;
  name: string;
  type: OrganizationRecord["type"];
  latitude: number;
  longitude: number;
  city: string;
  contact_email: string;
  verified: boolean;
  rejection_reason: string | null;
  created_at: string;
};

function mapOrg(row: OrgRow): OrganizationRecord {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    latitude: row.latitude,
    longitude: row.longitude,
    city: row.city,
    contactEmail: row.contact_email,
    verified: row.verified,
    rejectionReason: row.rejection_reason ?? null,
    createdAt: new Date(row.created_at),
  };
}

export const organizationService = {
  /** Liste toutes les organisations (réservé au super-admin). */
  getAllOrganizations: async (): Promise<OrganizationRecord[]> => {
    // Réservé au super-admin (contrôle d'accès dans la route). On lit via le
    // client admin pour être insensible au RLS.
    const supabase =
      createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return (data as OrgRow[]).map(mapOrg);
  },

  /** Marque une organisation comme vérifiée. */
  verifyOrganization: async (
    id: string,
  ): Promise<OrganizationRecord | null> => {
    const supabase =
      createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    const { data, error } = await supabase
      .from("organizations")
      .update({ verified: true, rejection_reason: null })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error verifying organization:", error);
      throw new Error("Erreur lors de la vérification de l'organisation");
    }
    return mapOrg(data as OrgRow);
  },

  /** Rejette une organisation en consignant le motif. */
  rejectOrganization: async (
    id: string,
    reason: string,
  ): Promise<OrganizationRecord | null> => {
    const supabase =
      createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    const { data, error } = await supabase
      .from("organizations")
      .update({ verified: false, rejection_reason: reason })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error rejecting organization:", error);
      throw new Error("Erreur lors du rejet de l'organisation");
    }
    return mapOrg(data as OrgRow);
  },

  /* --------------------- Compte d'approvisionnement -------------------- */

  /** Solde de récompenses de la structure (en satoshis). */
  getBalance: async (id: string): Promise<number> => {
    const supabase =
      createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    const { data } = await supabase
      .from("organizations")
      .select("balance_sats")
      .eq("id", id)
      .maybeSingle();
    return data?.balance_sats ?? 0;
  },

  /**
   * Ajuste le solde de la structure. `amount` positif recharge, négatif débite.
   * Le solde ne descend jamais sous zéro. Renvoie le nouveau solde, ou null
   * si l'organisation n'existe pas. Toute autre situation anormale (montant
   * invalide, solde insuffisant, conflit de concurrence, erreur DB) lève une
   * erreur explicite plutôt que de renvoyer null, pour ne jamais confondre
   * « organisation introuvable » avec un échec opérationnel.
   */
  adjustBalance: async (id: string, amount: number): Promise<number | null> => {
    // `balance_sats` est une colonne INTEGER (satoshis) : on borne les
    // montants acceptés à la plage signée 32 bits pour éviter qu'un montant
    // hors limites échoue de façon opaque côté base de données.
    const PG_INT32_MAX = 2147483647;

    if (typeof id !== "string" || id.trim().length === 0) {
      throw new Error("Identifiant d'organisation invalide");
    }
    if (!Number.isFinite(amount)) {
      throw new Error("Montant invalide pour l'ajustement du solde");
    }
    if (!Number.isInteger(amount)) {
      throw new Error("Le montant doit être un nombre entier de satoshis");
    }
    if (Math.abs(amount) > PG_INT32_MAX) {
      throw new Error("Montant hors limites autorisées");
    }

    const supabase =
      createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    const { data: org } = await supabase
      .from("organizations")
      .select("balance_sats")
      .eq("id", id)
      .maybeSingle();
    if (!org) return null;

    if (org.balance_sats === null || org.balance_sats === undefined) {
      console.warn(
        `Organisation ${id} : balance_sats est null/undefined en base, traité comme 0`,
      );
    }
    const current = org.balance_sats ?? 0;

    if (amount < 0 && current + amount < 0) {
      throw new Error("Solde insuffisant pour effectuer ce débit");
    }
    const next = Math.max(0, current + amount);
    if (next > PG_INT32_MAX) {
      throw new Error("Solde maximum autorisé dépassé");
    }

    // Verrou optimiste : n'applique la mise à jour que si le solde n'a pas
    // changé depuis la lecture, pour limiter la fenêtre de course sur deux
    // débits concurrents.
    const { data: updated, error } = await supabase
      .from("organizations")
      .update({ balance_sats: next })
      .eq("id", id)
      .eq("balance_sats", current)
      .select("balance_sats")
      .single();
    if (error || !updated) {
      console.error("Error adjusting organization balance:", error);
      throw new Error(
        "Impossible de mettre à jour le solde (conflit de concurrence ou erreur base de données), veuillez réessayer",
      );
    }
    return updated.balance_sats;
  },
};
