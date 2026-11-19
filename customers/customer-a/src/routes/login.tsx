import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { authClient, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Mark } from "@/components/mark";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { errorText } from "@/lib/jigsaw/format";
import { guardAuthAttempt, recordAuthFailure } from "@/lib/jigsaw/server";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (!isPending && user) return <RedirectToSignIn to="/portal" />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await guardAuthAttempt({ data: { email } });
      if (mode === "up") {
        if (name.trim().length < 2) throw new Error("Add the name you want on the directory.");
        if (password.length < 10 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
          throw new Error("Use at least 10 characters, with a letter and a number.");
        }
        const result = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim(),
          callbackURL: "/portal",
        });
        if (result.error) {
          await recordAuthFailure({ data: { email } }).catch(() => undefined);
          throw new Error(result.error.message || "Could not create the account.");
        }
      } else {
        const result = await authClient.signIn.email({
          email: email.trim(),
          password,
          callbackURL: "/portal",
        });
        if (result.error) {
          await recordAuthFailure({ data: { email } }).catch(() => undefined);
          throw new Error(result.error.message || "Email or password does not match.");
        }
      }
      await navigate({ to: "/portal" });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-bone lg:grid-cols-2">
      <section className="flex flex-col justify-between px-6 py-8 sm:px-12">
        <Link to="/" className="flex items-center gap-2 font-display text-xl">
          <Mark className="size-7 text-jade" />
          Jigsaw
        </Link>
        <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm space-y-4 py-10">
          <div>
            <h1 className="font-display text-4xl">
              {mode === "up" ? "Create your staff account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              The first account becomes the people administrator. Later accounts start as employees.
              There is no shared default password.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-md bg-bone-deep p-1 text-sm">
            <button
              type="button"
              className={`min-h-10 rounded-sm ${mode === "up" ? "bg-paper" : ""}`}
              onClick={() => setMode("up")}
            >
              Create account
            </button>
            <button
              type="button"
              className={`min-h-10 rounded-sm ${mode === "in" ? "bg-paper" : ""}`}
              onClick={() => setMode("in")}
            >
              Sign in
            </button>
          </div>
          {mode === "up" ? (
            <Field label="Name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          ) : null}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "up" ? "new-password" : "current-password"}
            required
          />
          {error ? <p className="text-sm text-copper">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending || isPending}>
            {pending ? "Working…" : mode === "up" ? "Create account" : "Sign in"}
          </Button>
          <div className="space-y-2 pt-2">
            {GROK_PROVIDERS.map((provider) => (
              <Button
                key={provider.providerId}
                type="button"
                variant="line"
                className="w-full"
                onClick={() => signIn(provider.providerId, { callbackURL: "/portal" })}
              >
                Continue with {provider.label}
              </Button>
            ))}
          </div>
        </form>
        <p className="text-sm text-muted">
          <Link to="/trust" className="underline-offset-4 hover:underline">
            How sign-in and roles work
          </Link>
        </p>
      </section>
      <section className="hidden bg-night text-night-fg lg:flex lg:flex-col lg:justify-end lg:p-12">
        <p className="font-display text-5xl leading-tight">Staff entrance.</p>
        <p className="mt-4 max-w-sm text-night-muted">
          Directory, departments, documents, and the audit log live behind this door. The public site
          stays open.
        </p>
      </section>
    </main>
  );
}
