"use client";

import type { ReactNode } from "react";

export function FadeIn({
  children,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}): ReactNode {
  return (
    <div className={`animate-in fade-in duration-300 ${className || ""}`}>
      {children}
    </div>
  );
}

export function ScaleUnblur({
  children,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}): ReactNode {
  return (
    <div className={`animate-in fade-in duration-300 ${className || ""}`}>
      {children}
    </div>
  );
}
