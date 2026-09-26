"use client";

import {
  ArrowDown,
  ArrowRight,
  Award,
  Gamepad2,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
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
    <div className="flex h-[600px] w-full items-center justify-center rounded-4xl border border-foreground/8 bg-foreground/2 text-sm text-foreground/50">
      Chargement du menu 3D...
    </div>
  ),
});

import { HaversineEmergencyConsole } from "@/components/hemora/haversine-emergency-console";
import { NationalStockConsole } from "@/components/hemora/national-stock-console";
import { DonorPassportConsole } from "@/components/hemora/donor-passport-console";

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
    title: "Dispositif Bris de Glace & Prise en Charge Différée",
    description:
      "Garantie souveraine de zéro refus d'urgence transfusionnelle. Délivrance immédiate des poches sous garantie de l'État sans caution.",
    meta: "Protocole d'État • Zéro Refus • Décret Sanitaire",
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
      "Algorithme WGS84 interconnectant les hôpitaux en détresse avec les donneurs compatibles et les banques de sang les plus proches.",
    meta: "Calcul WGS84 • Dispatch < 15 min • Alertes SMS",
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
      "Supervision continue des réserves CGR (O-, O+, A+, B+) à Cotonou, Porto-Novo, Parakou et dans chaque Hôpital de Zone du Bénin.",
    meta: "77 Communes • Alertes Tensions • Chaîne du Froid IoT",
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
      "Carte QR conforme APDP avec hachage salé SHA-256, contrôle du délai d'éligibilité médicale de 60 jours et versement forfaitaire MTN/Moov.",
    meta: "Conforme APDP • 2 000 FCFA MoMo • OpenTimestamps",
    imageRatio: 1024 / 680,
    image:
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1024&auto=format&fit=crop",
    imageAlt: "Passeport Donneur Numérique",
  },
  {
    id: "passerelle-gsm",
    icon: Rocket,
    iconLabel: "INCLUSION RURALE",
    title: "Passerelle GSM Rurale (SMS, USSD & Serveur Vocal IVR)",
    description:
      "Signalement d'urgence vitale sans smartphone ni connexion internet via USSD interactif et serveur vocal automatisé en langues nationales.",
    meta: "GSM 2G • USSD Rapide *136# • Serveur Vocal",
    imageRatio: 1024 / 680,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1024&auto=format&fit=crop",
    imageAlt: "Passerelle GSM Rurale",
  },
  {
    id: "audit-blockchain",
    icon: ShieldCheck,
    iconLabel: "SÉCURITÉ & AUDIT",
    title: "Registre Cryptographique & Traçabilité OpenTimestamps",
    description:
      "Scellage immuable de chaque don, cession et transfusion pour une transparence absolue et une conformité réglementaire totale.",
    meta: "Audit Immuable • Hachage SHA-256 • OpenTimestamps",
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
    link: "/projects",
    title: "Matching Haversine",
    description: "Calcul Géodésique 0-45 km WGS84",
  },
  {
    image:
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&h=600&fit=crop&auto=format",
    link: "/projects#stocks",
    title: "Stocks 77 Communes",
    description: "Télémétrie CNTS & Chaîne du Froid",
  },
  {
    image:
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=600&h=600&fit=crop&auto=format",
    link: "/projects",
    title: "Passeport Donneur",
    description: "2 000 F MoMo & Conforme APDP",
  },
  {
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&h=600&fit=crop&auto=format",
    link: "/projects",
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
            iconLabel: p.category ? p.category.toUpperCase() : "WEB3 PROJECT",
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
          <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-foreground/20 to-foreground/50" />
          <div className="my-2.5 flex items-center rounded-full border border-foreground/10 bg-background/80 px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/70 backdrop-blur-md shadow-xs">
            <span>02 • Consoles & Modules Opérationnels</span>
          </div>
          <div className="h-8 w-[1px] bg-gradient-to-b from-foreground/50 to-foreground/20" />
        </div>
      ) : null}

      {withHeadline ? (
        <div className="mx-auto w-full max-w-275 px-6 sm:px-10">
          <FadeIn className="flex flex-col items-center gap-4 text-center pb-4 sm:pb-6">
            <h2 className="font-serif text-[2.5rem] font-medium leading-[1.05] tracking-tight text-foreground md:text-[3rem] lg:text-[3.5rem]">
              Modules Opérationnels & Consoles d&apos;Urgence
            </h2>
            <p className="max-w-[42ch] text-[18px] leading-[1.45] tracking-tight text-foreground/65 sm:text-[20px]">
              Les six piliers technologiques du réseau national HEMORA pour garantir zéro rupture et zéro refus au Bénin.
            </p>
            {viewMoreVisible ? (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-foreground/50">
                <Sparkles className="h-3.5 w-3.5 text-foreground/60" />
                <span>Faites glisser librement la sphère 3D pour explorer les modules</span>
              </div>
            ) : null}
          </FadeIn>
        </div>
      ) : null}

      {viewMoreVisible ? (
        <div className="relative w-full overflow-hidden">
          {/* Masques de dégradé progressifs haut et bas pour un fondu fluide */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-background via-background/60 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-background via-background/60 to-transparent"
          />

          <div className="relative h-[650px] md:h-[750px] w-full">
            <InfiniteMenu items={dynamicMenuItems} scale={1.0} backgroundColor="transparent" />
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-275 px-6 sm:px-10">
          <div className="columns-1 gap-6 md:columns-2 md:gap-7">
            {dynamicProjectsList.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Live Interactive Consoles Connected to Backend */}
      <div id="matching" className="mx-auto w-full max-w-275 px-6 sm:px-10 mt-12 space-y-10">
        <HaversineEmergencyConsole />
        <NationalStockConsole />
        {!viewMoreVisible && <DonorPassportConsole />}
      </div>

      {viewMoreVisible ? (
        <div className="mx-auto w-full max-w-275 px-6 sm:px-10">
          <div className="mt-8 flex justify-center sm:mt-12">
            <Link
              href="/projects"
              className="border border-foreground/8 focus-ring group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 shadow-sm"
            >
              Accéder à toutes les consoles & passeport donneur
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* Element de transition en bas (Progression vers Contact) */}
          <div className="mt-12 flex flex-col items-center justify-center">
            <div className="h-10 w-[1px] bg-gradient-to-b from-foreground/30 to-foreground/15" />
            <div className="my-2.5 flex items-center gap-2 rounded-full border border-foreground/10 bg-background/80 px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/70 backdrop-blur-md shadow-xs">
              <span>03 • Régulation & Hotline d&apos;Urgence</span>
              <ArrowDown className="h-3 w-3 animate-bounce text-foreground/60" />
            </div>
            <div className="h-16 w-[1px] bg-gradient-to-b from-foreground/20 via-foreground/10 to-transparent" />
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
      delay={Math.min(index * 0.06, 0.3)}
      className="mb-6 break-inside-avoid md:mb-7"
    >
      <article className="project-card flex cursor-pointer flex-col gap-4 rounded-3xl border border-foreground/8 bg-background p-3 sm:p-3.5">
        <header className="flex items-center gap-2.5 px-1 pt-2">
          <span className="border-foreground/10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background">
            <Icon className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium tracking-tight text-foreground">
            {project.iconLabel}
          </span>
        </header>

        <div
          className="project-card__image ring-foreground/5 relative w-full overflow-hidden rounded-2xl bg-foreground/5 ring-1"
          style={{ aspectRatio: project.imageRatio }}
        >
          <div className="project-card__image-inner">
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
              sizes="(min-width: 1024px) 540px, (min-width: 768px) 45vw, 100vw"
              className="object-cover"
              priority={index < 2}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5 px-1 pb-1">
          <h3 className="text-[20px] font-medium leading-[1.2] tracking-tight text-foreground sm:text-[22px]">
            {project.title}
          </h3>
          <p className="text-[14px] leading-normal tracking-tight text-foreground/65 sm:text-[15px]">
            {project.description}
          </p>
        </div>

        <p className="px-1 pb-2 text-[12px] tracking-tight text-foreground/50">
          {project.meta}
        </p>
      </article>
    </FadeIn>
  );
}
