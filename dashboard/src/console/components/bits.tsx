import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import type { Severity, WorkStatus } from "../lib/cloudbridge/data";

const workLabel: Record<WorkStatus, string> = {
  implemented: "Implemented",
  "in-progress": "In progress",
  planned: "Planned",
  "tested-locally": "Tested locally",
  deployed: "Deployed",
  "demo-data": "Demo data",
};

const workTone: Record<WorkStatus, string> = {
  implemented: "bg-ok-soft text-ok",
  "in-progress": "bg-spruce-soft text-spruce-ink",
  planned: "bg-paper text-muted",
  "tested-locally": "bg-info-soft text-info",
  deployed: "bg-ok-soft text-ok",
  "demo-data": "bg-warn-soft text-ink",
};

const severityTone: Record<Severity, string> = {
  critical: "bg-danger-soft text-danger",
  high: "bg-danger-soft text-danger",
  medium: "bg-warn-soft text-warn",
  low: "bg-info-soft text-spruce-ink",
  info: "bg-paper text-muted",
};

export function StatusPill({ status }: { status: WorkStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-chip px-2 py-0.5 text-xs font-semibold", workTone[status])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {workLabel[status]}
    </span>
  );
}

export function SeverityPill({ severity }: { severity: Severity }) {
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);
  return (
    <span className={cn("inline-flex rounded-chip px-2 py-0.5 text-xs font-semibold", severityTone[severity])}>{label}</span>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("cb-elev rounded-panel border border-line bg-sheet p-4", className)}>{children}</section>;
}

export function PageIntro({
  index,
  title,
  lede,
}: {
  index: string;
  title: string;
  lede: string;
}) {
  const crumb = index.split("·").pop()?.trim() || index;
  return (
    <header className="mb-4">
      <p className="text-xs text-muted">CloudBridge / {crumb}</p>
      <h1 className="mt-1 text-xl font-semibold text-ink">{title}</h1>
      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">{lede}</p>
    </header>
  );
}

export function EmptyNote({ query }: { query: string }) {
  if (!query.trim()) return null;
  return (
    <p className="rounded-panel border border-dashed border-line-strong bg-sheet px-4 py-6 text-sm text-muted">
      Nothing here matches “{query.trim()}”.
    </p>
  );
}

export function Meter({ value, tone = "spruce" }: { value: number; tone?: "spruce" | "warn" }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 overflow-hidden rounded-chip bg-line" aria-hidden="true">
      <div className={cn("h-full", tone === "warn" ? "bg-warn" : "bg-spruce")} style={{ width: `${width}%` }} />
    </div>
  );
}
