import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, SiteFrame } from "@/components/site/shell";

export const Route = createFileRoute("/services")({ component: Services });

const ITEMS = [
  {
    title: "Workforce systems",
    points: [
      "Employee directory with department, manager, and status.",
      "Three roles: employee, manager, people administrator.",
      "Managers update their direct reports. They do not rewrite the org chart.",
      "Every sensitive change is written to an audit log.",
    ],
  },
  {
    title: "Document room",
    points: [
      "Private, team, and company visibility.",
      "PDF, PNG, JPEG, plain text, and CSV. 750 KB ceiling.",
      "The file type is checked against the bytes, not just the name.",
      "Downloads of authorized files are recorded.",
    ],
  },
  {
    title: "Studio delivery",
    points: [
      "A public company site: about, services, careers, contact.",
      "A staff portal on the same identity, not a second product login.",
      "Rollout alongside the client’s people team, usually ninety days.",
      "We leave when the directory matches how the company already works.",
    ],
  },
];

function Services() {
  return (
    <SiteFrame>
      <PageIntro
        kicker="Services"
        title="Three pieces. They are meant to lock."
        lede="Most vendors sell a portal, a website, and a file share as three contracts. Jigsaw treats them as one company environment."
      />
      <div className="mx-auto max-w-6xl space-y-4 px-4 pb-16 sm:px-6">
        {ITEMS.map((item, index) => (
          <article key={item.title} className="grid gap-6 rounded-lg border border-line bg-paper p-6 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-sm text-copper">0{index + 1}</p>
              <h2 className="mt-2 font-display text-3xl">{item.title}</h2>
            </div>
            <ul className="space-y-3 text-sm leading-relaxed text-ink-soft md:col-span-8">
              {item.points.map((point) => (
                <li key={point} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
        <p className="pt-4 text-sm text-muted">
          Hiring for the team that does this? <Link to="/careers" className="text-jade">See open roles.</Link>
        </p>
      </div>
    </SiteFrame>
  );
}
