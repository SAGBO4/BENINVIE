"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Conserve ce qui a été saisi dans un formulaire long.
 *
 * L'inscription d'un donneur demande une dizaine de champs. Un rafraîchissement,
 * un onglet fermé par erreur ou un retour arrière effaçaient tout, et la
 * personne devait tout retaper. Le brouillon est réécrit à chaque frappe, puis
 * effacé une fois le formulaire envoyé.
 *
 * Rien de sensible n'y est écrit: `omit` retire les champs à ne jamais
 * conserver, à commencer par les mots de passe.
 */

const PREFIX = "hemora.draft.";

/** Un brouillon oublié n'a plus de sens passé ce délai. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

type Stored<T> = { savedAt: number; values: T };

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Stored<T>;
    if (
      typeof parsed?.savedAt !== "number" ||
      Date.now() - parsed.savedAt > MAX_AGE_MS
    ) {
      window.localStorage.removeItem(PREFIX + key);
      return null;
    }
    return parsed.values;
  } catch {
    return null;
  }
}

export function useFormDraft<T extends Record<string, unknown>>(
  key: string,
  options: { omit?: (keyof T)[] } = {},
) {
  const [draft, setDraft] = useState<T | null>(null);
  const [restored, setRestored] = useState(false);
  // `omit` est souvent un littéral recréé à chaque rendu: on le fige.
  const omitRef = useRef(options.omit);

  useEffect(() => {
    const stored = read<T>(key);
    if (stored) {
      // Lecture après montage volontaire: `localStorage` n'existe pas au rendu
      // serveur, et lire avant l'hydratation ferait diverger les deux arbres.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(stored);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRestored(true);
  }, [key]);

  const save = useCallback(
    (values: T) => {
      if (typeof window === "undefined") return;
      const omit = omitRef.current ?? [];
      const safe = { ...values };
      for (const field of omit) delete safe[field];

      try {
        window.localStorage.setItem(
          PREFIX + key,
          JSON.stringify({ savedAt: Date.now(), values: safe }),
        );
      } catch {
        // Quota atteint ou navigation privée: perdre le brouillon est
        // acceptable, bloquer la saisie ne le serait pas.
      }
    },
    [key],
  );

  const clear = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch {
      /* rien à faire */
    }
    setDraft(null);
  }, [key]);

  return { draft, restored, save, clear };
}
