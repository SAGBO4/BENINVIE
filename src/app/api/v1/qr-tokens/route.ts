import { NextRequest, NextResponse } from "next/server";
import { generateSecureQrToken, SecureQrType, RoleSante } from "@/lib/qr-verify";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "ORDONNANCE") as SecureQrType;
  const id = searchParams.get("id") || "ORD-2026-001";
  const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  let qrData;

  if (type === "DONNEUR_HEMORA" || id.startsWith("HEM-")) {
    qrData = generateSecureQrToken(
      {
        type: "DONNEUR_HEMORA",
        id: id || "HEM-DON-8871",
        patientNpi: "NPI-CIT-1995-1029",
        patientNom: "SAGBOHAN Chantal",
        rolesAutorises: ["CNTS_AGENT", "MEDECIN", "SOIGNANT_URGENCE", "ADMIN", "ARS"],
        details: {
          groupeSanguin: "O+",
          rhesus: "POSITIF",
          nbDons: 8,
          dernierDon: "12 Janvier 2026",
          prochainDonEligible: "12 Mars 2026",
          statutDon: "APTE",
          pointsMoMo: 400,
          allergies: ["Pénicilline (réaction modérée)"],
          contactUrgence: {
            nom: "SAGBOHAN Bio",
            relation: "Conjoint",
            telephone: "+229 97 00 12 34",
          },
        },
      },
      baseUrl
    );
  } else if (id === "ORD-2026-002") {
    qrData = generateSecureQrToken(
      {
        type: "ORDONNANCE",
        id: "ORD-2026-002",
        patientNpi: "NPI-CIT-1995-1029",
        patientNom: "SAGBOHAN Chantal",
        patientAge: 31,
        prescripteur: {
          nom: "Dr. KOUASSI Florent",
          titre: "Gynécologue-Obstétricien",
          structure: "Centre de Santé Communal de Kalalé",
          matricule: "MS-MED-2018-091",
        },
        rolesAutorises: ["PHARMACIEN", "ADMIN"],
        details: {
          medicaments: [
            {
              nom: "Sulfadoxine-Pyriméthamine 500mg/25mg (TPIg)",
              dosage: "3 comprimés prise unique",
              posologie: "Prise sous observation directe (TPIg 2)",
              quantite: 3,
              remboursement: "100% Gratuité Paludisme Grossesse (0 FCFA)",
            },
            {
              nom: "Moustiquaire Imprégnée à Longue Durée d'Action (MILDA)",
              dosage: "Modèle standard OMS",
              posologie: "Installation immédiate couchage",
              quantite: 1,
              remboursement: "100% Programme National Lutte Paludisme (0 FCFA)",
            },
          ],
        },
      },
      baseUrl
    );
  } else {
    // ORD-2026-001 par défaut
    qrData = generateSecureQrToken(
      {
        type: "ORDONNANCE",
        id: "ORD-2026-001",
        patientNpi: "NPI-CIT-1995-1029",
        patientNom: "SAGBOHAN Chantal",
        patientAge: 31,
        prescripteur: {
          nom: "Dr. DOSSOU-YOVO Marcel",
          titre: "Médecin Généraliste / Chef de Clinique",
          structure: "Hôpital de Zone de Nikki / Kalalé",
          matricule: "MS-MED-2015-388",
        },
        rolesAutorises: ["PHARMACIEN", "ADMIN"],
        details: {
          medicaments: [
            {
              nom: "Fer + Acide Folique 60mg / 400µg",
              dosage: "1 comprimé par jour",
              posologie: "Au milieu du repas principal pendant 30 jours",
              quantite: 30,
              remboursement: "100% Prise en Charge ARCH (0 FCFA)",
            },
            {
              nom: "Calcium Vitamine D3 500mg",
              dosage: "1 comprimé à croquer par jour",
              posologie: "À distance des prises de fer (matin)",
              quantite: 30,
              remboursement: "100% Tiers-Payant Mutuelle (0 FCFA)",
            },
          ],
        },
      },
      baseUrl
    );
  }

  return NextResponse.json({
    success: true,
    data: qrData,
  });
}
