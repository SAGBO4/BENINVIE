"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { primaryNav } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const spaceHref = user?.role === "donor" ? "/donneur" : "/dashboard";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Une navigation ferme le panneau: sans cela il resterait ouvert par-dessus
  // la nouvelle page sur mobile. Ajustement pendant le rendu plutôt que dans
  // un effet, pour éviter un second rendu inutile.
  if (menuOpen && menuPath !== null && menuPath !== pathname) {
    setMenuOpen(false);
    setMenuPath(null);
  }

  function toggleMenu() {
    setMenuOpen((open) => {
      const next = !open;
      setMenuPath(next ? pathname : null);
      return next;
    });
  }

  // Panneau ouvert: on bloque le défilement de la page derrière.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled || menuOpen
          ? "border-border bg-background/85 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <a
        href="#contenu"
        className="bg-primary text-primary-foreground focus-visible:ring-ring sr-only rounded-md px-4 py-2 text-sm font-semibold focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-4 focus-visible:z-50 focus-visible:ring-2"
      >
        Aller au contenu
      </a>

      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="HEMORA, accueil"
          className="flex items-center"
        >
          <Logo />
        </Link>

        {!isAuthenticated && (
          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-7 lg:flex"
          >
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link href={spaceHref}>Mon espace</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/donate">Devenir donneur</Link>
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={toggleMenu}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </Container>

      {menuOpen && (
        <div
          id="menu-mobile"
          className="bg-background/95 border-border animate-rise-in absolute inset-x-0 top-16 border-b shadow-lg backdrop-blur-md lg:hidden"
        >
          <Container className="flex flex-col gap-1 py-4">
            {!isAuthenticated &&
              primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:bg-muted rounded-lg px-3 py-3 text-sm font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}

            <div className="mt-3 flex flex-col gap-2 border-t pt-4">
              {isAuthenticated ? (
                <Button asChild>
                  <Link href={spaceHref}>Mon espace</Link>
                </Button>
              ) : (
                <>
                  <Button asChild>
                    <Link href="/donate">Devenir donneur</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="/login">Se connecter (structure)</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/connexion-donneur">Espace donneur</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/soutenir">Soutenir HEMORA</Link>
                  </Button>
                </>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
