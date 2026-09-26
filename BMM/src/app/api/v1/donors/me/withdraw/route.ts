import { authService } from "@/modules/auth";
import { donorService } from "@/modules/donors/services/donor.service";
import { izichangeService } from "@/modules/bitcoin/services/izichange.service";
import { rewardService } from "@/modules/bitcoin/services/reward.service";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";
import { z } from "zod";

const withdrawSchema = z.object({
  amountSats: z.number().min(1, "Le montant doit être supérieur à 0."),
  momoNumber: z.string().min(8, "Le numéro Mobile Money est invalide."),
});

export async function POST(req: Request) {
  try {
    // 1. Authentification
    const user = await authService.getCurrentUser();
    if (!user || user.role !== "donor" || !user.donor) {
      return failure(
        API_ERROR_CODE.UNAUTHORIZED,
        "Authentification en tant que donneur requise.",
        { status: 401 },
      );
    }

    const donorId = user.id;

    // 2. Validation du body
    const body = await req.json();
    const { amountSats, momoNumber } = withdrawSchema.parse(body);

    // 3. Vérification du solde
    // Re-charger le donneur pour s'assurer d'avoir le solde le plus récent en base
    const dbDonor = await donorService.getDonorById(donorId);
    if (!dbDonor) {
      return failure(
        API_ERROR_CODE.NOT_FOUND,
        "Profil de donneur introuvable.",
        { status: 404 },
      );
    }

    if (dbDonor.balanceSats < amountSats) {
      return failure(
        API_ERROR_CODE.BAD_REQUEST,
        `Solde insuffisant. Disponible : ${dbDonor.balanceSats} sats, demandé : ${amountSats} sats`,
        { status: 400 },
      );
    }

    // 4. Débit du solde (rendu si le versement échoue en 6)
    const updatedBalance = await donorService.updateDonorBalance(
      donorId,
      -amountSats,
    );
    if (updatedBalance === null) {
      return failure(
        API_ERROR_CODE.INTERNAL_ERROR,
        "Impossible de débiter le solde pour le moment.",
        { status: 500 },
      );
    }

    // 5. Enregistrement de la trace de transaction (pending)
    const invoiceOrMomo = `withdrawal:momo:${momoNumber}`;
    const rewardLog = await rewardService.createRewardLog({
      donorId,
      hospitalId: null, // Pas d'hôpital associé car c'est un retrait initié par le donneur
      satsAmount: amountSats,
      bolt11Invoice: invoiceOrMomo,
    });

    try {
      // 6. Exécution du cashout MoMo
      const cashout = await izichangeService.cashoutToMoMo(
        momoNumber,
        amountSats,
      );

      // 6b. Rien n'est parti tant que la passerelle est simulée: on rend le
      // solde plutôt que de laisser un donneur croire à un virement.
      if (cashout.simulated) {
        const restoredBalance = await donorService.updateDonorBalance(
          donorId,
          amountSats,
        );
        await rewardService.updateRewardStatus(
          rewardLog.id,
          "failed",
          undefined,
          "Passerelle Mobile Money non configurée: aucun virement effectué.",
        );

        // La remise du solde peut elle-même échouer. Annoncer « votre solde
        // est intact » sans l'avoir vérifié laisserait le donneur débité d'un
        // montant qui n'est jamais parti.
        if (restoredBalance === null) {
          console.error(
            `Solde non restauré après un retrait simulé (donneur ${donorId}, ${amountSats} sats).`,
          );
          return failure(
            API_ERROR_CODE.INTERNAL_ERROR,
            "Le retrait n'a pas abouti et votre solde n'a pas pu être rétabli automatiquement. Contactez le support en précisant l'heure de l'opération.",
            { status: 500 },
          );
        }

        return success({
          message:
            "Passerelle Mobile Money non configurée: aucun virement n'a été effectué et votre solde est intact.",
          balanceSats: restoredBalance,
          reward: null,
          simulated: true,
        });
      }

      // 7. Enregistrement du succès
      const finalLog = await rewardService.updateRewardStatus(
        rewardLog.id,
        "completed",
        cashout.transactionId,
      );

      return success({
        message: "Retrait Mobile Money exécuté avec succès.",
        balanceSats: updatedBalance,
        reward: finalLog,
        simulated: false,
      });
    } catch (paymentError) {
      // En cas d'erreur de paiement, on recrédite le solde du donneur. Si la
      // remise échoue, on le journalise: le donneur reste débité et seule une
      // intervention manuelle peut le corriger.
      const restored = await donorService.updateDonorBalance(
        donorId,
        amountSats,
      );
      if (restored === null) {
        console.error(
          `Solde non restauré après un échec de retrait (donneur ${donorId}, ${amountSats} sats).`,
        );
      }

      const errorMsg =
        paymentError instanceof Error
          ? paymentError.message
          : "Échec du retrait Mobile Money";

      // Mise à jour de la trace en échec
      const failedLog = await rewardService.updateRewardStatus(
        rewardLog.id,
        "failed",
        undefined,
        errorMsg,
      );

      return failure(
        API_ERROR_CODE.INTERNAL_ERROR,
        `Échec du retrait: ${errorMsg}`,
        {
          status: 500,
          details: { reward: failedLog },
        },
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}
