"use client";

import { ArrowRight, Download } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { usePortfolio } from "@/lib/portfolio-context";
import { ContactButton } from "@/components/contact/contact-button";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function HeroCtas(): ReactNode {
  const { data } = usePortfolio();
  const cvUrl = data.profile?.cvUrl || "/Tibro_CV.pdf";
  return (
    <LayoutGroup>
      <motion.div
        layout
        transition={{ layout: { duration: 0.55, ease: EASE } }}
        className="mt-2 flex flex-wrap items-center gap-3"
      >
        <ContactButton />

        <motion.div
          layout
          transition={{ layout: { duration: 0.55, ease: EASE } }}
        >
          <Link
            href="/projects"
            className="focus-ring group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700"
          >
            <span>Lancer un Matching d'Urgence</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </motion.div>

        <motion.div
          layout
          transition={{ layout: { duration: 0.55, ease: EASE } }}
        >
          <Link
            href="/projects#stocks"
            className="border border-foreground/10 focus-ring group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 shadow-sm"
          >
            Supervision des Stocks (77 Communes)
          </Link>
        </motion.div>

        <ContactButton />
      </motion.div>
    </LayoutGroup>
  );
}
