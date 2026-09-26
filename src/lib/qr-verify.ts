import { createHmac, createHash, timingSafeEqual } from "crypto";

// Clé secrète de scellement cryptographique BENINVIE (en production, issue des variables d'environnement)
const QR_SIGNING_SECRET = process.env.BENINVIE_QR_SECRET || "beninvie-republique-du-benin-anip-cnts-secret-key-2026";

export type SecureQrType = "ORDONNANCE" | "DONNEUR_HEMORA" | "DOSSIER_PATIENT" | "URGENCE_VITALE";

export type RoleSante = "CITOYEN" | "PHARMACIEN" | "MEDECIN" | "SAGE_FEMME" | "AGENT_COMMUNAUTAIRE" | "CNTS_AGENT" | "SOIGNANT_URGENCE" | "ADMIN" | "ARS";

export interface SecureQrPayload {
  version: "1.0";
  type: SecureQrType;
  id: string; // Ex: ORD-2026-001, HEM-DON-8871
  patientNpi: string;
  patientNom: string;
  patientAge?: number;
  prescripteur?: {
    nom: string;
    titre: string;
    structure: string;
    matricule: string;
  };
  details: {
    medicaments?: Array<{
      nom: string;
      dosage: string;
      posologie: string;
      quantite: number;
      remboursement: string;
    }>;
    groupeSanguin?: string;
    rhesus?: string;
    nbDons?: number;
    dernierDon?: string;
    prochainDonEligible?: string;
    statutDon?: "APTE" | "AJOURNE" | "RESERVATION_REQUISE";
    pointsMoMo?: number;
    allergies?: string[];
    contactUrgence?: {
      nom: string;
      relation: string;
      telephone: string;
    };
    diagnosticUrgence?: string;
  };
  rolesAutorises: RoleSante[];
  issuedAt: string;
  expiresAt: string;
  otsProof: string;
  sha256Seal: string;
}

export interface GeneratedQrData {
  token: string;
  verificationUrl: string;
  payload: SecureQrPayload;
  sha256Seal: string;
}

/**
 * Encode en base64url sans padding
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Décode le base64url
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

/**
 * Signe un payload avec HMAC-SHA256
 */
function computeSignature(payloadString: string): string {
  return createHmac("sha256", QR_SIGNING_SECRET)
    .update(payloadString)
    .digest("hex");
}

/**
 * Calcule l'empreinte publique SHA-256 du document pour la traçabilité
 */
export function computeDocumentSeal(id: string, patientNpi: string, type: string, issuedAt: string): string {
  const raw = `BENINVIE::${type}::${id}::${patientNpi}::${issuedAt}`;
  return "0x" + createHash("sha256").update(raw).digest("hex");
}

/**
 * Génère un jeton QR sécurisé, scellé cryptographiquement et son URL officielle
 */
export function generateSecureQrToken(
  data: Omit<SecureQrPayload, "version" | "issuedAt" | "expiresAt" | "otsProof" | "sha256Seal">,
  baseUrl: string = ""
): GeneratedQrData {
  const now = new Date();
  const issuedAt = now.toISOString();
  
  // Expiration par défaut : 30 jours pour ordonnance, 365 jours pour passeport donneur
  const expirationDays = data.type === "ORDONNANCE" ? 30 : 365;
  const expiresAt = new Date(now.getTime() + expirationDays * 24 * 3600 * 1000).toISOString();
  
  const seal = computeDocumentSeal(data.id, data.patientNpi, data.type, issuedAt);
  const otsProof = `OTS-BTC-BJ-2026-${seal.slice(2, 14).toUpperCase()}`;

  const fullPayload: SecureQrPayload = {
    version: "1.0",
    ...data,
    issuedAt,
    expiresAt,
    otsProof,
    sha256Seal: seal,
  };

  const payloadString = JSON.stringify(fullPayload);
  const encodedPayload = base64UrlEncode(payloadString);
  const signature = computeSignature(encodedPayload);

  const token = `${encodedPayload}.${signature}`;
  
  // URL de vérification directe
  const prefix = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
  const verificationUrl = `${prefix}/verify?token=${token}`;

  return {
    token,
    verificationUrl,
    payload: fullPayload,
    sha256Seal: seal,
  };
}

/**
 * Vérifie l'authenticité d'un token QR et le décrypte.
 * Renvoie le payload ou null si falsifié / altéré.
 */
export function verifyQrToken(token: string): {
  isValid: boolean;
  isExpired: boolean;
  error?: string;
  payload?: SecureQrPayload;
} {
  try {
    if (!token || typeof token !== "string") {
      return { isValid: false, isExpired: false, error: "Jeton manquant ou format invalide" };
    }

    const parts = token.split(".");
    if (parts.length !== 2) {
      return { isValid: false, isExpired: false, error: "Format du jeton cryptographique non conforme" };
    }

    const [encodedPayload, receivedSignature] = parts;
    const expectedSignature = computeSignature(encodedPayload);

    // Comparaison en temps constant pour prévenir les attaques temporelles (timing attacks)
    const sigA = Buffer.from(receivedSignature, "utf8");
    const sigB = Buffer.from(expectedSignature, "utf8");

    if (sigA.length !== sigB.length || !timingSafeEqual(sigA, sigB)) {
      return { isValid: false, isExpired: false, error: "Signature cryptographique invalide : document potentiellement falsifié !" };
    }

    const decodedString = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(decodedString) as SecureQrPayload;

    // Vérification de la date d'expiration
    const now = new Date().getTime();
    const expiry = new Date(payload.expiresAt).getTime();
    const isExpired = now > expiry;

    return {
      isValid: true,
      isExpired,
      payload,
    };
  } catch (err: any) {
    return {
      isValid: false,
      isExpired: false,
      error: `Erreur de décodage cryptographique : ${err?.message || "Token corrompu"}`,
    };
  }
}

/**
 * Vérifie si l'acteur demandeur possède le droit d'accès légal au document
 */
export function hasRequiredAccessRole(userRole: string | undefined, payload: SecureQrPayload): boolean {
  if (!userRole) return false;
  // Les admins et ARS ont accès de supervision d'office
  if (userRole === "ADMIN" || userRole === "ARS") return true;

  // Normalisation
  const normalized = userRole.toUpperCase().replace(/\s+/g, "_") as RoleSante;
  return payload.rolesAutorises.includes(normalized);
}
