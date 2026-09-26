import { AlertTriangle } from "lucide-react";

/**
 * Avertissement affiché quand la facture Lightning n'a pas été produite par
 * un vrai nœud.
 *
 * Le serveur renvoie alors une chaîne de démonstration, impayable. La masquer
 * revenait à présenter à un donateur un QR code et un bouton « ouvrir dans le
 * portefeuille » pour une facture qui n'existe pas.
 */
export function SimulatedInvoiceNotice() {
  return (
    <p
      role="status"
      className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <span>
        Facture de démonstration: le nœud Lightning n&apos;est pas configuré sur
        ce serveur. Elle ne peut pas être payée. Aucun montant ne sera débité.
      </span>
    </p>
  );
}
