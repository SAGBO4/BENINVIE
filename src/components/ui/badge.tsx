import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "benin";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles: Record<string, string> = {
    default:
      "border-transparent bg-slate-800 text-slate-100 hover:bg-slate-700",
    secondary:
      "border-transparent bg-slate-800/80 text-slate-300",
    destructive:
      "border-red-500/30 bg-red-500/15 text-red-400 border",
    outline: "text-slate-300 border border-slate-700",
    success:
      "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 border",
    warning:
      "border-amber-500/30 bg-amber-500/15 text-amber-400 border",
    benin:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 border font-semibold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
