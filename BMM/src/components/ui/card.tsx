import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-xl border shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-2 p-6", className)} {...props} />
  );
}

/**
 * Titre de carte. Le niveau par défaut est `h2`: dans l'espace applicatif et
 * sur les pages de contenu, une carte suit directement le `h1` de la page, et
 * un `h3` y créait un saut de niveau. Passez `as="h3"` quand la carte est
 * imbriquée sous un `h2` de section.
 */
export function CardTitle({
  className,
  as: Component = "h2",
  ...props
}: ComponentProps<"h2"> & { as?: "h2" | "h3" | "h4" }) {
  return (
    <Component
      className={cn("font-display text-lg font-bold tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
