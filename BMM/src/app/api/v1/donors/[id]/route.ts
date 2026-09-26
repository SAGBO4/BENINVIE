import { updateDonorSchema, donorService } from "@/modules/donors";
import { authService } from "@/modules/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * GET /api/v1/donors/[id]
 * Fiche d'un donneur, pour les structures et l'administration.
 *
 * La fiche se contentait auparavant de chercher le donneur dans l'annuaire
 * des profils validés: un donneur pas encore validé s'affichait sans nom.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const caller = await authService.getCurrentUser();
    if (!caller) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    // Une structure consulte les donneurs du réseau; un donneur n'accède
    // qu'à sa propre fiche, par /donors/me.
    if (caller.role !== "org_admin" && caller.role !== "super_admin") {
      return failure(
        API_ERROR_CODE.FORBIDDEN,
        "Réservé aux structures de santé.",
        { status: 403 },
      );
    }

    const id = (await params).id;
    if (!id || !uuidRegex.test(id)) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Format d'ID invalide.", {
        status: 400,
      });
    }

    const donor = await donorService.getDonorById(id);
    if (!donor) {
      return failure(API_ERROR_CODE.NOT_FOUND, "Donneur introuvable.", {
        status: 404,
      });
    }

    return success(donor);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/v1/donors/[id]
 * Met à jour le profil d'un donneur. Réservé au donneur lui-même.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    const id = (await params).id;
    if (!id || !uuidRegex.test(id)) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Format d'ID invalide.", {
        status: 400,
      });
    }

    // Un donneur ne peut modifier que son propre profil.
    if (user.id !== id) {
      return failure(
        API_ERROR_CODE.FORBIDDEN,
        "Vous ne pouvez modifier que votre propre profil.",
        { status: 403 },
      );
    }

    const body = await req.json();
    const validated = updateDonorSchema.parse(body);
    const donor = await donorService.updateDonor(id, validated);

    return success(donor);
  } catch (error) {
    return handleApiError(error);
  }
}
