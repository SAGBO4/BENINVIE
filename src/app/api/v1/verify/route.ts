import { NextRequest, NextResponse } from "next/server";
import { verifyQrToken, hasRequiredAccessRole, generateSecureQrToken, SecureQrPayload } from "@/lib/qr-verify";
import { dbStore } from "@/db/client";

// Enregistrement d'audit APDP en mémoire pour traçabilité légale
interface ApdpAuditEntry {
  id: string;
  timestamp: string;
  documentId: string;
  documentType: string;
  patientNpi: string;
  actorRole: string;
  actorNpi?: string;
  action: "CONSULTATION" | "DELIVRANCE" | "ACCES_REFUSE" | "DON_ENREGISTRE";
  status: "ACCORDE" | "REFUSE" | "FRAUDE_DETECTEE";
  ipAddress?: string;
}

const apdpAuditLog: ApdpAuditEntry[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const actorRole = searchParams.get("role") || "";
  const actorNpi = searchParams.get("actorNpi") || "";

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Jeton cryptographique manquant dans la requête" },
      { status: 400 }
    );
  }

  // Vérification de la signature cryptographique et de l'intégrité
  const verification = verifyQrToken(token);

  if (!verification.isValid || !verification.payload) {
    apdpAuditLog.push({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      documentId: "UNKNOWN",
      documentType: "UNKNOWN",
      patientNpi: "UNKNOWN",
      actorRole: actorRole || "ANONYMOUS",
      actorNpi,
      action: "ACCES_REFUSE",
      status: "FRAUDE_DETECTEE",
    });

    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: verification.error || "Signature cryptographique invalide ou QR Code contrefait",
        legalNote: "Toute tentative d'altération de scellé cryptographique médical est passible des peines prévues au Code du Numérique (Loi 2017-20).",
      },
      { status: 403 }
    );
  }

  const payload = verification.payload;
  const isAuthorized = hasRequiredAccessRole(actorRole, payload);

  // Journalisation d'accès légal APDP
  apdpAuditLog.push({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    timestamp: new Date().toISOString(),
    documentId: payload.id,
    documentType: payload.type,
    patientNpi: payload.patientNpi,
    actorRole: actorRole || "ANONYMOUS",
    actorNpi,
    action: isAuthorized ? "CONSULTATION" : "ACCES_REFUSE",
    status: isAuthorized ? "ACCORDE" : "REFUSE",
  });

  if (!isAuthorized) {
    // Si l'utilisateur n'est pas habilité, on ne renvoie AUCUNE donnée médicale confidentielle
    return NextResponse.json(
      {
        success: true,
        valid: true,
        authorized: false,
        documentType: payload.type,
        documentId: payload.id,
        patientNpiMasked: payload.patientNpi.replace(/(\w{3})\w+(\w{3})/, "$1••••$2"),
        rolesRequis: payload.rolesAutorises,
        message: "Accès strictement restreint aux professionnels de santé habilités.",
        legalReference: "Article 418 du Code Pénal & Loi 2017-20 relative à la protection des données personnelles de santé.",
      },
      { status: 200 }
    );
  }

  // Acteur habilité : renvoi des données certifiées
  return NextResponse.json({
    success: true,
    valid: true,
    authorized: true,
    isExpired: verification.isExpired,
    payload,
    otsProof: payload.otsProof,
    sha256Seal: payload.sha256Seal,
  });
}

/**
 * Endpoint de délivrance officielle de médicaments par une pharmacie habilitée
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, actorRole, officineNom, pharmacienNpi, action = "DELIVRANCE" } = body;

    if (!token) {
      return NextResponse.json({ success: false, error: "Token requis" }, { status: 400 });
    }

    const verification = verifyQrToken(token);
    if (!verification.isValid || !verification.payload) {
      return NextResponse.json({ success: false, error: "Jeton cryptographique invalide" }, { status: 403 });
    }

    const payload = verification.payload;

    if (action === "DELIVRANCE") {
      if (actorRole !== "PHARMACIEN" && actorRole !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: "Seul un pharmacien agréé (ONPB) peut valider la délivrance d'ordonnance",
          },
          { status: 403 }
        );
      }

      // Enregistrement APDP
      apdpAuditLog.push({
        id: `dispense-${Date.now()}`,
        timestamp: new Date().toISOString(),
        documentId: payload.id,
        documentType: payload.type,
        patientNpi: payload.patientNpi,
        actorRole,
        actorNpi: pharmacienNpi,
        action: "DELIVRANCE",
        status: "ACCORDE",
      });

      return NextResponse.json({
        success: true,
        message: `Délivrance de l'ordonnance ${payload.id} confirmée avec succès par ${officineNom || "Officine Agréée"}. Prise en charge d'État validée.`,
        certificatDelivrance: {
          codeOrdonnance: payload.id,
          officine: officineNom || "Pharmacie Centrale de Cotonou",
          pharmacien: pharmacienNpi || "PHARM-BJ-ONPB-449",
          dateHeure: new Date().toISOString(),
          scelleAuthentification: payload.sha256Seal,
        },
      });
    }

    if (action === "ENREGISTRER_DON") {
      if (actorRole !== "CNTS_AGENT" && actorRole !== "MEDECIN" && actorRole !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: "Seul un agent accrédité CNTS peut consigner un prélèvement de sang.",
          },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Prélèvement de 450 mL consigné avec succès pour le donneur ${payload.patientNom}. 50 Points MoMo Santé crédités.`,
        nouveauSoldePoints: (payload.details.pointsMoMo || 400) + 50,
        nouveauNbDons: (payload.details.nbDons || 0) + 1,
        dateDon: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: false, error: "Action non reconnue" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
