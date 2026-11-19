import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const styles = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade",
  {
    variants: {
      variant: {
        primary: "bg-jade text-paper hover:bg-jade-deep",
        line: "border border-line bg-paper text-ink hover:bg-bone",
        ghost: "text-ink hover:bg-bone-deep",
        night: "bg-jade-bright text-night hover:bg-paper",
        nightLine: "border border-night-line bg-night-raise text-night-fg hover:bg-night",
      },
      size: {
        md: "min-h-11 px-4",
        sm: "min-h-10 px-3",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof styles>) {
  return <button className={cn(styles({ variant, size }), className)} {...props} />;
}
