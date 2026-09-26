"use client";

import type { ReactNode } from "react";
import { usePortfolio } from "@/lib/portfolio-context";
import { HeroCtas } from "./hero-ctas";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";
import { PortraitMorph } from "./portrait-morph";

const PORTRAIT_SRC = "/guy.webp";
const PORTRAIT_HOVER_SRC = "/guy_hover.webp";

export function Hero(): ReactNode {
  const { data } = usePortfolio();
  const p = data.profile;

  return (
    <section className="relative w-full">
      <div className="mx-auto w-full max-w-275 px-6 pt-44 pb-24 sm:px-10 sm:pt-56 sm:pb-32">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-8">
          <FadeIn className="flex flex-col gap-4">
            <p className="text-[20px] leading-tight tracking-tight font-medium text-foreground">
              {p.heroIntro}
            </p>

            <h1 className="text-[2.6rem] font-medium leading-[1.08] tracking-tight text-foreground md:text-[2.5rem] lg:text-[3.4rem]">
              <span className="block">{p.heroTitle1}</span>
              <span className="block">{p.heroTitle2}</span>
            </h1>

            <p className="max-w-[36ch] text-[20px] leading-[1.45] tracking-tight text-foreground/65 sm:text-[22px]">
              {p.heroDescription}
            </p>

            <HeroCtas />
          </FadeIn>

          <ScaleUnblur className="flex justify-stretch md:justify-end">
            <div className="relative aspect-square w-full md:max-w-105 overflow-hidden rounded-4xl border border-foreground/8 bg-background p-1.5 shadow-sm">
              <div className="relative h-full w-full overflow-hidden rounded-[1.6rem]">
                <PortraitMorph
                  srcA={PORTRAIT_SRC}
                  srcB={PORTRAIT_HOVER_SRC}
                  alt="Guy Tibro portrait"
                />
              </div>
            </div>
          </ScaleUnblur>
        </div>
      </div>
    </section>
  );
}
