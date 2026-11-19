import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, SiteFrame } from "@/components/site/shell";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <SiteFrame>
      <PageIntro
        kicker="The company"
        title="We built the portal because we were tired of ours."
        lede="Jigsaw started in a Lisbon studio in 2016, fitting org charts to the way teams actually report. The software came later, when the spreadsheets did."
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-12">
        <div className="space-y-4 text-ink-soft lg:col-span-7">
          <p>
            Clients still arrive with a directory in one sheet, contracts in a shared drive, and a
            password taped under a keyboard. We replace that with one employee record, a role, and a
            document room that knows the difference between a team and a company.
          </p>
          <p>
            The site you are on is not a brochure parked next to a different product. Jigsaw staff use
            the same portal we hand to clients. Maya Chen runs people operations from Chicago. Jonas
            Reed’s engineering group ships from Lisbon. Elena Voss delivers from Singapore.
          </p>
          <p>
            There is no default administrator password in this environment. The first person who creates
            an account becomes the people administrator. Everyone after that starts as an employee until
            an administrator changes the role.
          </p>
        </div>
        <aside className="space-y-4 lg:col-span-5">
          {[
            ["Lisbon", "Engineering and studio. The original room."],
            ["Singapore", "Client delivery and a product design seat."],
            ["Chicago", "People operations and finance."],
          ].map(([city, note]) => (
            <div key={city} className="rounded-lg border border-line bg-paper p-5">
              <h2 className="font-display text-2xl">{city}</h2>
              <p className="mt-2 text-sm text-muted">{note}</p>
            </div>
          ))}
        </aside>
      </div>
    </SiteFrame>
  );
}
