import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox, RefreshCw, WifiOff } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StateShellProps = {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  tone?: "neutral" | "danger";
};

function StateShell({
  icon: Icon,
  title,
  description,
  action,
  className,
  tone = "neutral",
}: StateShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center",
        tone === "danger" && "border-destructive/30 bg-destructive/5",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-full",
          tone === "danger"
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-5" />
      </span>
      <p className="text-base font-semibold">{title}</p>
      {description && (
        <p className="text-muted-foreground max-w-md text-sm text-balance">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Rien à afficher, sans que ce soit une erreur. */
export function EmptyState({
  icon = Inbox,
  title,
  description,
  action,
  className,
}: Omit<StateShellProps, "icon" | "tone"> & { icon?: LucideIcon }) {
  return (
    <StateShell
      icon={icon}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}

/**
 * Échec de chargement. Distingue la coupure réseau du reste, parce que la
 * conduite à tenir n'est pas la même pour la personne devant l'écran.
 */
export function ErrorState({
  error,
  onRetry,
  title,
  className,
}: {
  error?: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}) {
  const message = error instanceof Error ? error.message : undefined;
  const offline =
    typeof navigator !== "undefined" && navigator.onLine === false;

  return (
    <StateShell
      tone="danger"
      icon={offline ? WifiOff : AlertTriangle}
      title={
        title ??
        (offline ? "Vous êtes hors connexion" : "Chargement impossible")
      }
      description={
        offline
          ? "Rétablissez la connexion, les données se rechargeront automatiquement."
          : (message ??
            "Le service n'a pas répondu. Réessayez dans un instant.")
      }
      action={
        onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RefreshCw className="size-4" />
            Réessayer
          </Button>
        )
      }
      className={className}
    />
  );
}

export { StateShell };
