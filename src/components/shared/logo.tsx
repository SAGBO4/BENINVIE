import { cn } from "@/lib/utils";

type LogoVariant = "full" | "compact" | "stacked" | "mark";

type LogoProps = {
  className?: string;
  /**
   * `full` marque + nom + signature, `compact` marque + nom,
   * `stacked` version verticale, `mark` la goutte seule.
   */
  variant?: LogoVariant;
  /** Rend le nom en blanc, pour les fonds sombres permanents. */
  onDark?: boolean;
};

/**
 * Marque HEMORA: une goutte de sang qui abrite un donneur les bras levés,
 * portant un cœur. Dessinée en SVG plutôt qu'en image pour rester nette à
 * toutes les tailles, suivre le thème et ne rien coûter au chargement.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={cn("size-9", className)}
    >
      <defs>
        <linearGradient id="hemora-drop" x1="32" y1="2" x2="32" y2="62">
          <stop offset="0%" stopColor="#E23744" />
          <stop offset="55%" stopColor="#C0202C" />
          <stop offset="100%" stopColor="#8E1520" />
        </linearGradient>
      </defs>

      {/* Goutte */}
      <path
        d="M32 2.5c0 0 24 24.6 24 39.1C56 53.4 45.3 61.5 32 61.5S8 53.4 8 41.6C8 27.1 32 2.5 32 2.5Z"
        fill="url(#hemora-drop)"
      />

      {/* Donneur: tête, bras levés, buste. Les bras sont tracés au trait
          avec des extrémités arrondies pour rester lisibles à 24 px. */}
      <g fill="#fff" stroke="#fff" strokeLinecap="round" strokeWidth="4.6">
        <circle cx="32" cy="25.5" r="5.4" stroke="none" />
        <path d="M20.5 26.5c2.3 4.2 6.1 6.9 11.5 7.7" fill="none" />
        <path d="M43.5 26.5c-2.3 4.2-6.1 6.9-11.5 7.7" fill="none" />
        <path
          d="M32 33.4c5.6 0 10.1 4.2 10.1 9.4 0 6.4-5.8 11.6-10.1 14.5-4.3-2.9-10.1-8.1-10.1-14.5 0-5.2 4.5-9.4 10.1-9.4Z"
          stroke="none"
        />
      </g>

      {/* Cœur porté par le donneur */}
      <path
        d="M32 51.6c-3.6-2.6-6.3-5.4-6.3-8.3 0-2 1.6-3.6 3.5-3.6 1.2 0 2.2.6 2.8 1.5.6-.9 1.6-1.5 2.8-1.5 1.9 0 3.5 1.6 3.5 3.6 0 2.9-2.7 5.7-6.3 8.3Z"
        fill="#C0202C"
      />
    </svg>
  );
}

const TAGLINE = "Connecter les sauveurs, protéger les vies";

export function Logo({ className, variant = "compact", onDark }: LogoProps) {
  if (variant === "mark") {
    return <BrandMark className={className} />;
  }

  if (variant === "stacked") {
    return (
      <span
        className={cn(
          "flex flex-col items-center gap-3 text-center select-none",
          className,
        )}
      >
        <BrandMark className="size-16" />
        <span className="flex flex-col items-center gap-1.5">
          <span
            className={cn(
              "font-display text-2xl leading-none font-extrabold tracking-[0.14em]",
              onDark ? "text-white" : "text-secondary dark:text-foreground",
            )}
          >
            HEMORA
          </span>
          <span
            className={cn(
              "text-[0.6rem] leading-tight font-semibold tracking-[0.18em] uppercase",
              onDark ? "text-white/70" : "text-primary/80",
            )}
          >
            {TAGLINE}
          </span>
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn("flex items-center gap-2.5 select-none", className)}
      aria-label="HEMORA"
    >
      <BrandMark className="size-8 shrink-0" />
      <span className="flex flex-col justify-center gap-0.5 leading-none">
        <span
          className={cn(
            "font-display text-xl leading-none font-extrabold tracking-[0.12em]",
            onDark ? "text-white" : "text-secondary dark:text-foreground",
          )}
        >
          HEMORA
        </span>
        {variant === "full" && (
          <span
            className={cn(
              "text-[0.5rem] leading-none font-semibold tracking-[0.16em] uppercase",
              onDark ? "text-white/65" : "text-muted-foreground",
            )}
          >
            {TAGLINE}
          </span>
        )}
      </span>
    </span>
  );
}
