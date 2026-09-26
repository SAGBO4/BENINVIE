import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-slate-800 bg-slate-900 text-slate-300",
        neutral: "border-slate-800 bg-slate-900 text-slate-300",
        primary: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        success:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
        warning:
          "border-amber-500/30 bg-amber-500/15 text-amber-400",
        danger: "border-rose-500/30 bg-rose-500/15 text-rose-400",
        destructive: "border-rose-500/30 bg-rose-500/20 text-rose-400 font-bold",
        outline: "border-slate-700 bg-transparent text-slate-300",
        secondary: "border-slate-800 bg-slate-800 text-slate-200",
        benin: "border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-semibold",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}
