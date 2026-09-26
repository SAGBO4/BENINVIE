"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth-context";
import { ROLE_DASHBOARDS } from "@/lib/auth-session";
import {
  LogIn,
  LogOut,
  LayoutDashboard,
  Shield,
  User,
  ChevronDown,
  Activity,
  Pill,
  HeartHandshake,
  Sparkles,
  TrendingUp,
  Award,
  AlertTriangle,
  Menu,
  X,
  Clock,
} from "lucide-react";

type NavDropdownItem = {
  label: string;
  desc: string;
  href: string;
  icon: typeof Shield;
  badge?: string;
};

type NavGroup = {
  id: "urgences" | "citoyens";
  label: string;
  items: NavDropdownItem[];
};

const URGENCES_GROUP: NavGroup = {
  id: "urgences",
  label: "Consoles & HEMORA",
  items: [
    {
      label: "Scénario Démo Kalalé",
      desc: "Traçabilité 7 étapes : CPN rurale au sauvetage Nikki",
      href: "/projects?module=scenario",
      icon: Sparkles,
      badge: "Démonstrateur",
    },
    {
      label: "Matching Haversine (< 45 km)",
      desc: "Dispatch géodésique WGS84 et alertes SMS donneurs",
      href: "/projects?module=matching",
      icon: TrendingUp,
      badge: "Algorithme",
    },
    {
      label: "Stocks de Sang 77 Communes",
      desc: "Supervision des poches O-, O+, A+, B+ en temps réel",
      href: "/projects?module=stocks",
      icon: Clock,
      badge: "CNTS Bénin",
    },
    {
      label: "Passeport Donneur Numérique",
      desc: "QR APDP salé SHA-256 et défraiement MoMo 2 000 F",
      href: "/projects?module=passport",
      icon: Award,
      badge: "MoMo Validé",
    },
  ],
};

const CITOYENS_GROUP: NavGroup = {
  id: "citoyens",
  label: "Services Citoyens",
  items: [
    {
      label: "Carnet de Santé Numérique",
      desc: "Dossier médical unifié FHIR, constantes & CPN",
      href: "/dashboard/patient",
      icon: HeartHandshake,
      badge: "HL7 FHIR",
    },
    {
      label: "Signalement au Ministère",
      desc: "Dénoncer racket, absence de soins ou refus ARCH",
      href: "/dashboard/patient?tab=denonciation",
      icon: AlertTriangle,
      badge: "Inspection",
    },
    {
      label: "Assurance Maladie ARCH",
      desc: "Prise en charge à 100% sans aucun frais avancé",
      href: "/dashboard/patient?tab=arch",
      icon: Shield,
      badge: "0 FCFA",
    },
    {
      label: "Pharmacopée Homologuée MTA",
      desc: "Médicaments traditionnels validés par l'ARS",
      href: "/dashboard/ars",
      icon: Pill,
      badge: "Homologué",
    },
  ],
};

export function Nav(): ReactNode {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [activeDropdown, setActiveDropdown] = useState<"urgences" | "citoyens" | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setActiveDropdown(null);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleDropdown = (id: "urgences" | "citoyens") => {
    setActiveDropdown((prev) => (prev === id ? null : id));
    setUserDropdownOpen(false);
  };

  const dashboardUrl = user ? ROLE_DASHBOARDS[user.role] : "/login";

  return (
    <nav
      aria-label="Navigation Principale"
      className="fixed left-0 right-0 top-4 z-50 px-3 sm:px-6 flex justify-center pointer-events-none"
    >
      <div
        ref={navRef}
        className="flex items-center justify-between gap-3 w-full max-w-7xl pointer-events-auto"
      >
        {/* Marque Officielle Gauche */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-full bg-background/90 px-4 py-2 border border-foreground/10 shadow-lg backdrop-blur-md transition hover:border-emerald-500/30 shrink-0"
        >
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-foreground">Gbɛ</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                BENINVIE
              </span>
            </div>
            <span className="text-[10px] text-foreground/50 hidden md:inline">Système National Sanitaire</span>
          </div>
        </Link>

        {/* Menu Navigation Central Desktop avec Dropdown Selects */}
        <div className="hidden lg:flex items-center gap-1 rounded-full bg-background/90 p-1.5 shadow-lg border border-foreground/10 backdrop-blur-md">
          {/* Lien Accueil */}
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              pathname === "/"
                ? "bg-foreground/10 text-foreground font-semibold"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            Accueil
          </Link>

          {/* Select 1 : Consoles d'Urgence & HEMORA */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("urgences")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                activeDropdown === "urgences" || pathname.startsWith("/projects")
                  ? "bg-foreground/10 text-foreground font-semibold"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <span>{URGENCES_GROUP.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  activeDropdown === "urgences" ? "rotate-180 text-emerald-500" : "text-foreground/50"
                }`}
              />
            </button>

            <AnimatePresence>
              {activeDropdown === "urgences" && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-3 w-80 rounded-3xl border border-foreground/10 bg-background/95 p-3 shadow-2xl backdrop-blur-2xl z-50"
                >
                  <div className="px-3 py-1.5 border-b border-foreground/10 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                      Consoles d&apos;Urgence & Transfusion
                    </span>
                  </div>

                  <div className="space-y-1">
                    {URGENCES_GROUP.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-foreground/5 transition-colors group"
                        >
                          <div className="h-8 w-8 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground group-hover:bg-red-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-foreground truncate group-hover:text-red-500 transition-colors">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-red-500/10 text-red-500 shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-foreground/60 line-clamp-1 mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Select 2 : Services Citoyens */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("citoyens")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                activeDropdown === "citoyens"
                  ? "bg-foreground/10 text-foreground font-semibold"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <span>{CITOYENS_GROUP.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  activeDropdown === "citoyens" ? "rotate-180 text-emerald-500" : "text-foreground/50"
                }`}
              />
            </button>

            <AnimatePresence>
              {activeDropdown === "citoyens" && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-3 w-80 rounded-3xl border border-foreground/10 bg-background/95 p-3 shadow-2xl backdrop-blur-2xl z-50"
                >
                  <div className="px-3 py-1.5 border-b border-foreground/10 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                      Droits & Prestations Citoyennes
                    </span>
                  </div>

                  <div className="space-y-1">
                    {CITOYENS_GROUP.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-foreground/5 transition-colors group"
                        >
                          <div className="h-8 w-8 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground group-hover:bg-pink-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-foreground truncate group-hover:text-pink-500 transition-colors">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-pink-500/10 text-pink-500 shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-foreground/60 line-clamp-1 mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-4 w-px bg-foreground/10 mx-1" />

          {/* Numéro Vert Urgence 136 */}
          <a
            href="tel:136"
            className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
            title="Ligne Verte Sanitaire & Urgences 24/7"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>136 Urgence</span>
          </a>
        </div>

        {/* Espace Droite : Se connecter ou Profil Acteur & Menu Mobile */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full bg-background/90 px-3.5 py-1.5 text-xs font-medium border border-emerald-500/30 shadow-lg backdrop-blur-md hover:border-emerald-500 transition-colors cursor-pointer"
              >
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-[11px]">
                  {user.prenom[0]}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-foreground leading-tight text-[11px] truncate max-w-[120px]">
                    {user.prenom} {user.nom}
                  </span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-foreground/50 ml-0.5" />
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl border border-foreground/10 bg-background/95 p-2 shadow-2xl backdrop-blur-xl z-50"
                  >
                    <div className="px-3 py-2 border-b border-foreground/10">
                      <p className="text-xs font-semibold text-foreground">{user.prenom} {user.nom}</p>
                      <p className="text-[10px] text-foreground/60">{user.titre}</p>
                      <p className="text-[10px] text-emerald-500 mt-0.5 font-medium">{user.etablissementNom}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href={dashboardUrl}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors font-medium"
                      >
                        <LayoutDashboard className="h-4 w-4 text-emerald-500" />
                        <span>Mon Tableau de bord</span>
                      </Link>

                      <Link
                        href="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors"
                      >
                        <User className="h-4 w-4 text-sky-500" />
                        <span>Changer de compte</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-foreground/10">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors font-medium text-left cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 active:scale-95"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Se connecter</span>
            </Link>
          )}

          {/* Bouton Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-background/90 border border-foreground/10 text-foreground/70 hover:text-foreground shadow-md backdrop-blur-md cursor-pointer"
            aria-label="Menu Mobile"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Déroulant */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-x-4 top-20 max-h-[85vh] overflow-y-auto rounded-3xl border border-foreground/10 bg-background/98 p-5 shadow-2xl backdrop-blur-2xl pointer-events-auto z-50 flex flex-col gap-5"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/45 block mb-2">
                Consoles d&apos;Urgence & HEMORA
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {URGENCES_GROUP.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-foreground/5 hover:bg-foreground/5"
                    >
                      <Icon className="h-4 w-4 text-red-500 shrink-0" />
                      <span className="text-xs font-semibold text-foreground truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/45 block mb-2">
                Services Citoyens
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CITOYENS_GROUP.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-foreground/5 hover:bg-foreground/5"
                    >
                      <Icon className="h-4 w-4 text-pink-500 shrink-0" />
                      <span className="text-xs font-semibold text-foreground truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-foreground/10 flex items-center justify-between">
              <a
                href="tel:136"
                className="inline-flex items-center gap-2 text-xs font-bold text-red-500"
              >
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span>136 Ligne Verte Urgence 24/7</span>
              </a>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-emerald-500"
              >
                Se connecter / Choisir mon profil →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
