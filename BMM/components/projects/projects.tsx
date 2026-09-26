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
    id: "gateio",
    icon: TrendingUp,
    iconLabel: "GATE.IO EXCHANGE",
    title: "Scaling & moderating Gate.io French community and engagement campaigns.",
    description:
      "Led and managed the French community. Organized AMAs, trading competitions, giveaways, official announcements, feedback analysis, and automated moderation bots.",
    meta: "French Community Manager, Mar 2024 – Jun 2025",
    imageRatio: 1024 / 680,
    image:
      "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1024&auto=format&fit=crop",
    imageAlt: "Gate.io crypto exchange community management",
  },
  {
    id: "nexgami",
    icon: Gamepad2,
    iconLabel: "NEXGAMI & METAVIRUS",
    title: "Web3 gaming community growth and bilingual moderation strategy.",
    description:
      "Managed and moderated Telegram, Twitter/X, and Discord. Coordinated with top KOLs and partners, drafted announcements, and ran interactive community AMAs.",
    meta: "Community Lead (FR & EN), Mar 2023 – Jan 2025",
    imageRatio: 1024 / 680,
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1024&auto=format&fit=crop",
    imageAlt: "NexGami Metavirus Web3 GameFi community",
  },
  {
    id: "bitget",
    icon: Users,
    iconLabel: "BITGET EXCHANGE",
    title: "Customer feedback intelligence and trader support for the French market.",
    description:
      "Analyzed qualitative and quantitative user feedback, escalated UX bottlenecks to product developers, and resolved customer support tickets during peak volatility.",
    meta: "Customer Feedback Specialist, 2023",
    imageRatio: 1024 / 680,
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1024&auto=format&fit=crop",
    imageAlt: "Bitget customer feedback and French support",
  },
  {
    id: "amphor",
    icon: ShieldCheck,
    iconLabel: "AMPHOR.IO",
    title: "DeFi vault protocol moderation and anti-phishing protection.",
    description:
      "Managed English community operations, screened suspicious links and bad actors, and provided responsive user assistance for vault deposits and yield strategies.",
    meta: "English Community Manager, May 2024 – Apr 2025",
    imageRatio: 1024 / 680,
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1024&auto=format&fit=crop",
    imageAlt: "Amphor.io DeFi protocol community moderation",
  },
  {
    id: "azen",
    icon: Rocket,
    iconLabel: "AZEN",
    title: "Business development & social growth in the decentralized ecosystem.",
    description:
      "Formulated growth strategies to increase visibility, negotiated strategic co-marketing partnerships, and moderated community discussions.",
    meta: "English CM & Business Developer, Dec 2023 – Aug 2024",
    imageRatio: 1024 / 680,
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1024&auto=format&fit=crop",
    imageAlt: "AZEN Web3 business development",
  },
  {
    id: "binance-coinex",
    icon: Award,
    iconLabel: "BINANCE & COINEX",
    title: "Grassroots Web3 advocacy and educational onboarding campaigns.",
    description:
      "Conducted onboarding webinars and educational threads, represented exchanges, and guided newcomers through secure crypto wallet setup and trading.",
    meta: "Brand Ambassador, 2021 – 2023",
    imageRatio: 1024 / 680,
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1024&auto=format&fit=crop",
    imageAlt: "Binance and CoinEx Web3 community advocacy",
  },
];

const INFINITE_MENU_ITEMS = [
  {
    image:
      "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=600&h=600&fit=crop&auto=format",
    link: "https://gate.io/",
    title: "Gate.io Exchange",
    description: "French CM, Community Growth & AMAs",
  },
  {
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&h=600&fit=crop&auto=format",
    link: "https://twitter.com/guyletibro",
    title: "NexGami & Metavirus",
    description: "GameFi Community Lead & Moderation",
  },
  {
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=600&h=600&fit=crop&auto=format",
    link: "https://bitget.com/",
    title: "Bitget Exchange",
    description: "Customer Feedback Specialist",
  },
  {
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=600&h=600&fit=crop&auto=format",
    link: "https://amphor.io/",
    title: "Amphor.io Protocol",
    description: "DeFi Vault Moderation & Security",
  },
  {
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=600&h=600&fit=crop&auto=format",
    link: "https://twitter.com/guyletibro",
    title: "AZEN Network",
    description: "Business Development & Web3 Growth",
  },
  {
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&h=600&fit=crop&auto=format",
    link: "https://binance.com/",
    title: "Binance & CoinEx",
    description: "Web3 Ambassador & Advocacy",
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
            <span>02 • Projets & Réalisations</span>
          </div>
          <div className="h-8 w-[1px] bg-gradient-to-b from-foreground/50 to-foreground/20" />
        </div>
      ) : null}

      {withHeadline ? (
        <div className="mx-auto w-full max-w-275 px-6 sm:px-10">
          <FadeIn className="flex flex-col items-center gap-4 text-center pb-4 sm:pb-6">
            <h2 className="font-serif text-[2.5rem] font-medium leading-[1.05] tracking-tight text-foreground md:text-[3rem] lg:text-[3.5rem]">
              Featured projects & cases
            </h2>
            <p className="max-w-[36ch] text-[18px] leading-[1.45] tracking-tight text-foreground/65 sm:text-[20px]">
              High-impact Web3 communities, exchange growth campaigns, and customer support operations I&rsquo;ve led.
            </p>
            {viewMoreVisible ? (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-foreground/50">
                <Sparkles className="h-3.5 w-3.5 text-foreground/60" />
                <span>Faites glisser librement la sphère pour explorer les projets</span>
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

      {viewMoreVisible ? (
        <div className="mx-auto w-full max-w-275 px-6 sm:px-10">
          <div className="mt-6 flex justify-center sm:mt-10">
            <Link
              href="/projects"
              className="border border-foreground/8 focus-ring group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 shadow-sm"
            >
              View all project details
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
              <span>03 • Prendre Contact</span>
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
