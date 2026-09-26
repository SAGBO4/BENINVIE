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
  PhoneCall,
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
  label: "CONSOLES & HEMORA",
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
      label: "Passeport Donneur & NFC",
      desc: "QR APDP salé SHA-256 et carte sans contact ISO 14443",
      href: "/projects?module=passport",
      icon: Award,
      badge: "NFC Actif",
    },
    {
      label: "Vérification QR & Scellé ANIP",
      desc: "Guichet officiel réservé aux acteurs de santé habilités",
      href: "/verify",
      icon: Shield,
      badge: "Légal APDP",
    },
  ],
};

const CITOYENS_GROUP: NavGroup = {
  id: "citoyens",
  label: "SERVICES CITOYENS",
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
    <header className="sticky top-0 z-50 w-full bg-[#0a3764] text-white shadow-md">
      {/* 1. Barre d'alerte supérieure institutionnelle (Conformité APDP & Numéro Vert 136) */}
      <div className="w-full bg-[#06213d] border-b border-white/10 px-3 sm:px-6 py-1 text-[11px] sm:text-xs text-white/90">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
              <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span>Conformité APDP</span>
            </span>
            <span className="text-white/40">•</span>
            <span className="text-white/70 text-[10px] sm:text-[11px] truncate max-w-[200px] sm:max-w-none">
              Loi n° 2017-20 Code du Numérique
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="tel:136"
              className="inline-flex items-center gap-1.5 font-bold text-red-400 hover:text-red-300 transition-colors py-0.5"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
              </span>
              <PhoneCall className="h-3 w-3 shrink-0" />
              <span>Numéro Vert 136 (Gratuit 24/7)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Barre Principale de Navigation (Style ANIP Officiel) */}
      <div
        ref={navRef}
        className="mx-auto flex h-16 sm:h-20 w-full max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8"
      >
        {/* Marque Officielle Institutionnelle avec Armoiries de la République du Bénin */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 shrink min-w-0 group focus:outline-hidden"
          title="BENINVIE — Accueil Plateforme Nationale"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/armoiries-benin.png"
            alt="Armoiries de la République du Bénin"
            className="h-9 sm:h-12 w-auto object-contain shrink-0 drop-shadow-sm"
          />
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-2xl font-black tracking-wider text-white leading-none">
                BENINVIE
              </span>
              <span className="hidden md:inline-block h-3.5 w-px bg-white/30 mx-1" />
              <span className="hidden md:inline-block text-[10px] xl:text-[11px] font-bold text-white/90 uppercase tracking-wider">
                Santé Numérique
              </span>
            </div>
            {/* Ligne Tricolore Nationale Verte-Jaune-Rouge */}
            <div className="my-0.5 sm:my-1 flex h-[2.5px] w-full rounded-full overflow-hidden shadow-xs">
              <div className="w-1/3 bg-[#008751]" />
              <div className="w-1/3 bg-[#ffbe00]" />
              <div className="w-1/3 bg-[#eb0000]" />
            </div>
            <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-white/80 truncate">
              RÉPUBLIQUE DU BÉNIN • SANTÉ
            </span>
          </div>
        </Link>

        {/* Menu Navigation Desktop Central */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {/* Lien Accueil */}
          <Link
            href="/"
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-md ${
              pathname === "/"
                ? "bg-white/15 text-white"
                : "text-white/90 hover:text-white hover:bg-white/10"
            }`}
          >
            Accueil
          </Link>

          {/* Dropdown 1 : Consoles d'Urgence & HEMORA */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("urgences")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-md cursor-pointer ${
                activeDropdown === "urgences" || pathname.startsWith("/projects")
                  ? "bg-white/15 text-white"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{URGENCES_GROUP.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  activeDropdown === "urgences" ? "rotate-180 text-amber-300" : "text-white/70"
                }`}
              />
            </button>

            <AnimatePresence>
              {activeDropdown === "urgences" && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-88 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50 text-slate-900"
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Consoles d&apos;Urgence & Transfusion Sanguine
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
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                          <div className="h-9 w-9 rounded-xl bg-[#eaf2f9] flex items-center justify-center text-[#0a3764] group-hover:bg-[#0a3764] group-hover:text-white transition-colors shrink-0 mt-0.5">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 truncate group-hover:text-[#0a3764] transition-colors">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
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

          {/* Dropdown 2 : Services Citoyens */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("citoyens")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-md cursor-pointer ${
                activeDropdown === "citoyens"
                  ? "bg-white/15 text-white"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{CITOYENS_GROUP.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  activeDropdown === "citoyens" ? "rotate-180 text-amber-300" : "text-white/70"
                }`}
              />
            </button>

            <AnimatePresence>
              {activeDropdown === "citoyens" && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-88 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50 text-slate-900"
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                          <div className="h-9 w-9 rounded-xl bg-[#eaf2f9] flex items-center justify-center text-[#0a3764] group-hover:bg-[#0a3764] group-hover:text-white transition-colors shrink-0 mt-0.5">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 truncate group-hover:text-[#0a3764] transition-colors">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
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

          {/* Numéro Vert Urgence 136 */}
          <a
            href="tel:136"
            className="inline-flex items-center gap-1.5 rounded-full bg-red-600 hover:bg-red-500 px-3.5 py-1.5 text-xs font-bold text-white transition-colors shadow-xs ml-2"
            title="Ligne Verte Sanitaire & Urgences 24/7"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <PhoneCall className="h-3 w-3" />
            <span>136 URGENCE</span>
          </a>
        </nav>

        {/* Espace Droite : Bouton Style ANIP "ACCÉDER À MON ESPACE" ou Profil Connecté */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 rounded-lg bg-[#3f6184] hover:bg-[#4a729c] px-3.5 py-2 text-xs font-medium border border-white/20 shadow-sm transition-colors cursor-pointer"
              >
                <div className="h-6 w-6 rounded-full bg-white text-[#0a3764] flex items-center justify-center font-bold text-[11px]">
                  {user.prenom[0]}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-white leading-tight text-[11px] truncate max-w-[120px]">
                    {user.prenom} {user.nom}
                  </span>
                  <span className="text-[9px] text-amber-300 font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-white/70 ml-0.5" />
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-68 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 text-slate-900"
                  >
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.prenom} {user.nom}</p>
                      <p className="text-[10px] text-slate-500">{user.titre}</p>
                      <p className="text-[10px] text-[#0a3764] mt-0.5 font-semibold">{user.etablissementNom}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href={dashboardUrl}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-semibold"
                      >
                        <LayoutDashboard className="h-4 w-4 text-[#0a3764]" />
                        <span>Mon Tableau de bord</span>
                      </Link>

                      <Link
                        href="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <User className="h-4 w-4 text-sky-600" />
                        <span>Changer d&apos;acteur</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-semibold text-left cursor-pointer"
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
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-[#3f6184] hover:bg-[#4a729c] px-3 sm:px-5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider text-white border border-white/20 shadow-sm transition-all duration-200 active:scale-95 shrink-0"
            >
              <LogIn className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">ACCÉDER À MON ESPACE</span>
              <span className="sm:hidden">ESPACE</span>
            </Link>
          )}

          {/* Bouton Menu Mobile Ergonomique (44px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu de navigation"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Ligne Tricolore Officielle du Bénin sur Toute la Largeur */}
      <div className="flex h-1 w-full shadow-xs">
        <div className="w-1/3 bg-[#008751]" />
        <div className="w-1/3 bg-[#ffbe00]" />
        <div className="w-1/3 bg-[#eb0000]" />
      </div>

      {/* Menu Mobile Déroulant avec Volet Tactile Complet & Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop assombrissant fermant au toucher */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-x-3 top-24 sm:top-28 max-h-[82vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl z-50 flex flex-col gap-5 text-slate-900"
            >
              {/* Entête du tiroir avec profil ou statut */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#008751] animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Portail Officiel BENINVIE
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 1. Consoles d'Urgence & HEMORA */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 px-1">
                  Consoles d&apos;Urgence & Transfusion HEMORA
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {URGENCES_GROUP.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 active:bg-slate-200 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="h-4 w-4 text-[#0a3764] shrink-0" />
                          <span className="text-xs font-bold text-slate-900 truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0 ml-1">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* 2. Services Citoyens */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 px-1">
                  Services Citoyens & Droits de Couverture
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CITOYENS_GROUP.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 active:bg-slate-200 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold text-slate-900 truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 ml-1">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* 3. Portails de Connexion Rapide par Rôle */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 px-1">
                  Portails Métier & Connexion
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Link
                    href="/login?role=PATIENT"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center text-center p-2 rounded-xl border border-slate-200 bg-white hover:bg-pink-50 text-xs font-bold text-slate-800"
                  >
                    Espace Citoyen
                  </Link>
                  <Link
                    href="/login?role=MEDECIN"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center text-center p-2 rounded-xl border border-slate-200 bg-white hover:bg-red-50 text-xs font-bold text-slate-800"
                  >
                    Médecin Urgence
                  </Link>
                  <Link
                    href="/login?role=PHARMACIE"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center text-center p-2 rounded-xl border border-slate-200 bg-white hover:bg-sky-50 text-xs font-bold text-slate-800"
                  >
                    Pharmacie
                  </Link>
                  <Link
                    href="/login?role=ARS"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center text-center p-2 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 text-xs font-bold text-slate-800"
                  >
                    Régulateur ARS
                  </Link>
                  <Link
                    href="/login?role=APDP"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center text-center p-2 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 text-xs font-bold text-slate-800"
                  >
                    Auditeur APDP
                  </Link>
                  <Link
                    href="/verify"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center text-center p-2 rounded-xl border border-[#0a3764]/30 bg-[#0a3764]/5 hover:bg-[#0a3764]/10 text-xs font-bold text-[#0a3764]"
                  >
                    Guichet /verify
                  </Link>
                </div>
              </div>

              {/* 4. Barre Actions Bas : Ligne 136 et Connexion */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                <a
                  href="tel:136"
                  className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Appeler le 136 • Urgences 24/7 (Gratuit)</span>
                </a>

                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-[#0a3764] hover:bg-[#072544] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Accéder à mon espace sécurisé</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
