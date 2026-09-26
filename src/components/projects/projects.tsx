"use client";

import {
  ArrowDown,
  ArrowRight,
  Award,
  Clock,
  Gamepad2,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  Droplet,
  Radio,
  FileCheck2,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect, type ComponentType, type ReactNode } from "react";
import { usePortfolio } from "@/lib/portfolio-context";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

import { FadeIn } from "@/components/ui/motion-primitives";

const InfiniteMenu = dynamic(() => import("@/components/ui/InfiniteMenu"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] w-full items-center justify-center rounded-3xl border border-slate-200 bg-white text-sm text-slate-500">
      Chargement du menu de navigation interactive...
    </div>
  ),
});

import { HaversineEmergencyConsole } from "@/components/hemora/haversine-emergency-console";
import { NationalStockConsole } from "@/components/hemora/national-stock-console";
import { DonorPassportConsole } from "@/components/hemora/donor-passport-console";
import { InteractiveScenarioKalale } from "@/components/scenario/interactive-scenario-kalale";

type Project = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  iconLabel: string;
  title: string;
  description: string;
  meta: string;
  imageRatio: number;
  image: string;
  imageAlt: string;
};

const PROJECTS: Project[] = [
  {
    id: "bris-de-glace",
    icon: ShieldCheck,
    iconLabel: "URGENCES VITALES",
    title: "Dispositif Bris de Glace & Prise en Charge Immédiate",
    description:
      "Garantie souveraine de zéro refus d'urgence vitale. Délivrance sans avance financière des poches de sang et déverrouillage médical d'urgence sous caution de l'État.",
    meta: "Décret d'Urgence Vitale • Zéro Caution • Audit APDP",
    imageRatio: 1024 / 680,
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1024&auto=format&fit=crop",
    imageAlt: "Dispositif Bris de Glace Bénin",
  },
  {
    id: "matching-haversine",
    icon: TrendingUp,
    iconLabel: "MOTEUR GÉODÉSIQUE",
    title: "Dispatch & Matching d'Urgence Haversine (< 45 km)",
    description:
      "Calcul géodésique WGS84 interconnectant les hôpitaux en détresse avec les donneurs compatibles ABO/Rh et les banques de dépôts les plus proches.",
    meta: "Calcul WGS84 SF-3 • Alerte SMS < 15 min • Réseau CNTS",
    imageRatio: 1024 / 680,
    image:
      "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=1024&auto=format&fit=crop",
    imageAlt: "Matching Haversine d'urgence",
  },
  {
    id: "stocks-monitor",
    icon: Users,
    iconLabel: "TÉLÉMÉTRIE NATIONALE",
    title: "Supervision des Stocks de Sang dans les 77 Communes",
    description:
      "Supervision continue des réserves CGR (O-, O+, A+, B+) à Cotonou, Porto-Novo, Parakou et dans chaque Hôpital de Zone de la République du Bénin.",
    meta: "77 Communes • Alertes Rupture • Chaîne du Froid IoT",
    imageRatio: 1024 / 680,
    image:
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1024&auto=format&fit=crop",
    imageAlt: "Supervision des stocks de sang",
  },
  {
    id: "carte-donneur",
    icon: Award,
    iconLabel: "INCENTIVE CIVIQUE",
    title: "Passeport Donneur Numérique & Défraiement MoMo 2 000 F",
    description:
      "Carte QR chiffrée conforme Loi 2017-20 APDP, contrôle automatisé de la fenêtre médicale de 60 jours et versement forfaitaire instantané MTN/Moov.",
    meta: "Conformité APDP • 2 000 FCFA MoMo • Donneur Répertorié",
    imageRatio: 1024 / 680,
    image:
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1024&auto=format&fit=crop",
    imageAlt: "Passeport Donneur Numérique",
  },
  {
    id: "passerelle-gsm",
    icon: Rocket,
    iconLabel: "INCLUSION RURALE",
    title: "Passerelle GSM Rurale (SMS, USSD *136# & Serveur Vocal)",
    description:
      "Signalement d'urgence vitale sans smartphone ni connexion internet via USSD interactif et serveur vocal automatisé en langues Bariba, Fon, Dendi et Yoruba.",
    meta: "GSM 2G • USSD Rapide *136# • 4 Langues Nationales",
    imageRatio: 1024 / 680,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1024&auto=format&fit=crop",
    imageAlt: "Passerelle GSM Rurale",
  },
  {
    id: "audit-blockchain",
    icon: ShieldCheck,
    iconLabel: "SÉCURITÉ & AUDIT",
    title: "Registre Inaltérable & Traçabilité OpenTimestamps APDP",
    description:
      "Scellage immuable de chaque don, cession et transfusion pour une transparence absolue et une conformité réglementaire stricte devant l'APDP.",
    meta: "Audit Immuable • Hachage SHA-256 • Loi n° 2017-20",
    imageRatio: 1024 / 680,
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1024&auto=format&fit=crop",
    imageAlt: "Traçabilité et chaîne transfusionnelle",
  },
];

const INFINITE_MENU_ITEMS = [
  {
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&h=600&fit=crop&auto=format",
    link: "/projects",
    title: "Bris de Glace",
    description: "Zéro Refus d'Urgence Vitale Garanti",
  },
  {
    image:
      "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=600&h=600&fit=crop&auto=format",
    link: "/projects?module=matching",
    title: "Matching Haversine",
    description: "Calcul Géodésique 0-45 km WGS84",
  },
  {
    image:
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&h=600&fit=crop&auto=format",
    link: "/projects?module=stocks",
    title: "Stocks 77 Communes",
    description: "Télémétrie CNTS & Chaîne du Froid",
  },
  {
    image:
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=600&h=600&fit=crop&auto=format",
    link: "/projects?module=passport",
    title: "Passeport Donneur",
    description: "2 000 F MoMo & Conforme APDP",
  },
  {
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&h=600&fit=crop&auto=format",
    link: "/projects?module=scenario",
    title: "Passerelle GSM Rurale",
    description: "USSD *136# & Serveur Vocal IVR",
  },
  {
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&h=600&fit=crop&auto=format",
    link: "/projects",
    title: "Audit & Sécurité",
    description: "Horodatage OpenTimestamps & SHA-256",
  },
];

export type ProjectsProps = {
  withHeadline?: boolean;
  viewMoreVisible?: boolean;
};

export function Projects({
  withHeadline = false,
  viewMoreVisible = false,
}: ProjectsProps): ReactNode {
  const { data } = usePortfolio();
  const [activeModule, setActiveModule] = useState<"scenario" | "matching" | "stocks" | "passport" | "all">("all");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleSync = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const mod = urlParams.get("module");
        if (mod && ["scenario", "matching", "stocks", "passport", "all"].includes(mod)) {
          setActiveModule(mod as any);
          return;
        }
        const hash = window.location.hash.replace("#", "");
        if (hash === "scenario") setActiveModule("scenario");
        else if (hash === "matching") setActiveModule("matching");
        else if (hash === "stocks") setActiveModule("stocks");
        else if (hash === "passport") setActiveModule("passport");
      };

      handleSync();
      window.addEventListener("popstate", handleSync);
      window.addEventListener("hashchange", handleSync);
      return () => {
        window.removeEventListener("popstate", handleSync);
        window.removeEventListener("hashchange", handleSync);
      };
    }
  }, []);

  const getSafeImage = (img: string | undefined, defaultImg: string): string => {
    if (!img || img.trim() === "" || img.startsWith("blob:")) {
      return defaultImg;
    }
    return img;
  };

  const dynamicMenuItems =
    data.projects && data.projects.length > 0
      ? data.projects.map((p, idx) => {
          const fallback = INFINITE_MENU_ITEMS[idx % INFINITE_MENU_ITEMS.length]?.image || PROJECTS[idx % PROJECTS.length]?.image || "";
          return {
            image: getSafeImage(p.image, fallback),
            link: p.link || "/projects",
            title: p.title,
            description: p.description,
          };
        })
      : INFINITE_MENU_ITEMS;

  const dynamicProjectsList: Project[] =
    data.projects && data.projects.length > 0
      ? data.projects.map((p, idx) => {
          const defaultProj = PROJECTS.find((orig) => orig.id === p.id);
          const icon = defaultProj?.icon || TrendingUp;
          const fallback = defaultProj?.image || PROJECTS[idx % PROJECTS.length]?.image || "";
          return {
            id: p.id || `proj-${idx}`,
            icon,
            iconLabel: p.category ? p.category.toUpperCase() : "MODULE NATIONAL",
            title: p.title,
            description: p.description,
            meta: p.meta,
            imageRatio: 1024 / 680,
            image: getSafeImage(p.image, fallback),
            imageAlt: p.imageAlt || p.title,
          };
        })
      : PROJECTS;

  return (
    <section className="relative w-full overflow-visible">
      {/* Element de transition en haut (Progression depuis Hero) */}
      {viewMoreVisible ? (
        <div className="flex flex-col items-center justify-center pt-2 pb-6">
          <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-slate-300 to-slate-400" />
          <div className="my-2.5 flex items-center rounded-full border border-slate-200 bg-white px-4 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-slate-700 shadow-xs">
            <span>02 • Consoles & Modules Opérationnels</span>
          </div>
          <div className="h-8 w-[1px] bg-gradient-to-b from-slate-400 to-slate-200" />
        </div>
      ) : null}

      {withHeadline ? (
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
          <FadeIn className="flex flex-col items-center gap-4 text-center pb-6 sm:pb-8">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Modules Opérationnels & Consoles d&apos;Urgence
            </h2>
            <p className="max-w-[48ch] text-base sm:text-lg leading-relaxed text-slate-600">
              Les six piliers techniques du réseau national HEMORA pour garantir zéro rupture et zéro refus au Bénin.
            </p>
            {viewMoreVisible ? (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Explorez les modules via la sphère interactive</span>
              </div>
            ) : null}
          </FadeIn>
        </div>
      ) : null}

      {viewMoreVisible ? (
        <div className="relative w-full overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-[#f6f8fb] via-[#f6f8fb]/60 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-[#f6f8fb] via-[#f6f8fb]/60 to-transparent"
          />

          <div className="relative h-[650px] md:h-[750px] w-full">
            <InfiniteMenu items={dynamicMenuItems} scale={1.0} backgroundColor="transparent" />
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {dynamicProjectsList.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Live Interactive Consoles with Clinical-Grade Tab Switcher */}
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12 mt-12 sm:mt-16">
        {/* Module Switcher Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#0a3764]/10 text-[#0a3764] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Sélecteur de Console Clinique & Opérationnelle
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Basculez entre le scénario national à Kalalé, le moteur Haversine, les stocks et le passeport donneur
              </p>
            </div>
          </div>

          {/* Quick Pill Buttons avec défilement horizontal fluide no-scrollbar */}
          <div className="w-full lg:w-auto flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-1 -mx-1 px-1">
            <button
              onClick={() => setActiveModule("all")}
              className={`min-h-[44px] shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeModule === "all"
                  ? "bg-[#0a3764] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Tous les modules
            </button>
            <button
              onClick={() => setActiveModule("scenario")}
              className={`min-h-[44px] shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeModule === "scenario"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              1. Scénario Bio Kalalé
            </button>
            <button
              onClick={() => setActiveModule("matching")}
              className={`min-h-[44px] shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeModule === "matching"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              2. Matching Haversine (&lt; 45 km)
            </button>
            <button
              onClick={() => setActiveModule("stocks")}
              className={`min-h-[44px] shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeModule === "stocks"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              3. Stocks 77 Communes
            </button>
            <button
              onClick={() => setActiveModule("passport")}
              className={`min-h-[44px] shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeModule === "passport"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              4. Passeport Donneur NFC
            </button>
          </div>
        </div>

        {/* Modular Consoles Display (Spacious, Wide max-w-7xl) */}
        <div className="space-y-12">
          {(activeModule === "all" || activeModule === "scenario") && (
            <div id="scenario" className="scroll-mt-28">
              <InteractiveScenarioKalale />
            </div>
          )}

          {(activeModule === "all" || activeModule === "matching") && (
            <div id="matching" className="scroll-mt-28">
              <HaversineEmergencyConsole />
            </div>
          )}

          {(activeModule === "all" || activeModule === "stocks") && (
            <div id="stocks" className="scroll-mt-28">
              <NationalStockConsole />
            </div>
          )}

          {(!viewMoreVisible && (activeModule === "all" || activeModule === "passport")) && (
            <div id="passport" className="scroll-mt-28">
              <DonorPassportConsole />
            </div>
          )}
        </div>
      </div>

      {viewMoreVisible ? (
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
          <div className="mt-10 flex justify-center sm:mt-14">
            <Link
              href="/projects"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0a3764] hover:bg-[#082a4d] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#0a3764]/20 transition-all active:scale-95"
            >
              <span>Accéder à toutes les consoles & passeport donneur</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Element de transition en bas (Progression vers Contact) */}
          <div className="mt-14 flex flex-col items-center justify-center">
            <div className="h-10 w-[1px] bg-gradient-to-b from-slate-400 to-slate-200" />
            <div className="my-2.5 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-slate-700 shadow-xs">
              <span>03 • Régulation Sanitaire & Hotline d&apos;Urgence</span>
              <ArrowDown className="h-3 w-3 animate-bounce text-slate-500" />
            </div>
            <div className="h-16 w-[1px] bg-gradient-to-b from-slate-200 via-slate-100 to-transparent" />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}): ReactNode {
  const Icon = project.icon;
  const fallback =
    PROJECTS.find((p) => p.id === project.id)?.image ||
    "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1024&auto=format&fit=crop";

  const initialSrc =
    project.image && !project.image.startsWith("blob:")
      ? project.image
      : fallback;

  const [imgSrc, setImgSrc] = useState(initialSrc);

  useEffect(() => {
    const valid =
      project.image && !project.image.startsWith("blob:")
        ? project.image
        : fallback;
    setImgSrc(valid);
  }, [project.image, fallback]);

  return (
    <FadeIn
      delay={Math.min(index * 0.05, 0.25)}
      className="flex flex-col"
    >
      <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#0a3764]/40 transition-all duration-200">
        <div>
          <header className="flex items-center justify-between gap-2 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0a3764]/10 text-[#0a3764]">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {project.iconLabel}
              </span>
            </div>
            <span className="h-2 w-2 rounded-full bg-[#008751]" />
          </header>

          <div
            className="relative w-full overflow-hidden rounded-xl bg-slate-100 mb-4 border border-slate-100"
            style={{ aspectRatio: project.imageRatio }}
          >
            <Image
              src={imgSrc}
              alt={project.imageAlt}
              fill
              unoptimized={imgSrc.startsWith("data:") || imgSrc.startsWith("blob:")}
              onError={() => {
                if (imgSrc !== fallback) {
                  setImgSrc(fallback);
                }
              }}
              sizes="(min-width: 1024px) 380px, (min-width: 768px) 45vw, 100vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
              priority={index < 3}
            />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {project.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-[11px] font-medium text-slate-500">
            {project.meta}
          </p>
        </div>
      </article>
    </FadeIn>
  );
}
