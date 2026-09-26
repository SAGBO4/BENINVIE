import { vi, describe, it, expect, beforeEach } from "vitest";
import { organizationService } from "./organization.service";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Suite adversariale ciblant organizationService.adjustBalance.
 * Objectif : casser la fonction, pas la valider. Voir le message de
 * conversation pour l'analyse des failles associées à chaque bloc.
 */

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
  createSupabaseAdminClient: vi.fn(),
}));

function mockAdjustBalanceClient(opts: {
  selectBalance: number | null | undefined;
  updateResult?: { data: { balance_sats: number } | null; error: unknown };
}) {
  const mockMaybeSingle = vi.fn().mockResolvedValue({
    data:
      opts.selectBalance === undefined
        ? null
        : { balance_sats: opts.selectBalance },
  });
  const mockSelectQuery = vi.fn(() => ({
    eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })),
  }));

  const mockUpdateSingle = vi.fn().mockResolvedValue(
    opts.updateResult ?? {
      data: { balance_sats: 0 },
      error: null,
    },
  );
  const mockUpdateSelect = vi.fn(() => ({ single: mockUpdateSingle }));
  const mockUpdateEqBalance = vi.fn(() => ({ select: mockUpdateSelect }));
  const mockUpdateEqId = vi.fn(() => ({ eq: mockUpdateEqBalance }));
  const mockUpdateQuery = vi.fn(() => ({ eq: mockUpdateEqId }));

  const mockFrom = vi.fn(() => ({
    select: mockSelectQuery,
    update: mockUpdateQuery,
  }));

  (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
    from: mockFrom,
  });

  return { mockUpdateQuery, mockUpdateEqId, mockUpdateEqBalance };
}

describe("organizationService.adjustBalance — cas limites / robustesse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Faille #1 (corrigée) — id invalide", () => {
    it("id vide lève une erreur explicite, sans requête DB", async () => {
      const fromSpy = vi.fn();
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: fromSpy,
      });

      await expect(organizationService.adjustBalance("", 100)).rejects.toThrow(
        "Identifiant d'organisation invalide",
      );
      expect(fromSpy).not.toHaveBeenCalled();
    });

    it("id undefined (contournement runtime du typage TS) lève la même erreur explicite", async () => {
      const fromSpy = vi.fn();
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: fromSpy,
      });

      await expect(
        // @ts-expect-error -- on simule un appelant JS non typé (body API mal validé)
        organizationService.adjustBalance(undefined, 100),
      ).rejects.toThrow("Identifiant d'organisation invalide");
      expect(fromSpy).not.toHaveBeenCalled();
    });
  });

  describe("Faille #2 (corrigée) — montants non entiers", () => {
    it("rejette un montant fractionnaire avant tout appel DB", async () => {
      const fromSpy = vi.fn();
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: fromSpy,
      });

      await expect(
        organizationService.adjustBalance("org-1", 0.5),
      ).rejects.toThrow("Le montant doit être un nombre entier de satoshis");
      expect(fromSpy).not.toHaveBeenCalled();
    });
  });

  describe("Faille #3 (corrigée) — null uniquement pour « org introuvable »", () => {
    it("un conflit du verrou optimiste (update ne matche 0 ligne) lève une erreur distincte, plus de null ambigu", async () => {
      // Simule un débit concurrent qui a déjà changé balance_sats entre le
      // SELECT et l'UPDATE : la clause .eq("balance_sats", current) ne
      // matche plus rien, .single() renvoie une erreur "no rows".
      mockAdjustBalanceClient({
        selectBalance: 200,
        updateResult: {
          data: null,
          error: {
            message: "JSON object requested, multiple (or no) rows returned",
          },
        },
      });

      await expect(
        organizationService.adjustBalance("org-1", -50),
      ).rejects.toThrow(
        "Impossible de mettre à jour le solde (conflit de concurrence ou erreur base de données), veuillez réessayer",
      );
    });

    it("une vraie erreur DB lève la même erreur distincte (jamais confondue avec « org introuvable »)", async () => {
      mockAdjustBalanceClient({
        selectBalance: 2_000_000_000,
        updateResult: {
          data: null,
          error: { message: "integer out of range" },
        },
      });

      await expect(
        organizationService.adjustBalance("org-1", 147_483_647),
      ).rejects.toThrow(
        "Impossible de mettre à jour le solde (conflit de concurrence ou erreur base de données), veuillez réessayer",
      );
    });

    it("null n'est renvoyé que si l'organisation n'existe pas au moment de la lecture", async () => {
      mockAdjustBalanceClient({ selectBalance: undefined });

      const result = await organizationService.adjustBalance(
        "org-inexistante",
        100,
      );

      expect(result).toBeNull();
    });
  });

  describe("Faille #4 — signe de zéro", () => {
    it("-0 est traité comme un crédit (pas un débit) sans throw", async () => {
      const { mockUpdateQuery } = mockAdjustBalanceClient({
        selectBalance: 100,
        updateResult: { data: { balance_sats: 100 }, error: null },
      });

      const result = await organizationService.adjustBalance("org-1", -0);

      expect(result).toBe(100);
      expect(mockUpdateQuery).toHaveBeenCalledWith({ balance_sats: 100 });
    });
  });

  describe("Faille #5 (corrigée) — borne haute sur amount", () => {
    it("Number.MAX_SAFE_INTEGER est rejeté avant tout appel DB (hors plage INTEGER 32 bits)", async () => {
      const fromSpy = vi.fn();
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: fromSpy,
      });

      await expect(
        organizationService.adjustBalance("org-1", Number.MAX_SAFE_INTEGER),
      ).rejects.toThrow("Montant hors limites autorisées");
      expect(fromSpy).not.toHaveBeenCalled();
    });

    it("un crédit qui ferait dépasser le plafond INTEGER 32 bits est rejeté après lecture du solde", async () => {
      mockAdjustBalanceClient({ selectBalance: 2_000_000_000 });

      await expect(
        organizationService.adjustBalance("org-1", 200_000_000),
      ).rejects.toThrow("Solde maximum autorisé dépassé");
    });
  });

  describe("Faille #6 (corrigée) — balance_sats null en base", () => {
    it("traite balance_sats: null comme 0 mais journalise un avertissement (donnée anormale visible)", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { mockUpdateEqBalance } = mockAdjustBalanceClient({
        selectBalance: null,
        updateResult: { data: { balance_sats: 500 }, error: null },
      });

      const result = await organizationService.adjustBalance("org-1", 500);

      expect(result).toBe(500);
      expect(mockUpdateEqBalance).toHaveBeenCalledWith("balance_sats", 0);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("balance_sats est null/undefined en base"),
      );
      warnSpy.mockRestore();
    });
  });

  describe("Tests d'échec — propagation stricte des erreurs", () => {
    it.each([NaN, Infinity, -Infinity])(
      "rejette %s avant tout appel réseau (aucune requête DB émise)",
      async (bad) => {
        const fromSpy = vi.fn();
        (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(
          { from: fromSpy },
        );

        await expect(
          organizationService.adjustBalance("org-1", bad),
        ).rejects.toThrow("Montant invalide pour l'ajustement du solde");

        expect(fromSpy).not.toHaveBeenCalled();
      },
    );

    it("propage l'erreur de solde insuffisant avant toute tentative d'update", async () => {
      const { mockUpdateQuery } = mockAdjustBalanceClient({
        selectBalance: 10,
      });

      await expect(
        organizationService.adjustBalance("org-1", -11),
      ).rejects.toThrow("Solde insuffisant pour effectuer ce débit");

      expect(mockUpdateQuery).not.toHaveBeenCalled();
    });

    it("id contenant des caractères spéciaux n'est pas injecté, juste transmis tel quel à .eq()", async () => {
      const { mockUpdateEqId } = mockAdjustBalanceClient({
        selectBalance: 100,
        updateResult: { data: { balance_sats: 150 }, error: null },
      });

      const maliciousId = "org-1'; DROP TABLE organizations; --";
      await organizationService.adjustBalance(maliciousId, 50);

      expect(mockUpdateEqId).toHaveBeenCalledWith("id", maliciousId);
    });
  });
});
