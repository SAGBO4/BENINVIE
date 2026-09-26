"use client";

import { LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { navForRole } from "@/config/app-navigation";
import { useLogout } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "HE"
  );
}

export function AppTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const logout = useLogout();
  // Le menu compact doit refléter le rôle: un super-admin y perdait sinon
  // l'accès aux organisations et aux demandes de cartes.
  const flatNav = navForRole(user?.role).flatMap((group) => group.items);

  const orgName =
    user?.role === "super_admin"
      ? "Administration plateforme"
      : (user?.organization?.name ?? user?.email ?? "Mon organisation");

  async function handleLogout() {
    await logout.mutateAsync().catch(() => {});
    router.replace("/login");
  }

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Navigation horizontale repliée sur mobile */}
        <nav
          aria-label="Navigation de l'espace"
          className="flex flex-1 items-center gap-1 overflow-x-auto lg:hidden"
        >
          {flatNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-md transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-4" />
              </Link>
            );
          })}
        </nav>

        <div className="hidden flex-1 lg:block" />

        <div className="flex items-center gap-2">
          {user?.role !== "super_admin" ? (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/alerts">
                <Plus className="size-4" />
                Nouvelle alerte
              </Link>
            </Button>
          ) : null}
          <ThemeToggle />
          <div className="flex items-center gap-2 pl-1">
            <Avatar initials={initialsOf(orgName)} className="size-9" />
            <span className="hidden max-w-40 truncate text-sm font-medium md:inline">
              {orgName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={logout.isPending}
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
