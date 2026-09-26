function generateSimId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export interface SimulatedPaymentResult {
  success: boolean;
  referenceTransaction: string;
  operateur: "MTN_MOMO" | "MOOV_MONEY" | "CELTIIS";
  telephone: string;
  montantFcfa: number;
  motif: string;
  timestamp: string;
}

export interface SimulatedSmsResult {
  id: string;
  destinataireTelephone: string;
  expediteur: string;
  message: string;
  langue: "fr" | "bariba" | "fon" | "yoruba" | "dendi";
  statut: "LIVRE" | "EN_COURS";
  timestamp: string;
}

export interface SimulatedIvrResult {
  id: string;
  destinataireTelephone: string;
  langue: "bariba" | "fon" | "yoruba" | "dendi" | "fr";
  audioTitre: string;
  transcriptionFr: string;
  dureeSecondes: number;
  statut: "DECROCHE_ET_ECOUTE";
  timestamp: string;
}

/**
 * Exécute un paiement Mobile Money simulé mais persistant
 */
export function executeSimulatedPayment(params: {
  operateur: "MTN_MOMO" | "MOOV_MONEY" | "CELTIIS";
  telephone: string;
  montantFcfa: number;
  motif: string;
}): SimulatedPaymentResult {
  const refId = `MOMO-BJ-2026-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    success: true,
    referenceTransaction: refId,
    operateur: params.operateur,
    telephone: params.telephone,
    montantFcfa: params.montantFcfa,
    motif: params.motif,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Envoie une notification SMS simulée
 */
export function sendSimulatedSms(params: {
  telephone: string;
  message: string;
  langue?: "fr" | "bariba" | "fon" | "yoruba" | "dendi";
  expediteur?: string;
}): SimulatedSmsResult {
  return {
    id: `SMS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    destinataireTelephone: params.telephone,
    expediteur: params.expediteur || "SANTE-BENIN",
    message: params.message,
    langue: params.langue || "fr",
    statut: "LIVRE",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Déclenche un appel vocal interactif IVR en langue locale
 */
export function triggerSimulatedIvrCall(params: {
  telephone: string;
  langue: "bariba" | "fon" | "yoruba" | "dendi" | "fr";
  audioTitre: string;
  transcriptionFr: string;
}): SimulatedIvrResult {
  return {
    id: `IVR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    destinataireTelephone: params.telephone,
    langue: params.langue,
    audioTitre: params.audioTitre,
    transcriptionFr: params.transcriptionFr,
    dureeSecondes: 45,
    statut: "DECROCHE_ET_ECOUTE",
    timestamp: new Date().toISOString(),
  };
}
