import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/shared/logo";
import { footerNav, legalNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="bg-secondary/[0.04] border-t dark:bg-black/20">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <Link href="/" aria-label="HEMORA, accueil">
            <Logo variant="full" />
          </Link>
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            Mieux relier donneurs, hôpitaux et centres de collecte pour que le
            bon sang arrive au bon endroit, partout en Afrique.
          </p>
        </div>

        {footerNav.map((group) => (
          <nav
            key={group.title}
            aria-label={group.title}
            className="flex flex-col gap-3"
          >
            <span className="text-sm font-semibold">{group.title}</span>
            <ul className="flex flex-col gap-0.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-ring -mx-1 inline-flex min-h-11 items-center rounded-sm px-1 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none sm:min-h-9"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <Container className="text-muted-foreground flex flex-col items-center justify-between gap-3 border-t py-6 text-sm sm:flex-row">
        <span>
          {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
        </span>
        <nav
          aria-label="Informations légales"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        >
          {legalNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground focus-visible:ring-ring -mx-1 inline-flex min-h-11 items-center rounded-sm px-1 transition-colors focus-visible:ring-2 focus-visible:outline-none sm:min-h-0"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
