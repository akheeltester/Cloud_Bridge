import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useActorState } from "@/components/portal/shell";
import { errorText, prettyDate } from "@/lib/jigsaw/format";
import { listAudit } from "@/lib/jigsaw/server";
import type { AuditRow } from "@/lib/jigsaw/types";

export const Route = createFileRoute("/portal/audit")({ component: AuditPage });

function AuditPage() {
  const { actor } = useActorState();
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    listAudit()
      .then((items) => {
        if (!cancelled) setRows(items);
      })
      .catch((err) => {
        if (!cancelled) setError(errorText(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-4xl">Audit</h1>
        <p className="mt-2 max-w-xl text-sm text-night-muted">
          {actor.role === "hr"
            ? "Creates, edits, role changes, uploads, downloads, and deletes across the company."
            : "Your actions, plus changes that touch you or your direct reports."}
        </p>
      </div>
      {error ? <p className="text-sm text-copper">{error}</p> : null}
      {!rows && !error ? <div className="h-40 animate-pulse rounded-lg bg-night-raise" /> : null}
      <ul className="divide-y divide-night-line rounded-lg border border-night-line">
        {rows?.map((row) => (
          <li key={row.id} className="grid gap-1 px-4 py-3 sm:grid-cols-12 sm:items-baseline">
            <p className="text-xs tabular-nums text-night-muted sm:col-span-3">{prettyDate(row.createdAt)}</p>
            <p className="text-sm sm:col-span-3">{row.actorName}</p>
            <p className="text-sm text-jade-bright sm:col-span-2">{row.action}</p>
            <p className="text-sm text-night-muted sm:col-span-4">{row.detail}</p>
          </li>
        ))}
      </ul>
      {rows && rows.length === 0 ? <p className="text-sm text-night-muted">Nothing recorded for your view yet.</p> : null}
    </div>
  );
}
