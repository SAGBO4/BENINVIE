import { z } from "zod";

/**
 * Variables d'environnement exposées au navigateur (préfixe NEXT_PUBLIC_).
 * Sûr à importer depuis n'importe quel composant, client ou serveur.
 *
 * Chaque clé est référencée littéralement pour que Next.js puisse
 * l'inliner dans le bundle client.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

/**
 * Origine publique de l'application.
 *
 * `NEXT_PUBLIC_APP_URL` reste la source de vérité quand elle est fournie.
 * À défaut, on utilise les variables système exposées par l'hébergeur au
 * moment du build: l'URL du déploiement pour une préversion, le domaine de
 * production sinon. Chaque clé est écrite littéralement pour que Next.js
 * puisse l'inliner dans le bundle client.
 */
function resolveAppUrl(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit;

  const isProduction =
    (process.env.NEXT_PUBLIC_VERCEL_TARGET_ENV ??
      process.env.NEXT_PUBLIC_VERCEL_ENV) === "production";

  const host = isProduction
    ? (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
      process.env.NEXT_PUBLIC_VERCEL_URL)
    : (process.env.NEXT_PUBLIC_VERCEL_URL ??
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL);

  return host ? `https://${host}` : undefined;
}

const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: resolveAppUrl(),
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  // Supabase a renommé « anon key » en « publishable key »: on accepte les
  // deux noms pour rester compatible avec les projets récents et anciens.
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Variables d'environnement client invalides:\n${issues}`);
}

export const clientEnv = parsed.data;

export type ClientEnv = typeof clientEnv;
