import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, SiteFrame } from "@/components/site/shell";
import { Area, Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { submitContact } from "@/lib/jigsaw/server";
import { errorText } from "@/lib/jigsaw/format";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await submitContact({ data: { name, email, company, message } });
      setSent(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <SiteFrame>
      <PageIntro
        kicker="Contact"
        title="Write to the studio."
        lede="New work, a career note, or a question about how the portal handles roles. People administrators see these messages after they sign in."
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-12">
        <form onSubmit={onSubmit} className="space-y-4 lg:col-span-7">
          {sent ? (
            <p className="rounded-lg border border-line bg-paper p-5 text-ink">
              Received. If you named a role or a company, a people administrator will see it in the portal.
            </p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <Field
                label="Company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Optional"
              />
              <Area
                label="Message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
              />
              {error ? <p className="text-sm text-copper">{error}</p> : null}
              <Button type="submit" disabled={pending}>
                {pending ? "Sending…" : "Send"}
              </Button>
            </>
          )}
        </form>
        <aside className="space-y-3 text-sm text-ink-soft lg:col-span-5">
          <p className="rounded-lg border border-line bg-paper p-5">
            Lisbon studio — Rua da Prata side, by appointment.
          </p>
          <p className="rounded-lg border border-line bg-paper p-5">
            Staff already have an account? Use employee sign-in. Do not send passwords through this form.
          </p>
        </aside>
      </div>
    </SiteFrame>
  );
}
