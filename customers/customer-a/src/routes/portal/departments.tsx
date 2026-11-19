import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useActorState } from "@/components/portal/shell";
import { Button } from "@/components/ui/button";
import { Area, Field } from "@/components/ui/field";
import { errorText } from "@/lib/jigsaw/format";
import { listDepartments, saveDepartment } from "@/lib/jigsaw/server";
import type { Department } from "@/lib/jigsaw/types";

export const Route = createFileRoute("/portal/departments")({ component: DepartmentsPage });

function DepartmentsPage() {
  const { actor } = useActorState();
  const [rows, setRows] = useState<Department[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  function load() {
    return listDepartments().then(setRows);
  }

  useEffect(() => {
    let cancelled = false;
    load().catch((err) => {
      if (!cancelled) setError(errorText(err));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Departments</h1>
          <p className="mt-2 max-w-xl text-sm text-night-muted">
            The rooms the directory is sorted into. People administrators can rename them and open a new one.
          </p>
        </div>
        {actor.role === "hr" ? (
          <Button variant="night" onClick={() => setEditing(editing === "new" ? null : "new")}>
            {editing === "new" ? "Close" : "New department"}
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-copper">{error}</p> : null}
      {editing === "new" ? (
        <DepartmentForm
          onDone={() => {
            setEditing(null);
            load().catch((err) => setError(errorText(err)));
          }}
        />
      ) : null}
      {!rows && !error ? <div className="h-40 animate-pulse rounded-lg bg-night-raise" /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {rows?.map((department) => (
          <article key={department.id} className="rounded-lg border border-night-line bg-night-raise p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl">{department.name}</h2>
              <p className="text-sm tabular-nums text-night-muted">{department.headcount}</p>
            </div>
            <p className="mt-1 text-xs tracking-wide text-jade-bright">{department.code}</p>
            <p className="mt-3 text-sm leading-relaxed text-night-muted">{department.description}</p>
            {actor.role === "hr" ? (
              <button
                type="button"
                className="mt-4 text-sm text-jade-bright"
                onClick={() => setEditing(editing === department.id ? null : department.id)}
              >
                {editing === department.id ? "Close" : "Edit"}
              </button>
            ) : null}
            {editing === department.id ? (
              <DepartmentForm
                initial={department}
                onDone={() => {
                  setEditing(null);
                  load().catch((err) => setError(errorText(err)));
                }}
              />
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function DepartmentForm({ initial, onDone }: { initial?: Department; onDone: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await saveDepartment({ data: { id: initial?.id ?? "", name, description } });
      onDone();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <Field night label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
      <Area night label="Description" value={description} onChange={(event) => setDescription(event.target.value)} required />
      {error ? <p className="text-sm text-copper">{error}</p> : null}
      <Button type="submit" variant="night" disabled={pending}>
        {pending ? "Saving…" : "Save department"}
      </Button>
    </form>
  );
}
