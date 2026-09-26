"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { navForRole } from "@/config/app-navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const nav = navForRole(user?.role);

  return (
    <aside className="bg-card hidden w-64 shrink-0 flex-col border-r lg:flex">
      <Link href="/dashboard" className="flex h-16 items-center border-b px-6">
        <Logo />
      </Link>

      <nav
        aria-label="Navigation de l'espace"
        className="flex-1 space-y-6 overflow-y-auto px-3 py-6"
      >
        {nav.map((group) => (
          <div key={group.title}>
            <p className="text-muted-foreground px-3 pb-2 text-xs font-medium tracking-wider uppercase">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "focus-visible:ring-ring flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
                        active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge ? (
                        <Badge variant="danger" className="px-2 py-0">
                          {item.badge}
                        </Badge>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t p-4">
        <Link
          href="/soutenir"
          className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
        >
          <Heart className="size-4" />
          Soutenir la plateforme
        </Link>
        <p className="text-muted-foreground text-xs">
          {siteConfig.name} · {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}
