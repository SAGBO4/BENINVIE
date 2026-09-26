import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { withDeadline } from "@/lib/deadline";

/**
 * Chaque requête, page comprise, passe par ici et attend la vérification de
 * session. Si le fournisseur d'authentification ne répond pas, tout le site
 * attend avec lui. On borne donc l'attente, et on échoue fermé: pas de
 * session vérifiée, pas d'accès aux routes protégées.
 *
 * Le seuil est volontairement large. Échouer fermé déconnecte l'utilisateur:
 * un délai trop court transformerait une simple latence en déconnexion au
 * milieu d'une saisie. Huit secondes laissent passer un aller-retour lent tout
 * en évitant l'attente d'une minute d'un hôte injoignable.
 */
const SESSION_DEADLINE_MS = 8_000;

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Supabase a renommé « anon key » en « publishable key » : on accepte les
  // deux noms, faute de quoi le proxy ne rafraîchit jamais la session.
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // 1. Récupération cryptographique de la session utilisateur
  let user = null;
  try {
    const result = await withDeadline(
      supabase.auth.getUser(),
      SESSION_DEADLINE_MS,
      "Vérification de session",
    );
    user = result.data.user;
  } catch (error) {
    console.error("Vérification de session impossible:", error);
  }

  const path = request.nextUrl.pathname;

  // 2. Protections de routes d'API
  if (path.startsWith("/api/v1")) {
    // Exemptions publiques (sinon on ne pourrait jamais se connecter/s'inscrire)
    if (
      path === "/api/v1/health" ||
      path === "/api/v1/docs" ||
      path === "/api/v1/openapi.json" ||
      path === "/api/v1/auth/login" ||
      path === "/api/v1/auth/register" ||
      path === "/api/v1/auth/logout" ||
      // Sonde de session: elle répond « personne » plutôt que 401.
      path === "/api/v1/auth/me" ||
      (path === "/api/v1/donors" && request.method === "POST") ||
      (path === "/api/v1/donations" && request.method === "POST") ||
      path.startsWith("/api/v1/verify") ||
      path.startsWith("/api/v1/search") ||
      path.startsWith("/api/v1/public")
    ) {
      return response;
    }

    // Protection des endpoints privés
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: "unauthorized",
            message: "Authentification requise pour accéder à cette ressource.",
          },
        },
        { status: 401 },
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any static file extension (.svg, .png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
