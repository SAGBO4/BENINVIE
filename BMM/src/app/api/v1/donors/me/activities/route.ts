import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { donorService } from "@/modules/donors";

/**
 * GET /api/v1/donors/me/activities
 * Historique du donneur connecté: dons enregistrés par les structures,
 * parrainages et sessions de sensibilisation, du plus récent au plus ancien.
 */
export async function GET() {
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

    const activities = await donorService.listActivities(user.id);
    return success(activities);
  } catch (error) {
    return handleApiError(error);
  }
}
