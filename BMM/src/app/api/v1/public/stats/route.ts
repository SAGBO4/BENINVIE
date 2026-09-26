import { handleApiError, success } from "@/lib/api/response";
import { withDeadline } from "@/lib/deadline";
import { statisticsService } from "@/modules/statistics";

/**
 * GET /api/v1/public/stats
 * Agrégats publics affichés sur la page d'accueil: donneurs validés,
 * structures partenaires, villes couvertes, campagnes et urgences en cours,
 * et niveau des réserves par groupe sanguin.
 *
 * Aucune donnée nominative n'est exposée.
 */

/**
 * La page d'accueil est la première chose que voit un visiteur: elle ne doit
 * jamais rester bloquée sur une base injoignable. Au-delà de ce délai, on
 * répond en erreur et l'interface masque simplement les chiffres.
 */
const STATS_DEADLINE_MS = 5_000;

export async function GET() {
  try {
    const stats = await withDeadline(
      statisticsService.getPublicStatistics(),
      STATS_DEADLINE_MS,
      "Statistiques publiques",
    );

    return success(stats, {
      meta: { generatedAt: new Date().toISOString() },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
