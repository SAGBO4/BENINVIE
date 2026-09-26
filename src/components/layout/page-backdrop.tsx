"use client";

import type { ReactNode } from "react";
import { ShaderFlow } from "../shaders/shader-flow";

export function PageBackdrop(): ReactNode {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[800px] overflow-hidden"
    >
      <div className="absolute inset-0 opacity-40 md:opacity-75">
        <ShaderFlow
          brightness={2.2}
          iterations={12}
          flowSpeed={[0.04, 0.08]}
          colorLowA={[0.0, 0.45, 0.25]}
          colorHighA={[0.85, 0.12, 0.22]}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950" />
    </div>
  );
}
