import { describe, it, expect } from "vitest";
import {
  signActorToken,
  verifyActorToken,
  authenticateRequest,
  AuthenticationError,
  AuthorizationError,
  AuthenticatedActor,
} from "../lib/auth-guard";
import { rechercherDonneursCompatibles } from "../services/hemora.service";
import { NextRequest } from "next/server";

describe("Banc de Torture RBAC & Cryptographie de Session (Conformité APDP)", () => {
  const MEDECIN_ACTOR: AuthenticatedActor = {
    npi: "NPI-MED-2026-004",
    nom: "MENSAH",
    prenom: "Dr. Bienvenu",
    role: "MEDECIN",
    etablissementNom: "Hôpital de Zone de Nikki",
  };

  const CITOYEN_ACTOR: AuthenticatedActor = {
    npi: "NPI-CIT-1995-1029",
    nom: "KORA",
    prenom: "Sabi",
    role: "CITOYEN",
  };

  describe("1. Cryptographie HMAC-SHA256 & Intégrité des Jetons", () => {
    it("Génère et valide un jeton authentique pour un médecin", () => {
      const token = signActorToken(MEDECIN_ACTOR);
      expect(typeof token).toBe("string");
      expect(token.includes(".")).toBe(true);

      const verified = verifyActorToken(token);
      expect(verified.npi).toBe(MEDECIN_ACTOR.npi);
      expect(verified.role).toBe("MEDECIN");
    });

    it("Détecte et bloque immédiatement toute altération de signature (Bit-flipping)", () => {
      const token = signActorToken(MEDECIN_ACTOR);
      const [payload, sig] = token.split(".");
      // Altération d'un seul caractère de la signature HMAC
      const falsifiedSig = sig.endsWith("a") ? `${sig.slice(0, -1)}b` : `${sig.slice(0, -1)}a`;
      const tamperedToken = `${payload}.${falsifiedSig}`;

      expect(() => verifyActorToken(tamperedToken)).toThrow(AuthenticationError);
    });

    it("Rejette les jetons tronqués, nuls ou vides", () => {
      // @ts-expect-error test coercition
      expect(() => verifyActorToken(null)).toThrow(AuthenticationError);
      expect(() => verifyActorToken("")).toThrow(AuthenticationError);
      expect(() => verifyActorToken("payloadSansPoint")).toThrow(AuthenticationError);
    });
  });

  describe("2. Guard RBAC & Cloisonnement des Privilèges Sanitaires", () => {
    it("Autorise un médecin sur une ressource médicale", async () => {
      const token = signActorToken(MEDECIN_ACTOR);
      const req = new NextRequest("http://localhost:3000/api/v1/encounters/bris-de-glace", {
        headers: { authorization: `Bearer ${token}` },
      });

      const actor = await authenticateRequest(req, ["MEDECIN", "MINISTERE"]);
      expect(actor.role).toBe("MEDECIN");
      expect(actor.npi).toBe(MEDECIN_ACTOR.npi);
    });

    it("Rejette impérativement un citoyen tentant d'accéder à une ressource réservée aux médecins", async () => {
      const token = signActorToken(CITOYEN_ACTOR);
      const req = new NextRequest("http://localhost:3000/api/v1/encounters/bris-de-glace", {
        headers: { authorization: `Bearer ${token}` },
      });

      await expect(authenticateRequest(req, ["MEDECIN", "MINISTERE"])).rejects.toThrow(AuthorizationError);
    });
  });

  describe("3. Optimisation Spatiale Bounding Box sur PostgreSQL Neon", () => {
    it("Calcule et restreint les donneurs dans un périmètre géodésique strict", async () => {
      // Coordonnées de Parakou : lat 9.3372, lng 2.6303
      const donneurs = await rechercherDonneursCompatibles({
        groupeRequis: "O+",
        lat: 9.3372,
        lng: 2.6303,
        rayonKm: 200,
      });

      expect(Array.isArray(donneurs)).toBe(true);
      // Tous les donneurs retournés doivent respecter la borne de distance
      for (const d of donneurs) {
        expect(d.distanceKm).toBeLessThanOrEqual(200);
      }

      // Doivent être triés par distance croissante (le plus proche en premier)
      for (let i = 0; i < donneurs.length - 1; i++) {
        expect(donneurs[i].distanceKm).toBeLessThanOrEqual(donneurs[i + 1].distanceKm);
      }
    });
  });
});
