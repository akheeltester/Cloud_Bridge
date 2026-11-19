import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteFrame } from "@/components/site/shell";

export const Route = createFileRoute("/")({ component: Home });

const SERVICES = [
  {
    n: "01",
    title: "Workforce systems",
    copy: "A directory with roles that the server actually enforces. People, managers, and HR do not share one view.",
  },
  {
    n: "02",
    title: "Document room",
    copy: "Company files, team files, and private files. Uploads are typed, sized, and written down in the audit log.",
  },
  {
    n: "03",
    title: "Studio delivery",
    copy: "We sit with a client HR team and replace the shared drive without losing the month.",
  },
];

function Home() {
  return (
    <SiteFrame>
      <section className="mx-auto grid max-w-6xl items-end gap-10 px-4 pt-14 pb-8 sm:px-6 sm:pt-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-sm font-medium tracking-wide text-copper">Lisbon · Singapore · Chicago</p>
          <h1 className="mt-3 font-display text-5xl leading-none text-ink sm:text-7xl">
            Every piece of the company, in its place.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Jigsaw is the workplace-systems firm we run on ourselves: a public company site, an employee
            directory, and a document room with real roles. Not a shared drive with a nicer folder name.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/services"
              className="inline-flex min-h-11 items-center rounded-md bg-jade px-4 text-sm font-medium text-paper"
            >
              See the work
            </Link>
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center rounded-md border border-line bg-paper px-4 text-sm font-medium"
            >
              Employee sign in
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="grid grid-cols-4 gap-2 rounded-lg border border-line bg-paper p-3">
            {Array.from({ length: 16 }, (_, index) => {
              const filled = [0, 5, 6, 10, 15].includes(index);
              const quiet = [1, 4, 9, 12].includes(index);
              return (
                <div
                  key={index}
                  className={
                    filled
                      ? "aspect-square rounded-sm bg-jade"
                      : quiet
                        ? "aspect-square rounded-sm bg-jade-soft"
                        : "aspect-square rounded-sm bg-bone-deep"
                  }
                />
              );
            })}
          </div>
          <p className="mt-3 text-sm text-muted">The mark is the product: pieces that only fit one way.</p>
        </div>
      </section>

      <section className="border-y border-line bg-paper">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
          {[
            ["2016", "Studio opened in Lisbon"],
            ["3", "Cities, one directory"],
            ["0", "Shared admin passwords"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-display text-4xl tabular-nums text-jade">{value}</p>
              <p className="mt-1 text-sm text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl sm:text-4xl">What we put in place</h2>
          <Link to="/services" className="hidden text-sm text-jade sm:inline">
            All services
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {SERVICES.map((service) => (
            <article key={service.n} className="rounded-lg border border-line bg-paper p-5">
              <p className="font-display text-copper">{service.n}</p>
              <h3 className="mt-4 font-display text-2xl">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{service.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-night text-night-fg">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm text-jade-bright">Inside the portal</p>
            <h2 className="mt-3 font-display text-4xl">The same company, after you sign in.</h2>
            <p className="mt-4 max-w-md text-night-muted">
              Employees see the directory and their own files. Managers see their team. People
              administrators keep departments, roles, and the audit log. Buttons do not decide access.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-md bg-jade-bright px-4 text-sm font-medium text-night"
            >
              Open the portal <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <ul className="divide-y divide-night-line rounded-lg border border-night-line">
            {[
              ["Directory", "Everyone signed in"],
              ["Own profile", "Phone, location, a short bio"],
              ["Team records", "Managers, direct reports only"],
              ["Departments & roles", "People administrators"],
              ["Audit log", "Admins, and a narrower view for managers"],
            ].map(([title, note]) => (
              <li key={title} className="flex items-baseline justify-between gap-4 px-4 py-4">
                <span>{title}</span>
                <span className="text-right text-sm text-night-muted">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl">Four open seats.</h2>
        <p className="max-w-xl text-ink-soft">
          Engineering in Lisbon, people operations in Chicago, delivery in Singapore, and a contract
          brand seat back in the studio.
        </p>
        <Link to="/careers" className="text-sm font-medium text-jade">
          Read the roles
        </Link>
      </section>
    </SiteFrame>
  );
}
