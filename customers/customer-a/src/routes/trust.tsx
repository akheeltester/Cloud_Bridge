import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, SiteFrame } from "@/components/site/shell";

export const Route = createFileRoute("/trust")({ component: Trust });

const CONTROLS = [
  {
    title: "Passwords stay hashed",
    copy: "Email accounts are stored with scrypt, a memory-hard hash, through the sign-in service. Jigsaw never keeps a plaintext password, and there is no default administrator login.",
  },
  {
    title: "Sessions are cookies, not tokens in the page",
    copy: "Signed-in sessions use HttpOnly, SameSite cookies. The portal does not ask the browser to hold a password. Cross-site calls into signed-in actions are rejected.",
  },
  {
    title: "Roles are checked on the server",
    copy: "Hiding a button is not a permission. Creating people, changing roles, publishing company files, and reading the audit log are refused by the API when the signed-in role does not allow them.",
  },
  {
    title: "Queries are parameterized",
    copy: "Directory and document lookups pass values as parameters. Input length, email shape, dates, and role names are checked before a write.",
  },
  {
    title: "Sign-in is rate limited",
    copy: "Eight failed attempts for the same email inside fifteen minutes pause the form. The contact form is limited the same way, per email, per hour.",
  },
  {
    title: "Files are small and typed",
    copy: "Uploads are PDF, PNG, JPEG, text, or CSV, at most 750 KB. The server checks the file bytes. Private files stay with the owner. Team files stay with that team. Company files are the only ones everyone signed in can read.",
  },
  {
    title: "Sensitive actions are logged",
    copy: "Creates, edits, role changes, uploads, downloads, and deletes land in the audit log. People administrators see the log. Managers see their own actions and their team’s.",
  },
];

function Trust() {
  return (
    <SiteFrame>
      <PageIntro
        kicker="Trust"
        title="Access is a server decision."
        lede="Jigsaw is also the system we use to show how a small company keeps employee records, files, and sign-in in one place without a shared admin password."
      />
      <div className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:px-6 md:grid-cols-2">
        {CONTROLS.map((item) => (
          <article key={item.title} className="rounded-lg border border-line bg-paper p-5">
            <h2 className="font-display text-2xl">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.copy}</p>
          </article>
        ))}
      </div>
    </SiteFrame>
  );
}
