/**
 * Préférence de récompense du donneur: portefeuille Lightning, ou dépôt
 * Mobile Money converti à la volée via Izichange.
 *
 * Cette préférence est stockée dans le navigateur du donneur, et n'est donc
 * lisible que là: dans son espace personnel. Une structure qui verse une
 * récompense choisit le canal explicitement, elle ne peut pas deviner ce
 * choix depuis sa propre machine. Une colonne en base la rendrait partagée;
 * en attendant, ne l'utilisez pas ailleurs que dans l'espace donneur.
 */

export type RewardMode = "lightning" | "mobile-money";

export type MobileMoneyOperator =
  "mtn" | "moov" | "orange" | "wave" | "celtiis";

export const MOBILE_MONEY_OPERATORS: {
  value: MobileMoneyOperator;
  label: string;
}[] = [
  { value: "mtn", label: "MTN MoMo" },
  { value: "moov", label: "Moov Money" },
  { value: "orange", label: "Orange Money" },
  { value: "wave", label: "Wave" },
  { value: "celtiis", label: "Celtiis Cash" },
];

export function operatorLabel(operator?: MobileMoneyOperator | null): string {
  return (
    MOBILE_MONEY_OPERATORS.find((o) => o.value === operator)?.label ??
    "Mobile Money"
  );
}

export type RewardPreference = {
  mode: RewardMode;
  /** Renseignés uniquement lorsque `mode === "mobile-money"`. */
  operator?: MobileMoneyOperator;
  phone?: string;
};

const KEY_PREFIX = "bmm.reward-preference.";

/** Valeurs autorisées pour `RewardMode` — liste exhaustive. */
const VALID_REWARD_MODES: readonly RewardMode[] = [
  "lightning",
  "mobile-money",
] as const;

function keyFor(donorId: string): string {
  return `${KEY_PREFIX}${donorId}`;
}

/** Mémorise la préférence de récompense d'un donneur (no-op côté serveur). */
export function saveRewardPreference(
  donorId: string,
  preference: RewardPreference,
): void {
  if (typeof window === "undefined") return;
  // R-5: un donorId vide produirait une clé générique "bmm.reward-preference."
  // qui ne correspond à aucun donneur identifiable — on refuse silencieusement.
  if (!donorId || !donorId.trim()) return;
  try {
    window.localStorage.setItem(keyFor(donorId), JSON.stringify(preference));
  } catch {
    // Stockage indisponible (mode privé, quota) - on ignore silencieusement.
  }
}

/** Relit la préférence de récompense, ou `null` si aucune n'est enregistrée. */
export function loadRewardPreference(donorId: string): RewardPreference | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(keyFor(donorId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RewardPreference;
    // R-1: vérifier que `mode` est une valeur de l'union RewardMode, pas juste
    // une chaîne truthy quelconque (ex: "bitcoin-on-chain" venu d'une ancienne
    // version ou d'une API tierce).
    if (!VALID_REWARD_MODES.includes(parsed.mode)) return null;
    return parsed;
  } catch {
    return null;
  }
}
