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
        "bg-slate-800 relative h-2.5 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "bg-primary h-full rounded-full transition-all duration-500 ease-out",
          indicatorClassName
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
