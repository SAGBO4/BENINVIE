import { handleApiError, success } from "@/lib/api/response";
import { withDeadline } from "@/lib/deadline";
import { campaignService } from "@/modules/campaigns";

/**
 * GET /api/v1/public/campaigns
 * Collectes à venir, publiées sur la vitrine. Seules les campagnes actives
 * ayant une date de début et pas encore terminées sont renvoyées.
 *
 * Aucune donnée nominative n'est exposée: titre, organisateur, ville,
 * période et nombre d'inscrits uniquement.
 */
const CAMPAIGNS_DEADLINE_MS = 5_000;

export async function GET() {
  try {
    const campaigns = await withDeadline(
      campaignService.getPublicCampaigns(),
      CAMPAIGNS_DEADLINE_MS,
      "Campagnes publiques",
    );

    return success(campaigns);
  } catch (error) {
    return handleApiError(error);
  }
}
