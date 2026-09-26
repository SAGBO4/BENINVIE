import { authService } from "@/modules/auth";
import { handleApiError, success } from "@/lib/api/response";
import { withDeadline } from "@/lib/deadline";

/** La sonde ne doit jamais faire attendre une page derrière elle. */
const SESSION_DEADLINE_MS = 5_000;

/**
 * GET /api/v1/auth/me
 * Profil de l'utilisateur connecté, ou `null` s'il n'y a pas de session.
 *
 * C'est une sonde de session, pas une ressource protégée: « personne n'est
 * connecté » est une réponse valide, pas une erreur. Répondre 401 faisait
 * remonter une erreur dans la console de chaque visiteur anonyme, sur toutes
 * les pages publiques, et masquait les vraies erreurs d'authentification.
 */
export async function GET() {
  try {
    const user = await withDeadline(
      authService.getCurrentUser(),
      SESSION_DEADLINE_MS,
      "Profil de session",
    );
    return success(user ?? null);
  } catch (error) {
    return handleApiError(error);
  }
}
