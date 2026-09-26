/**
 * Passerelle Mobile Money (Izichange / Flash).
 *
 * ATTENTION: l'appel réel au partenaire n'est pas implémenté. Ce module ne
 * déplace aucun argent. Il produit une transaction fictive, explicitement
 * marquée `simulated`, que les routes propagent jusqu'à l'interface pour que
 * personne ne croie à un versement.
 *
 * Deux garde-fous:
 *
 * 1. `simulated` remonte jusqu'à l'écran. Un retrait simulé est annoncé comme
 *    tel, et le solde n'est pas débité: rien n'est parti.
 * 2. Si les identifiants du partenaire sont configurés, le service refuse de
 *    simuler et lève. Une clé présente laisse croire que les virements
 *    partent vraiment; échouer bruyamment vaut mieux qu'un faux succès.
 *
 * Pour brancher le partenaire: implémenter l'appel REST ici, renvoyer
 * `simulated: false` et l'identifiant de transaction retourné par l'API.
 */

export type MoMoCashout = {
  transactionId: string;
  /** Vrai tant que le partenaire n'est pas branché: aucun argent n'a bougé. */
  simulated: boolean;
};

function partnerConfigured(): boolean {
  return Boolean(
    process.env.IZICHANGE_API_KEY && process.env.IZICHANGE_API_URL,
  );
}

function refuseSilentSimulation(operation: string): never {
  throw new Error(
    `${operation}: les identifiants Izichange sont configurés mais l'appel au partenaire n'est pas implémenté. ` +
      "Refus de simuler un mouvement d'argent avec une configuration de production.",
  );
}

export const izichangeService = {
  /**
   * Dépôt de satoshis convertis vers un numéro Mobile Money.
   * Ne déplace aucun fonds tant que le partenaire n'est pas branché.
   */
  cashoutToMoMo: async (
    momoNumber: string,
    satsAmount: number,
  ): Promise<MoMoCashout> => {
    if (partnerConfigured()) {
      refuseSilentSimulation("Retrait Mobile Money");
    }

    console.warn(
      `[Izichange non configuré] Retrait NON EXÉCUTÉ: ${satsAmount} sats vers ${momoNumber}.`,
    );

    return {
      transactionId: `simulated_momo_${Date.now().toString(36)}`,
      simulated: true,
    };
  },

  /**
   * Paiement d'une carte physique. Même règle: aucun encaissement réel.
   */
  initiateCardPayment: async (
    orderId: string,
    amountXof: number,
  ): Promise<{
    checkoutUrl: string | null;
    paymentReference: string;
    simulated: boolean;
  }> => {
    if (partnerConfigured()) {
      refuseSilentSimulation("Paiement de carte physique");
    }

    console.warn(
      `[Izichange non configuré] Paiement NON EXÉCUTÉ: commande ${orderId}, ${amountXof} XOF.`,
    );

    return {
      // Pas d'URL de paiement: envoyer l'utilisateur vers une page de
      // paiement inexistante lui ferait croire à un encaissement réel.
      checkoutUrl: null,
      paymentReference: `simulated_pay_${Date.now().toString(36)}`,
      simulated: true,
    };
  },
};
