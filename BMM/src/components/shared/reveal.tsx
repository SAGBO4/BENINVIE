"use client";

import type { ComponentProps, ElementType } from "react";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "scale";

// Le décalage doit se voir sans distraire: à 12 px l'animation passait
// inaperçue, à 24 px la page semblerait sauter.
const HIDDEN: Record<Direction, string> = {
  up: "translate-y-6 opacity-0",
  down: "-translate-y-6 opacity-0",
  left: "-translate-x-6 opacity-0",
  right: "translate-x-6 opacity-0",
  scale: "scale-[0.96] opacity-0",
};

type RevealProps = ComponentProps<"div"> & {
  as?: ElementType;
  delay?: number;
  direction?: Direction;
};

/**
 * Révèle son contenu avec une transition directionnelle lorsqu'il entre dans
 * le viewport. Respecte `prefers-reduced-motion`.
 *
 * L'attribut `data-reveal` sert de point d'accroche au repli sans JavaScript
 * déclaré dans `globals.css`: sans lui, un navigateur qui n'exécute pas le
 * script laisserait ce contenu invisible pour toujours, puisque l'état initial
 * est `opacity-0`.
 */
export function Reveal({
  as,
  delay = 0,
  direction = "up",
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const Component = (as ?? "div") as ElementType;
  // L'observateur déclenche dès qu'un huitième de l'élément entre, avec une
  // marge basse: le mouvement commence pendant la montée, pas une fois
  // l'élément déjà installé au centre de l'écran.
  const { ref, inView } = useInView<HTMLDivElement>({
    threshold: 0.08,
    rootMargin: "0px 0px -4% 0px",
  });

  return (
    <Component
      ref={ref}
      data-reveal=""
      style={{
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0, 0, 0.35, 1)",
        ...style,
      }}
      className={cn(
        "transition-all duration-700 will-change-transform motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-none",
        inView
          ? "translate-x-0 translate-y-0 scale-100 opacity-100"
          : HIDDEN[direction],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
