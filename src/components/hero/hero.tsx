"use client";

import type { ReactNode } from "react";
import { usePortfolio } from "@/lib/portfolio-context";
import { HeroCtas } from "./hero-ctas";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";
import { BmmTelemetryRadar } from "./bmm-telemetry-radar";

export function Hero(): ReactNode {
  const { data } = usePortfolio();
  const p = data.profile;

  return (
    <section className="relative w-full">
      <div className="mx-auto w-full max-w-275 px-6 pt-44 pb-24 sm:px-10 sm:pt-56 sm:pb-32">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-8">
          <FadeIn className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-foreground/10 bg-background/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{p.heroIntro}</span>
            </div>

            <h1 className="text-[2.6rem] font-medium leading-[1.08] tracking-tight text-foreground md:text-[2.5rem] lg:text-[3.4rem]">
              <span className="block">{p.heroTitle1}</span>
              <span className="block text-red-600 dark:text-red-500">{p.heroTitle2}</span>
            </h1>

            <p className="max-w-[42ch] text-[18px] leading-[1.5] tracking-tight text-foreground/75 sm:text-[20px]">
              {p.heroDescription}
            </p>

            <HeroCtas />
          </FadeIn>

          <ScaleUnblur className="flex justify-stretch md:justify-end">
            <div className="relative aspect-square w-full md:max-w-105 overflow-hidden rounded-4xl border border-foreground/8 bg-background p-1.5 shadow-sm">
              <BmmTelemetryRadar />
            </div>
          </ScaleUnblur>
        </div>
      </div>
    </section>
  );
}
