"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (val: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({
  value,
  onValueChange,
  children,
  className,
}: {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-11 items-center justify-start rounded-xl bg-slate-900/90 p-1 text-slate-400 border border-slate-800 gap-1 overflow-x-auto max-w-full",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be within Tabs");

  const isSelected = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-1.5",
        isSelected
          ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
          : "hover:bg-slate-800 hover:text-slate-200 text-slate-400",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be within Tabs");

  if (ctx.value !== value) return null;

  return (
    <div
      className={cn(
        "mt-4 ring-offset-background focus-visible:outline-none animate-in fade-in-50 duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
