import { createHash, randomBytes } from "crypto";

/**
 * Construit un hachage salé SHA-256 sécurisé pour le profil donneur.
 * Respecte les exigences APDP :
 * - Le sel aléatoire de 32 octets reste dans la base chiffrée.
 * - Aucune donnée en clair n'apparaît dans l'empreinte publique.
 * - Le droit à l'oubli est garanti : la purge du sel rend l'empreinte indéchiffrable.
 */
export function buildProfileHash(
  profileData: Record<string, any>,
  saltBuffer: Buffer = randomBytes(32)
): { hash: string; salt: string } {
  // Tri canonique des clés JSON
  const sortedKeys = Object.keys(profileData).sort();
  const canonicalObj = sortedKeys.reduce((acc, key) => {
    acc[key] = profileData[key];
    return acc;
  }, {} as Record<string, any>);

  const canonicalJson = JSON.stringify(canonicalObj);
  const dataBuffer = Buffer.from(canonicalJson, "utf8");

  const hash = createHash("sha256")
    .update(Buffer.concat([saltBuffer, dataBuffer]))
    .digest("hex");

  return {
    hash: `0x${hash}`,
    salt: saltBuffer.toString("hex"),
  };
}

/**
 * Vérifie l'empreinte d'un profil à partir des données et du sel d'origine
 */
export function verifyProfileHash(
  profileData: Record<string, any>,
  saltHex: string,
  expectedHash: string
): boolean {
  const saltBuffer = Buffer.from(saltHex, "hex");
  const computed = buildProfileHash(profileData, saltBuffer);
  return computed.hash.toLowerCase() === expectedHash.toLowerCase();
}

/**
 * Calcule l'empreinte cryptographique SHA-256 pour une ordonnance à usage unique
 */
export function computeOrdonnanceHash(codeOrdonnance: string, patientNpi: string, prescripteurNpi: string, dateEmission: string): string {
  const raw = `${codeOrdonnance}|${patientNpi}|${prescripteurNpi}|${dateEmission}`;
  const digest = createHash("sha256").update(raw).digest("hex");
  return `0x${digest}`;
}

/**
 * Simule l'ancrage Merkle périodique sur Bitcoin via OpenTimestamps (OTS)
 */
export function simulateOpenTimestampsAnchor(hashes: string[]): {
  merkleRoot: string;
  bitcoinBlockEstimation: number;
  statut: "CONFIRME" | "EN_ATTENTE";
  otsProof: string;
} {
  const sortedHashes = [...hashes].sort();
  const combined = sortedHashes.join("::");
  const merkleRoot = `0x${createHash("sha256").update(combined).digest("hex")}`;

  return {
    merkleRoot,
    bitcoinBlockEstimation: 890124,
    statut: "CONFIRME",
    otsProof: `OTS-PROOF-BTC-BENIN-2026-${merkleRoot.slice(2, 18)}`,
  };
}
