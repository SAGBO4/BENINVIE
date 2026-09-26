import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ProgressProps = ComponentProps<"div"> & {
  value: number;
  indicatorClassName?: string;
};

export function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-slate-800",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full bg-emerald-500 transition-all duration-300",
          indicatorClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
