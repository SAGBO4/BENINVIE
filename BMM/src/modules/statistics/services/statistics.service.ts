import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BloodAvailability = {
  bloodType: string;
  /** Unités disponibles sur l'ensemble du réseau, tous composants confondus. */
  units: number;
  /** Part du niveau cible, entre 0 et 100. */
  level: number;
  status: "critique" | "faible" | "stable";
};

export type PublicStatistics = {
  donorsRegistered: number;
  organizations: number;
  citiesCovered: number;
  activeCampaigns: number;
  activeEmergencies: number;
  donationsRecorded: number;
  /**
   * Niveaux par groupe. Vide tant qu'aucune structure n'a déclaré de stock:
   * une grille de zéros se lirait « tous les groupes sont en rupture », ce
   * qui est faux quand la donnée est simplement absente.
   */
  availability: BloodAvailability[];
  /** Villes où une structure partenaire est installée. */
  cities: string[];
};

export const BLOOD_TYPES_ORDER = [
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+",
] as const;

/**
 * Niveau cible par groupe: on ne peut pas exprimer un pourcentage de réserve
 * sans référence. Faute d'objectif national déclaré, on rapporte le stock au
 * plus fort stock observé, ce qui donne une lecture relative honnête.
 */
function toAvailability(unitsByType: Map<string, number>): BloodAvailability[] {
  const max = Math.max(1, ...unitsByType.values());

  return BLOOD_TYPES_ORDER.map((bloodType) => {
    const units = unitsByType.get(bloodType) ?? 0;
    const level = Math.round((units / max) * 100);
    const status = level < 25 ? "critique" : level < 55 ? "faible" : "stable";
    return { bloodType, units, level, status };
  });
}

export const statisticsService = {
  /**
   * Chiffres publics de la plateforme. Aucune donnée nominative n'en sort:
   * uniquement des agrégats destinés à la page d'accueil.
   *
   * Lève si la base ne répond pas: renvoyer des zéros ferait passer une panne
   * pour une plateforme vide, et la page d'accueil afficherait « 0 donneur,
   * tous les groupes en rupture » alors que rien n'est su.
   */
  getPublicStatistics: async (): Promise<PublicStatistics> => {
    const supabase = await createSupabaseServerClient();

    const [donors, organizations, campaigns, emergencies, stock, activities] =
      await Promise.all([
        // Seul le compte nous intéresse ici: `head` évite de rapatrier des
        // milliers de lignes pour en compter le nombre.
        supabase
          .from("donors")
          .select("id", { count: "exact", head: true })
          .eq("validated", true),
        // Les villes sont déduites des structures partenaires, pas des
        // donneurs: PostgREST plafonne une réponse à 1000 lignes, et la liste
        // des villes des donneurs aurait été silencieusement tronquée passé ce
        // seuil. Une ville « couverte » est de toute façon une ville où une
        // structure peut recevoir un don.
        supabase.from("organizations").select("city", { count: "exact" }),
        supabase
          .from("campaigns")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("emergencies")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase.from("stock").select("blood_type, units"),
        supabase
          .from("donor_activities")
          .select("id", { count: "exact", head: true })
          .eq("activity_type", "blood_donation"),
      ]);

    const firstError = [
      donors.error,
      organizations.error,
      campaigns.error,
      emergencies.error,
      stock.error,
      activities.error,
    ].find(Boolean);

    if (firstError) {
      throw new Error(
        `Statistiques indisponibles: ${firstError.message ?? "erreur base de données"}`,
      );
    }

    const unitsByType = new Map<string, number>();
    for (const row of (stock.data ?? []) as {
      blood_type: string;
      units: number;
    }[]) {
      unitsByType.set(
        row.blood_type,
        (unitsByType.get(row.blood_type) ?? 0) + row.units,
      );
    }

    const cities = new Set<string>();
    for (const row of (organizations.data ?? []) as { city: string | null }[]) {
      if (row.city) cities.add(row.city);
    }

    return {
      donorsRegistered: donors.count ?? 0,
      organizations: organizations.count ?? 0,
      citiesCovered: cities.size,
      activeCampaigns: campaigns.count ?? 0,
      activeEmergencies: emergencies.count ?? 0,
      donationsRecorded: activities.count ?? 0,
      availability: unitsByType.size === 0 ? [] : toAvailability(unitsByType),
      cities: [...cities].sort((a, b) => a.localeCompare(b, "fr")),
    };
  },
};
