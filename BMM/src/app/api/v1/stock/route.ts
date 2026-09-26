import { z } from "zod";

import { authService } from "@/modules/auth";
import { stockService } from "@/modules/stock";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

const setStockSchema = z.object({
  component: z.enum(["CGR", "Plasma", "Plaquettes"]),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  units: z.number().int().min(0).max(100_000),
  expiringSoon: z.number().int().min(0).max(100_000).default(0),
});

/**
 * GET /api/v1/stock
 * Stock de la structure connectée, par composant et groupe sanguin.
 */
export async function GET() {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    // Sans organisation liée, le stock est vide (aucune structure rattachée).
    if (!user.organizationId) {
      return success([]);
    }

    const stock = await stockService.getHospitalStock(user.organizationId);
    return success(stock);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/v1/stock
 * Fixe le niveau d'un poste de stock de la structure connectée. La structure
 * est toujours reprise de la session, jamais du corps de la requête: sans
 * cela, une structure pourrait écrire dans le stock d'une autre.
 */
export async function PUT(request: Request) {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    if (!user.organizationId) {
      return failure(
        API_ERROR_CODE.FORBIDDEN,
        "Aucune structure rattachée à ce compte.",
        { status: 403 },
      );
    }

    const payload = setStockSchema.parse(await request.json());
    const record = await stockService.setUnits({
      hospitalId: user.organizationId,
      ...payload,
    });

    return success(record);
  } catch (error) {
    return handleApiError(error);
  }
}
