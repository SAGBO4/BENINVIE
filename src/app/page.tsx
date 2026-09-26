"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/auth-session";
import {
  ShieldAlert,
  Building2,
  Stethoscope,
  HeartHandshake,
  Activity,
  Pill,
  Lock,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle,
  Zap,
  PhoneCall,
  QrCode,
  Droplet,
  Compass,
  Coins,
  ChevronRight,
} from "lucide-react";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";
import { BmmTelemetryRadar } from "@/components/hero/bmm-telemetry-radar";

type FeatureCard = {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: typeof ShieldAlert;
  color: string;
  accent: string;
  link: string;
};

const PILLIERS: FeatureCard[] = [
  {
    id: "urgence",
    badge: "Règle d'or nationale",
    title: "Paiement Différé & Bris de Glace",
    description:
      "Zéro refus d'admission pour motif financier. Déverrouillage d'urgence en 1 clic des constantes vitales avec traçabilité inaltérable APDP.",
    icon: ShieldAlert,
    color: "from-red-600 to-rose-700",
    accent: "text-red-500",
    link: "/login",
  },
  {
    id: "hemora",
    badge: "Souveraineté Transfusionnelle",
    title: "Chaîne HEMORA & Matching Haversine",
    description:
      "Matching géodésique < 45 km, surveillance temps réel des stocks de sang dans les 77 communes et défraiement forfaitaire 2 000 FCFA Mobile Money.",
    icon: Droplet,
    color: "from-pink-600 to-red-600",
    accent: "text-pink-500",
    link: "/projects",
  },
  {
    id: "fhir",
    badge: "Continuité des Soins",
    title: "Carnet HL7 FHIR & Cartographie IASO",
    description:
      "Dossier patient numérique unique adossé au NPI ANIP, interconnectant le CHIC Calavi, CNHU, CHD et les 600 centres de santé d'arrondissement.",
    icon: Stethoscope,
    color: "from-blue-600 to-indigo-600",
    accent: "text-blue-500",
    link: "/login",
  },
  {
    id: "mta",
    badge: "Filière Innovante ARS",
    title: "Pharmacopée & Ordonnances MTA",
    description:
      "Registre national des tradipraticiens accrédités, catalogue des Médicaments Traditionnels Améliorés certifiés et prescriptions QR infalsifiables.",
    icon: Pill,
    color: "from-amber-600 to-yellow-600",
    accent: "text-amber-500",
    link: "/login",
  },
  {
    id: "pwa-asc",
    badge: "Inclusion Territoriale",
    title: "IA Multilingue & PWA 16 000 ASC",
    description:
      "Triage vocal précoce en Bariba, Fon, Yoruba et Dendi fonctionnant hors-ligne, articulé aux transferts monétaires fléchés GBESSOKE post-CPN.",
    icon: Activity,
    color: "from-emerald-600 to-teal-700",
    accent: "text-emerald-500",
    link: "/projects#scenario",
  },
];

const ACTORS_SHORTCUTS = [
  { role: "MINISTERE" as UserRole, name: "Ministère de la Santé", roleLabel: "Super-Admin", icon: Building2, color: "text-blue-500" },
  { role: "ARS" as UserRole, name: "Régulateur ARS", roleLabel: "Accréditations & MTA", icon: Pill, color: "text-amber-500" },
  { role: "APDP" as UserRole, name: "Auditeur APDP", roleLabel: "Sécurité & Bris de Glace", icon: Lock, color: "text-purple-500" },
  { role: "MEDECIN" as UserRole, name: "Médecin / Urgentiste", roleLabel: "Urgences & Soins", icon: Stethoscope, color: "text-red-500" },
  { role: "ASC" as UserRole, name: "Agent de Santé (ASC)", roleLabel: "Terrain PWA & Triage", icon: Activity, color: "text-emerald-500" },
  { role: "PATIENT" as UserRole, name: "Espace Patient", roleLabel: "Carnet HL7 FHIR & ARCH", icon: HeartHandshake, color: "text-pink-500" },
  { role: "PHARMACIE" as UserRole, name: "Officine Agréée", roleLabel: "Scan Ordonnance ARCH", icon: QrCode, color: "text-cyan-500" },
];

export default function HomePage(): ReactNode {
  const { loginAs } = useAuth();

  return (
    <main id="main-content" className="flex flex-1 flex-col overflow-hidden">
      {/* 1. HERO SECTION MAJESTUEUSE */}
      <section className="relative w-full pt-36 pb-20 sm:pt-48 sm:pb-32 px-4 sm:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Texte Gauche */}
            <FadeIn className="flex flex-col gap-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-500/25 bg-background/80 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 backdrop-blur-md shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="uppercase tracking-wider">Système d&apos;Information Sanitaire Intégré du Bénin</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-foreground">
                Gbɛ (BENINVIE) <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500">
                  Chaque vie compte.
                </span>{" "}
                <br />
                Chaque urgence prise en charge.
              </h1>

              <p className="max-w-[46ch] text-base sm:text-lg leading-relaxed text-foreground/75">
                La plateforme souveraine de santé numérique unifiant la prise en charge vitale immédiate sans caution, la chaîne transfusionnelle <strong>HEMORA</strong>, le dossier <strong>HL7 FHIR</strong> et la valorisation sécurisée de la <strong>pharmacopée traditionnelle béninoise</strong>.
              </p>

              {/* Boutons d'Action Principaux */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <Lock className="h-4 w-4" />
                  <span>Se connecter à mon espace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-foreground/15 bg-background/70 hover:bg-background px-6 py-3.5 text-sm font-semibold text-foreground backdrop-blur-md transition-all hover:border-red-500/40"
                >
                  <Droplet className="h-4 w-4 text-red-500" />
                  <span>Consoles HEMORA & Urgences</span>
                </Link>

                <Link
                  href="/projects#scenario"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground/5 hover:bg-foreground/10 px-5 py-3.5 text-xs font-semibold text-foreground/80 transition-colors"
                >
                  <Compass className="h-4 w-4 text-amber-500" />
                  <span>Parcours Bio à Kalalé</span>
                </Link>
              </div>

              {/* Badges de Confiance Institutionnelle */}
              <div className="pt-4 border-t border-foreground/10 flex flex-wrap items-center gap-6 text-xs text-foreground/60">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Ministère de la Santé
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle className="h-4 w-4 text-amber-500" /> Régulation ARS
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle className="h-4 w-4 text-purple-500" /> Conformité APDP
                </span>
              </div>
            </FadeIn>

            {/* Radar Télémétrique Droite */}
            <ScaleUnblur className="lg:col-span-5 flex justify-center">
              <div className="relative aspect-square w-full max-w-[420px] rounded-4xl border border-foreground/10 bg-background/60 p-4 shadow-2xl backdrop-blur-xl">
                <BmmTelemetryRadar />
              </div>
            </ScaleUnblur>
          </div>
        </div>
      </section>

      {/* 2. BARRE D'INDICATEURS NATIONAUX EN DIRECT */}
      <section className="w-full border-y border-foreground/10 bg-foreground/2 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">77</span>
            <span className="text-xs uppercase font-bold text-emerald-500 mt-1">Communes Interconnectées</span>
            <span className="text-[11px] text-foreground/50">Cartographie sanitaire IASO</span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">16 000</span>
            <span className="text-xs uppercase font-bold text-blue-500 mt-1">ASC Équipés en PWA</span>
            <span className="text-[11px] text-foreground/50">Santé communautaire hors-ligne</span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">0 FCFA</span>
            <span className="text-xs uppercase font-bold text-red-500 mt-1">Caution en Urgence Vitale</span>
            <span className="text-[11px] text-foreground/50">Zéro refus d&apos;admission garanti</span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">&lt; 45 km</span>
            <span className="text-xs uppercase font-bold text-amber-500 mt-1">Matching HEMORA</span>
            <span className="text-[11px] text-foreground/50">Calcul géodésique Haversine</span>
          </div>
        </div>
      </section>

      {/* 3. SECTION LES 5 PILIERS NATIONAUX */}
      <section id="piliers" className="w-full py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <FadeIn className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-500 mb-3 border border-emerald-500/20">
            Programme d&apos;Action National 2026-2031
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Les 5 Piliers Stratégiques de la Plateforme
          </h2>
          <p className="mt-3 text-sm sm:text-base text-foreground/70">
            Une architecture unifiée répondant concrètement aux défis d&apos;équité, de rapidité et de souveraineté sanitaire.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLIERS.map((pil) => {
            const Icon = pil.icon;
            return (
              <div
                key={pil.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-foreground/10 bg-background/80 hover:border-emerald-500/40 p-6 shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className={`h-6 w-6 ${pil.accent}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-foreground/5 text-foreground/70">
                      {pil.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                    {pil.title}
                  </h3>
                  <p className="text-xs text-foreground/65 mt-2 leading-relaxed">
                    {pil.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-foreground/5 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Link href={pil.link} className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Explorer le module</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. ACCÈS DIRECT PAR ACTEUR (DEMO FLOW SHORTCUTS) */}
      <section className="w-full py-20 px-4 sm:px-8 bg-foreground/2 border-t border-foreground/10">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Accès Dédié par Profil Métier
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-foreground/60">
              Chaque acteur dispose d&apos;un flux de travail sur-mesure conforme à ses habilitations légales.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {ACTORS_SHORTCUTS.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.role}
                  onClick={() => loginAs(act.role)}
                  className="p-4 rounded-2xl border border-foreground/10 bg-background/80 hover:border-emerald-500/50 hover:bg-background text-left transition-all duration-200 flex flex-col justify-between gap-3 group backdrop-blur-md"
                >
                  <div className="h-9 w-9 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className={`h-5 w-5 ${act.color}`} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block group-hover:text-emerald-500 transition-colors">
                      {act.name}
                    </span>
                    <span className="text-[10px] text-foreground/50 block mt-0.5">
                      {act.roleLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FOOTER OFFICIEL */}
      <footer className="w-full py-12 px-4 sm:px-8 border-t border-foreground/10 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-foreground/60">
          <div className="flex items-center gap-3">
            <span className="font-bold text-foreground text-sm">Gbɛ (BENINVIE)</span>
            <span>•</span>
            <span>Système d&apos;Information Sanitaire Intégré de la République du Bénin</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors font-medium">
              Espace Connexion
            </Link>
            <Link href="/projects" className="hover:text-foreground transition-colors font-medium">
              Consoles HEMORA
            </Link>
            <a href="tel:136" className="text-red-500 font-bold hover:underline">
              Ligne Verte 136 (Gratuit)
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
