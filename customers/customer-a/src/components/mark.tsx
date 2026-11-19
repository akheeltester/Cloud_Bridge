import { cn } from "@/lib/cn";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <rect x="1" y="1" width="13" height="13" rx="2.5" fill="currentColor" />
      <rect x="18" y="1" width="13" height="13" rx="2.5" fill="currentColor" opacity="0.45" />
      <rect x="1" y="18" width="13" height="13" rx="2.5" fill="currentColor" opacity="0.45" />
      <rect x="15.5" y="15.5" width="15.5" height="15.5" rx="2.5" fill="currentColor" />
    </svg>
  );
}
