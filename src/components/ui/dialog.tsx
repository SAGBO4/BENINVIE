"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="animate-rise bg-slate-950/80 fixed inset-0 backdrop-blur-sm"
      />
      <div
        className={cn(
          "bg-slate-900 border-slate-800 text-slate-100 animate-rise relative z-10 my-8 w-full max-w-lg rounded-2xl border shadow-2xl",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5">
          <div className="space-y-1">
            {title ? (
              <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-slate-400 text-xs">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="text-slate-400 hover:bg-slate-800 hover:text-white -mr-1 rounded-lg p-1.5 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
