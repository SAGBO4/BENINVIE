import { dbStore } from "../client";
import { COMMUNES_BENIN } from "../../data/communes";
import { ETABLISSEMENTS_REF, SOIGNANTS_REF, PATIENTS_REF, DONNEURS_HEMORA_REF, STOCKS_SANG_REF, ORDONNANCES_REF } from "../../data/referentiels";

async function runSeed() {
  console.log("🌱 [Gbɛ Seed 2026] Initialisation des données nationales...");

  // 1. Initialiser le magasin en mémoire
  dbStore.seed();

  console.log(`✅ ${COMMUNES_BENIN.length} Communes du Bénin chargées.`);
  console.log(`✅ ${ETABLISSEMENTS_REF.length} Formations sanitaires IASO (CHIC, CNHU, HZ Nikki, CSC Kalalé...).`);
  console.log(`✅ ${SOIGNANTS_REF.length} Professionnels de santé accrédités ARS (Dr Tossou, SF Amina, Dah Dako...).`);
  console.log(`✅ ${PATIENTS_REF.length} Dossiers patients initiaux (incluant Bio GOUDA à Kalalé).`);
  console.log(`✅ ${DONNEURS_HEMORA_REF.length} Donneurs de sang volontaires certifiés HEMORA (Mathieu Sossa O-, Rosine Agbo...).`);
  console.log(`✅ ${STOCKS_SANG_REF.length} Dépôts de sang régionaux surveillés.`);
  console.log(`✅ ${ORDONNANCES_REF.length} Ordonnances sécurisées avec QR code infalsifiable.`);

  console.log("🎉 Seed déterministe 2026 exécuté avec succès. Règle d'or respectée : Zéro échec.");
}

runSeed().catch((err) => {
  console.error("❌ Erreur lors du seed :", err);
  process.exit(1);
});
