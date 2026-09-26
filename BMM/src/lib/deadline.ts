/**
 * Borne le temps d'attente d'une promesse.
 *
 * Un client de base de données réessaie plusieurs fois avant d'abandonner:
 * sur un hôte injoignable, une requête peut bloquer une réponse HTTP pendant
 * près d'une minute. Mieux vaut échouer vite et laisser l'interface afficher
 * son état d'erreur que faire attendre la page indéfiniment.
 */
export class DeadlineExceededError extends Error {
  constructor(label: string, ms: number) {
    super(`${label}: délai de ${ms} ms dépassé.`);
    this.name = "DeadlineExceededError";
  }
}

export function withDeadline<T>(
  // `PromiseLike` et non `Promise`: un constructeur de requête Supabase est
  // un « thenable » qui n'expose ni `catch` ni `finally`.
  promise: PromiseLike<T>,
  ms: number,
  label = "Opération",
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new DeadlineExceededError(label, ms)),
      ms,
    );

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
