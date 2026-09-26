"use client";

import { PortfolioProvider } from "@/lib/portfolio-context";
import { ReducedMotionProvider } from "@/lib/motion";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }): ReactNode {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ReducedMotionProvider>
        <SmoothScroll>
          <PortfolioProvider>{children}</PortfolioProvider>
        </SmoothScroll>
      </ReducedMotionProvider>
    </ThemeProvider>
  );
}
