import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, SiteFrame } from "@/components/site/shell";
import { listJobs } from "@/lib/jigsaw/server";
import { prettyDate } from "@/lib/jigsaw/format";
import type { JobPost } from "@/lib/jigsaw/types";

export const Route = createFileRoute("/careers")({ component: Careers });

function Careers() {
  const [jobs, setJobs] = useState<JobPost[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    listJobs()
      .then((rows) => {
        if (!cancelled) setJobs(rows);
      })
      .catch(() => {
        if (!cancelled) setError("Open roles could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteFrame>
      <PageIntro
        kicker="Careers"
        title="Come work on the system you will use on Monday."
        lede="Roles are listed from the company record, not a slide. Write to us through the contact page and name the seat."
      />
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {error ? <p className="text-copper">{error}</p> : null}
        {jobs === null && !error ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-lg bg-bone-deep" />
            <div className="h-24 animate-pulse rounded-lg bg-bone-deep" />
          </div>
        ) : null}
        <ul className="space-y-3">
          {jobs?.map((job) => (
            <li key={job.id} className="rounded-lg border border-line bg-paper p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-2xl">{job.title}</h2>
                <p className="text-sm text-muted">{prettyDate(job.postedAt)}</p>
              </div>
              <p className="mt-1 text-sm text-jade">
                {job.departmentName} · {job.location} · {job.employmentType}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">{job.summary}</p>
            </li>
          ))}
        </ul>
        <Link
          to="/contact"
          className="mt-8 inline-flex min-h-11 items-center rounded-md bg-jade px-4 text-sm font-medium text-paper"
        >
          Apply through contact
        </Link>
      </div>
    </SiteFrame>
  );
}
