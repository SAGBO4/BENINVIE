"use client";

import { useSyncExternalStore } from "react";

type Remaining = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function remainingUntil(target: number): Remaining {
  const total = Math.max(0, target - Date.now());
  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total % 86_400_000) / 3_600_000),
    minutes: Math.floor((total % 3_600_000) / 60_000),
    seconds: Math.floor((total % 60_000) / 1000),
  };
}

/**
 * L'horloge est une source extérieure à React: on s'y abonne plutôt que de
 * la copier dans un état. Le rendu serveur reçoit `null`, ce qui évite
 * l'erreur d'hydratation que provoquait un `Date.now()` évalué des deux
 * côtés à des instants différents.
 */
function subscribeToSecond(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

/** La seconde courante, arrondie: deux lectures dans la même seconde doivent
 *  renvoyer la même valeur, sinon `useSyncExternalStore` boucle. */
function currentSecond() {
  return Math.floor(Date.now() / 1000);
}

export function CampaignCountdown({ startsAt }: { startsAt: string }) {
  const target = new Date(startsAt).getTime();

  const second = useSyncExternalStore(
    subscribeToSecond,
    currentSecond,
    () => null,
  );

  if (Number.isNaN(target)) return null;

  if (second === null) {
    // Rendu serveur et première passe client: une grille inerte de la même
    // forme, pour que rien ne saute à l'hydratation.
    return (
      <div className="flex items-center gap-2" aria-hidden="true">
        {["j", "h", "min", "s"].map((label) => (
          <CountdownCell key={label} value="--" label={label} />
        ))}
      </div>
    );
  }

  const remaining = remainingUntil(target);

  if (remaining.total === 0) {
    return (
      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
        La collecte a commencé
      </span>
    );
  }

  const units = [
    { value: remaining.days, label: "j" },
    { value: remaining.hours, label: "h" },
    { value: remaining.minutes, label: "min" },
    { value: remaining.seconds, label: "s" },
  ];

  return (
    <div
      className="flex items-center gap-2"
      role="timer"
      aria-label={`Début dans ${remaining.days} jours, ${remaining.hours} heures et ${remaining.minutes} minutes`}
    >
      {units.map((unit) => (
        <CountdownCell
          key={unit.label}
          value={String(unit.value).padStart(2, "0")}
          label={unit.label}
        />
      ))}
    </div>
  );
}

function CountdownCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-muted flex min-w-12 flex-col items-center rounded-lg px-2 py-1.5">
      <span className="font-display text-lg font-bold tabular-nums">
        {value}
      </span>
      <span className="text-muted-foreground text-[10px] uppercase">
        {label}
      </span>
    </div>
  );
}
