import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "benin";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variantStyles: Record<string, string> = {
      default:
        "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 hover:shadow-emerald-900/50",
      destructive:
        "bg-red-600 text-white shadow-lg shadow-red-900/30 hover:bg-red-500 hover:shadow-red-900/50",
      outline:
        "border border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600",
      secondary:
        "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/60",
      ghost: "text-slate-300 hover:bg-slate-800 hover:text-white",
      link: "text-emerald-400 underline-offset-4 hover:underline",
      benin:
        "bg-gradient-to-r from-emerald-600 via-amber-500 to-red-600 text-white font-bold shadow-lg hover:opacity-95",
    };

    const sizeStyles: Record<string, string> = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-12 rounded-2xl px-6 text-base",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
