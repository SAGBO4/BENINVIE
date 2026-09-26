import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BloodComponent = "CGR" | "Plasma" | "Plaquettes";

export type StockRecord = {
  id: string;
  hospitalId: string;
  component: BloodComponent;
  bloodType: string;
  units: number;
  expiringSoon: number;
  updatedAt: Date;
};

type StockRow = {
  id: string;
  hospital_id: string;
  component: BloodComponent;
  blood_type: string;
  units: number;
  expiring_soon: number;
  updated_at: string;
};

function mapStock(row: StockRow): StockRecord {
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    component: row.component,
    bloodType: row.blood_type,
    units: row.units,
    expiringSoon: row.expiring_soon,
    updatedAt: new Date(row.updated_at),
  };
}

export const stockService = {
  /** Stock d'une structure, par composant et groupe sanguin. */
  getHospitalStock: async (hospitalId: string): Promise<StockRecord[]> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("stock")
      .select("*")
      .eq("hospital_id", hospitalId);

    if (error || !data) return [];
    return (data as StockRow[]).map(mapStock);
  },

  /**
   * Fixe le niveau d'un poste de stock d'une structure, en le créant s'il
   * n'existe pas encore. La grille compte 24 combinaisons (3 composants x 8
   * groupes) et une structure n'en a presque jamais 24 en base: sans
   * création à la volée, il serait impossible de saisir un premier niveau.
   */
  setUnits: async (input: {
    hospitalId: string;
    component: BloodComponent;
    bloodType: string;
    units: number;
    expiringSoon: number;
  }): Promise<StockRecord> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("stock")
      .upsert(
        {
          hospital_id: input.hospitalId,
          component: input.component,
          blood_type: input.bloodType,
          units: input.units,
          expiring_soon: input.expiringSoon,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "hospital_id,component,blood_type" },
      )
      .select()
      .single();

    if (error || !data) {
      throw new Error(
        error?.message ?? "Erreur lors de la mise à jour du stock.",
      );
    }
    return mapStock(data as StockRow);
  },

  /** Ajuste le niveau d'un poste de stock existant, par identifiant. */
  updateUnits: async (
    id: string,
    units: number,
  ): Promise<StockRecord | null> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("stock")
      .update({ units, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error updating stock:", error);
      throw new Error("Erreur lors de la mise à jour du stock");
    }
    return mapStock(data as StockRow);
  },
};
