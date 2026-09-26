import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg text-sm font-semibold",
    "transition-[background-color,color,border-color,box-shadow,transform] duration-200",
    "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500",
        primary:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500",
        secondary:
          "border border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800",
        outline:
          "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800",
        ghost: "text-slate-300 hover:bg-slate-800 hover:text-white",
        danger:
          "bg-rose-600 text-white hover:bg-rose-500",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-500",
        link: "text-emerald-400 hover:text-emerald-300 h-auto p-0 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-5 text-sm",
        lg: "h-11 px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
export type { ButtonProps };
