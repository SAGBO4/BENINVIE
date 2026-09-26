import { z } from "zod";

import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";
import { authService } from "@/modules/auth";
import { contentService } from "@/modules/content";

/** Clés éditables. Une liste fermée évite qu'une faute de frappe crée une
 *  entrée orpheline que plus aucune page ne lit. */
export const EDITABLE_CONTENT_KEYS = [
  "mentions-legales",
  "confidentialite",
  "conditions",
] as const;

const saveSchema = z.object({
  key: z.enum(EDITABLE_CONTENT_KEYS),
  title: z.string().min(3).max(200),
  body: z.string().min(1).max(60_000),
});

type Guard =
  | { ok: false; response: ReturnType<typeof failure> }
  | {
      ok: true;
      user: NonNullable<Awaited<ReturnType<typeof authService.getCurrentUser>>>;
    };

/**
 * Union discriminée volontaire: `ok` prouve à TypeScript que `user` existe
 * dans la branche autorisée. Un objet aux deux champs optionnels laissait
 * passer un accès à `user` sur le chemin refusé.
 */
async function requireSuperAdmin(): Promise<Guard> {
  const user = await authService.getCurrentUser();

  if (!user) {
    return {
      ok: false,
      response: failure(
        API_ERROR_CODE.UNAUTHORIZED,
        "Authentification requise.",
        { status: 401 },
      ),
    };
  }

  if (user.role !== "super_admin") {
    return {
      ok: false,
      response: failure(
        API_ERROR_CODE.FORBIDDEN,
        "Réservé à l'administration de la plateforme.",
        { status: 403 },
      ),
    };
  }

  return { ok: true, user };
}

/**
 * GET /api/v1/admin/content
 * Contenus éditoriaux enregistrés, pour la console d'administration.
 */
export async function GET() {
  try {
    const guard = await requireSuperAdmin();
    if (!guard.ok) return guard.response;

    return success(await contentService.list());
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/v1/admin/content
 * Enregistre le texte d'une page. L'auteur est repris de la session.
 */
export async function PUT(request: Request) {
  try {
    const guard = await requireSuperAdmin();
    if (!guard.ok) return guard.response;

    const payload = saveSchema.parse(await request.json());
    const saved = await contentService.save({
      ...payload,
      updatedBy: guard.user.id,
    });

    return success(saved);
  } catch (error) {
    return handleApiError(error);
  }
}
