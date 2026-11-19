import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useActorState } from "@/components/portal/shell";
import { errorText, prettyDate } from "@/lib/jigsaw/format";
import { roleLabel } from "@/lib/jigsaw/permissions";
import { getDashboard } from "@/lib/jigsaw/server";
import type { Dashboard } from "@/lib/jigsaw/types";

export const Route = createFileRoute("/portal/")({ component: Overview });

function Overview() {
  const { actor } = useActorState();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getDashboard()
      .then((dashboard) => {
        if (!cancelled) setData(dashboard);
      })
      .catch((err) => {
        if (!cancelled) setError(errorText(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-jade-bright">{roleLabel(actor.role)}</p>
        <h1 className="mt-1 font-display text-4xl">Hello, {actor.fullName.split(" ")[0]}.</h1>
        <p className="mt-2 max-w-xl text-sm text-night-muted">
          {actor.title} · {actor.location}. Your profile is in the directory if you want to change what
          colleagues can see.
        </p>
      </div>
      {error ? <p className="text-sm text-copper">{error}</p> : null}
      {!data && !error ? <div className="h-40 animate-pulse rounded-lg bg-night-raise" /> : null}
      {data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["People", String(data.headcount)],
              ["Active", String(data.active)],
              ["On leave", String(data.onLeave)],
              ["Files you can open", String(data.documentCount)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-night-line bg-night-raise p-4">
                <p className="text-sm text-night-muted">{label}</p>
                <p className="mt-2 font-display text-4xl tabular-nums">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-5">
            <section className="rounded-lg border border-night-line bg-night-raise p-4 lg:col-span-3">
              <h2 className="text-sm text-night-muted">Headcount by department</h2>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byDepartment}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "var(--color-night-muted)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      width={28}
                      tick={{ fill: "var(--color-night-muted)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Bar dataKey="count" fill="var(--color-jade-bright)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section className="rounded-lg border border-night-line bg-night-raise p-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm text-night-muted">Recent arrivals</h2>
                <Link to="/portal/directory" className="text-sm text-jade-bright">
                  Directory
                </Link>
              </div>
              <ul className="mt-3 divide-y divide-night-line">
                {data.recent.map((person) => (
                  <li key={person.id} className="py-3">
                    <Link to="/portal/people/$employeeId" params={{ employeeId: person.id }} className="block">
                      <span className="block text-sm">{person.fullName}</span>
                      <span className="block text-xs text-night-muted">
                        {person.title} · {prettyDate(person.startDate)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-night-muted">{data.openRoles} open roles on the public site.</p>
            </section>
          </div>
          {actor.role === "hr" ? (
            <section className="rounded-lg border border-night-line bg-night-raise p-4">
              <h2 className="text-sm text-night-muted">Messages from the site</h2>
              {data.messages.length === 0 ? (
                <p className="mt-3 text-sm text-night-muted">No one has written through the contact form yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {data.messages.map((note) => (
                    <li key={note.id} className="border-t border-night-line pt-3 first:border-t-0 first:pt-0">
                      <p className="text-sm">
                        {note.name} · {note.email}
                        {note.company ? ` · ${note.company}` : ""}
                      </p>
                      <p className="mt-1 text-sm text-night-muted">{note.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
