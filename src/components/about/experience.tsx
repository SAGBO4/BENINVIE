"use client";

import { usePortfolio } from "@/lib/portfolio-context";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

type Entry = {
  company: string;
  role: string;
  period: string;
  description?: string;
  slug?: string;
  brand?: string;
};

const ENTRIES: Entry[] = [
  {
    company: "Ministère de la Santé & CNTS Bénin",
    role: "Déploiement Intégral 77 Communes & Mobile Money",
    period: "2025 – 2026",
    brand: "#008751",
    description:
      "Généralisation nationale du réseau HEMORA à l'ensemble des 77 communes, interfaçage des passerelles MTN & Moov Money pour le défraiement automatique de 2 000 FCFA et horodatage OTS.",
  },
  {
    company: "Gouvernement de la République du Bénin",
    role: "Promulgation du Décret Bris de Glace (Zéro Refus)",
    period: "2024 – 2025",
    brand: "#FCD116",
    description:
      "Mise en vigueur du mécanisme souverain interdisant tout refus d'urgence transfusionnelle pour motif financier, avec fonds d'apurement garanti par le Trésor Public.",
  },
  {
    company: "CNTS & Centres Hospitaliers Départementaux",
    role: "Extension Régionale Nord-Bénin & Borgou-Alibori",
    period: "2023 – 2024",
    brand: "#E8112D",
    description:
      "Raccordement du CHUD Borgou-Alibori, des hôpitaux de zone de Nikki, Kandi et Natitingou, et expérimentation du dispatch urgent par mototaxis Zémidjans conventionnées.",
  },
  {
    company: "CNTS Cotonou & CNHU-HKM",
    role: "Lancement du Pilote Métropolitain Littoral & Ouémé",
    period: "2022 – 2023",
    brand: "#1B59F8",
    description:
      "Conception de l'algorithme géodésique Haversine, bancs d'essai au CNHU Hubert K. Maga et interconnexion des banques de sang de Cotonou et Porto-Novo.",
  },
];

const COLLAPSED_HEIGHT = 440;

export function Experience(): ReactNode {
  const { data } = usePortfolio();
  const entries = data.experiences && data.experiences.length > 0 ? data.experiences : ENTRIES;
  const [open, setOpen] = useState(true);
  const hiddenCount = Math.max(0, entries.length - 3);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-foreground text-[15px] font-semibold tracking-tight">
        Jalons de Déploiement & Régulation Nationale
      </h3>
      <div
        className={`border-foreground/5 bg-foreground/2 dark:bg-foreground/5 relative overflow-hidden rounded-4xl border px-2 pt-2 sm:px-4 sm:pt-4 ${
          open ? "pb-2 sm:pb-4" : "pb-0"
        }`}
      >
        <motion.div
          className="relative"
          initial={false}
          animate={{
            height: open ? "auto" : COLLAPSED_HEIGHT,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: "hidden" }}
        >
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <li
                key={`${entry.company}-${entry.period}`}
                className="bg-background border-foreground/5 flex items-start gap-4 rounded-3xl border p-3.5 sm:p-4"
              >
                <CompanyLogo entry={entry} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-foreground text-[16px] font-semibold tracking-tight sm:text-[17px]">
                      {entry.company}
                    </span>
                    <span className="text-foreground/55 text-[13px] tracking-tight">
                      {entry.period}
                    </span>
                  </div>
                  <span className="text-foreground/80 mt-0.5 text-[14px] font-medium tracking-tight">
                    {entry.role}
                  </span>
                  {entry.description && (
                    <p className="text-foreground/60 mt-1.5 text-[13px] leading-relaxed tracking-tight sm:text-[13.5px]">
                      {entry.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        <AnimatePresence>
          {!open && (
            <motion.div
              key="fade"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0"
              style={{
                height: 100,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 80%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 80%)",
              }}
            />
          )}
        </AnimatePresence>

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className={`focus-ring text-foreground flex w-full cursor-pointer items-center justify-center gap-1.5 bg-transparent text-[15px] font-medium tracking-tight ${
              open
                ? "relative mt-4"
                : "absolute inset-x-0 bottom-0 z-10 py-3 sm:py-4"
            }`}
          >
            {open ? "Show less" : `Show ${hiddenCount} more`}
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="inline-flex"
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </motion.span>
          </button>
        )}
      </div>
    </div>
  );
}

function CompanyLogo({ entry }: { entry: Entry }): ReactNode {
  const initials = entry.company.charAt(0);
  return (
    <span
      className="ring-foreground/8 inline-flex h-12 w-12 shrink-0 items-center justify-center bg-white ring-1 dark:ring-white/10"
      aria-hidden="true"
      style={{
        borderRadius: 14,
        ...(entry.slug ? {} : { backgroundColor: entry.brand }),
      }}
    >
      {entry.slug ? (
        <img
          src={`https://cdn.simpleicons.org/${entry.slug}`}
          alt=""
          width={24}
          height={24}
          className="h-6 w-6"
          draggable={false}
        />
      ) : (
        <span className="text-[18px] font-semibold tracking-tight text-white">
          {initials}
        </span>
      )}
    </span>
  );
}
