import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full min-h-11 rounded-md border px-3 text-sm outline-none transition-colors duration-200 focus:border-jade";

export function Field({
  label,
  night,
  className,
  ...props
}: { label: string; night?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className={cn("font-medium", night ? "text-night-fg" : "text-ink")}>{label}</span>
      <input
        className={cn(
          control,
          night
            ? "border-night-line bg-night text-night-fg placeholder:text-night-muted"
            : "border-line bg-paper text-ink placeholder:text-muted",
          className,
        )}
        {...props}
      />
    </label>
  );
}

export function Area({
  label,
  night,
  className,
  ...props
}: { label: string; night?: boolean } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className={cn("font-medium", night ? "text-night-fg" : "text-ink")}>{label}</span>
      <textarea
        className={cn(
          control,
          "min-h-28 py-3",
          night
            ? "border-night-line bg-night text-night-fg placeholder:text-night-muted"
            : "border-line bg-paper text-ink placeholder:text-muted",
          className,
        )}
        {...props}
      />
    </label>
  );
}

export function SelectField({
  label,
  night,
  className,
  children,
  ...props
}: { label: string; night?: boolean } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className={cn("font-medium", night ? "text-night-fg" : "text-ink")}>{label}</span>
      <select
        className={cn(
          control,
          night ? "border-night-line bg-night text-night-fg" : "border-line bg-paper text-ink",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
